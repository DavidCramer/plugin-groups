import { useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';
import { loadSiteConfig, saveConfig } from '@/api/client';
import { ApiError } from '@/types/api';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { Header } from '@/components/layout/Header';
import { TabNav } from '@/components/layout/TabNav';
import { Toast } from '@/components/layout/Toast';
import { GroupsManagementTab } from '@/components/groups-management/GroupsManagementTab';
import { SettingsTab } from '@/components/settings/SettingsTab';
import { MultisiteTab } from '@/components/multisite/MultisiteTab';

export function App() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { config, tab, isDirty } = state;

  const handleSave = useCallback(async () => {
    dispatch({ type: 'SAVE_START' });
    try {
      await saveConfig(config.saveURL, config.restNonce, {
        groups: config.groups,
        selectedPresets: config.selectedPresets,
        params: config.params,
        sitesEnabled: config.sitesEnabled,
        siteID: config.siteID,
      });
      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : __('Save failed', 'plugin-groups');
      dispatch({ type: 'SAVE_ERROR', message });
    }
  }, [dispatch, config]);

  const handleSiteSwitch = useCallback(
    async (siteId: number) => {
      if (isDirty && !window.confirm(__('Changes that you made may not be saved.', 'plugin-groups'))) {
        return;
      }
      if (!config.loadURL) {
        return;
      }
      dispatch({ type: 'LOAD_SITE_START' });
      try {
        const nextConfig = await loadSiteConfig(config.loadURL, config.restNonce, siteId);
        dispatch({ type: 'REPLACE_CONFIG', config: nextConfig });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : __('Could not load that site', 'plugin-groups');
        dispatch({ type: 'LOAD_SITE_ERROR', message });
      }
    },
    [dispatch, isDirty, config.loadURL, config.restNonce]
  );

  useKeyboardShortcuts({ state, dispatch, onSave: handleSave });
  useUnsavedChanges(isDirty);

  if (tab === 0) {
    return (
      <div className={`${config.slug}`}>
        <div className="bg-brand px-6 py-3 text-white text-sm shadow-sm flex items-center">
          <span className={`inline-flex border-3 border-brand-light border-r-brand-border rounded-full animate-spin mr-2 w-6 h-6`}></span>
          {__('Loading site config…', 'plugin-groups')}
        </div>
      </div>
    );
  }

  return (
    <div className={`${config.slug}  flex flex-col h-full`}>
      <Header onSave={handleSave} onSiteSwitch={handleSiteSwitch} />
      <TabNav />
      {tab === 1 && <GroupsManagementTab />}
      {tab === 2 && <SettingsTab />}
      {tab === 3 && <MultisiteTab />}
      <Toast />
    </div>
  );
}

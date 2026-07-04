import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';
import { exportGroups, parseImportedGroups, readFileAsJson } from '@/utils/groupsIO';
import { MultisiteSiteSwitcher } from './MultisiteSiteSwitcher';

interface HeaderProps {
  onSave: () => void;
  onSiteSwitch: (siteId: number) => void;
}

export function Header ({ onSave, onSiteSwitch }: HeaderProps) {
  const { config, isSaving } = useAppState();
  const dispatch = useAppDispatch();
  const { networkAdmin } = config;

  const handleExport = () => exportGroups(config.groups);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      const data = await readFileAsJson(file);
      const groups = parseImportedGroups(data);
      dispatch({ type: 'IMPORT_GROUPS', groups });
      dispatch({ type: 'SHOW_TOAST', message: __('Groups imported', 'plugin-groups'), variant: 'success' });
    } catch {
      dispatch({ type: 'SHOW_TOAST', message: __('Could not read that file', 'plugin-groups'), variant: 'error' });
    }
  };

  return (
    <div className="bg-brand px-4 py-3 flex items-center gap-3 shadow-sm">
      <h1 className="text-white! py-6! font-semibold text-lg tracking-tight">{config.pluginName}</h1>
      <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded font-mono">{config.version}</span>
      <div className="flex gap-2 ml-4">
        <button type="button" className="btn-secondary text-xs" onClick={onSave} disabled={isSaving}>
          {isSaving ? __('Saving…', 'plugin-groups') : __('Save Settings', 'plugin-groups')}
        </button>
        <button type="button" className="btn-secondary text-xs" onClick={handleExport}>
          {__('Export', 'plugin-groups')}
        </button>
        <label className="btn-secondary text-xs cursor-pointer">
          {__('Import', 'plugin-groups')}
          <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
      </div>
      {networkAdmin && (
        <div className="ml-auto flex items-center gap-2 text-nowrap text-white">
          {__('Switch site', 'plugin-groups')}
          <MultisiteSiteSwitcher onSiteSwitch={onSiteSwitch} />
        </div>
      )}
    </div>
  );
}

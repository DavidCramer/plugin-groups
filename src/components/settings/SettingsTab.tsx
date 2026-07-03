import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';
import type { NavStyle } from '@/types/config';
import { NavStylePreview } from './NavStylePreview';

const NAV_STYLES: Array<{ value: NavStyle; label: string }> = [
  { value: 'subsubsub', label: __('Legacy', 'plugin-groups') },
  { value: 'groups-modern', label: __('Modern', 'plugin-groups') },
  { value: 'groups-dropdown', label: __('Dropdown', 'plugin-groups') },
];

export function SettingsTab() {
  const { config } = useAppState();
  const dispatch = useAppDispatch();
  const { params } = config;

  return (
    <div className="flex gap-4 p-4">
      <div className="w-72 bg-white border border-gray-200 rounded flex-shrink-0">
        <div className="px-4 pt-4 pb-3">
          <div className="section-title">{__('Settings', 'plugin-groups')}</div>
        </div>
        <label className="wp-row flex items-center gap-2 px-4 py-2 border-t border-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={params.legacyGrouping}
            onChange={(event) => dispatch({ type: 'SET_PARAM', param: 'legacyGrouping', value: event.target.checked })}
          />
          <span className="text-sm text-gray-700">{__('Use legacy status based grouping', 'plugin-groups')}</span>
        </label>
        <label className="wp-row flex items-center gap-2 px-4 py-2 border-t border-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={params.menuGroups}
            onChange={(event) => dispatch({ type: 'SET_PARAM', param: 'menuGroups', value: event.target.checked })}
          />
          <span className="text-sm text-gray-700">{__('Enable admin menu', 'plugin-groups')}</span>
        </label>
        <label className="wp-row flex items-center gap-2 px-4 py-2 border-t border-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showUngrouped}
            onChange={(event) => dispatch({ type: 'SET_PARAM', param: 'showUngrouped', value: event.target.checked })}
          />
          <span className="text-sm text-gray-700">{__('Show ungrouped items', 'plugin-groups')}</span>
        </label>
      </div>

      {!params.legacyGrouping && (
        <div className="flex-1 bg-white border border-gray-200 rounded">
          <div className="px-4 pt-4 pb-3">
            <div className="section-title">{__('Navigation style', 'plugin-groups')}</div>
          </div>
          {NAV_STYLES.map(({ value, label }) => (
            <NavStylePreview
              key={value}
              styleName={label}
              navStyle={value}
              active={params.navStyle === value}
              presets={config.presets}
              showUngrouped={params.showUngrouped}
              onSelect={() => dispatch({ type: 'SET_PARAM', param: 'navStyle', value })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

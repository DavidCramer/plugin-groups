import { __ } from '@wordpress/i18n';
import type { NavStyle } from '@/types/config';

interface NavStylePreviewProps {
  styleName: string;
  navStyle: NavStyle;
  active: boolean;
  presets: string[];
  showUngrouped: boolean;
  groupBulkActions: boolean;
  onSelect: () => void;
}

export function NavStylePreview ({
  styleName,
  navStyle,
  active,
  presets,
  showUngrouped,
  groupBulkActions,
  onSelect,
}: NavStylePreviewProps) {
  const preview = [...presets];
  if (showUngrouped) {
    preview.push(__('Ungrouped', 'plugin-groups'));
  }

  return (
    <div
      className={`group-row px-4 py-3 border-b border-gray-100 cursor-pointer ${active ? 'active-group' : ''} plugin-groups`}
      onClick={onSelect}
    >
      <label className="block text-xs font-semibold text-gray-700 mb-2 cursor-pointer">{styleName}</label>
      {navStyle === 'groups-dropdown' ? (
        <select className="wp-input text-xs mb-2!" onClick={(event) => event.stopPropagation()}>
          {preview.map((name, index) => (
            <option key={name}>
              {name} ({index + 1})
            </option>
          ))}
        </select>
      ) : (
        <ul className={`flex flex-wrap ${navStyle} m-0! mb-2!`}>
          {preview.map((name, index) => {
            if (index > 5 && name !== __('Ungrouped', 'plugin-groups')) {
              return null;
            }
            return (
              <li key={name}>
                {'subsubsub' === navStyle && index > 0 && (
                  <span className={'px-2'}>|</span>
                )}
                <a href={'#'} className={`${index === 0 ? 'font-medium text-black!' : ''}`}>
                  {name} ({index + 1})
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {groupBulkActions && (
        <div className="group-bulk-actions mt-2 flex flex-wrap gap-1.5">
          {[__('Activate All', 'plugin-groups'), __('Deactivate All', 'plugin-groups'), __('Update All', 'plugin-groups')].map((label) => (
            <button
              key={label}
              type="button"
              className="button button-secondary button-small"
              onClick={(event) => event.stopPropagation()}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

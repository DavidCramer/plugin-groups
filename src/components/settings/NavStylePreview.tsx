import { __ } from '@wordpress/i18n';
import type { NavStyle } from '@/types/config';

interface NavStylePreviewProps {
  styleName: string;
  navStyle: NavStyle;
  active: boolean;
  presets: string[];
  showUngrouped: boolean;
  onSelect: () => void;
}

export function NavStylePreview({ styleName, navStyle, active, presets, showUngrouped, onSelect }: NavStylePreviewProps) {
  const preview = [...presets];
  if (showUngrouped) {
    preview.push(__('Ungrouped', 'plugin-groups'));
  }

  return (
    <div
      className={`group-row px-4 py-3 border-b border-gray-100 cursor-pointer ${active ? 'active-group' : ''}`}
      onClick={onSelect}
    >
      <label className="block text-xs font-semibold text-gray-700 mb-2 cursor-pointer">{styleName}</label>
      {navStyle === 'groups-dropdown' ? (
        <select className="wp-input text-xs" onClick={(event) => event.stopPropagation()}>
          {preview.map((name, index) => (
            <option key={name}>
              {name} ({index + 1})
            </option>
          ))}
        </select>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {preview.map((name, index) => {
            if (index > 5 && name !== __('Ungrouped', 'plugin-groups')) {
              return null;
            }
            return (
              <li key={name}>
                <span className={`tag ${index === 0 ? '' : 'tag-gray'}`}>
                  {name} ({index + 1})
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';

export function PresetsColumn() {
  const { config } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className="w-56 bg-white flex flex-col flex-shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="section-title">{__('Presets', 'plugin-groups')}</div>
        <p className="text-xs text-gray-500 mt-2">
          {__('Click a preset to create that group and auto-assign matching plugins.', 'plugin-groups')}
        </p>
      </div>
      <div className="overflow-y-auto flex-1 py-1">
        {config.presets.map((preset) => {
          const checked = config.selectedPresets.includes(preset);
          return (
            <label
              key={preset}
              className="preset-row px-4 py-2 flex items-center gap-2 border-b border-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => dispatch({ type: 'TOGGLE_PRESET', presetName: preset })}
              />
              <span className="flex-1 text-sm text-gray-700">{preset}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

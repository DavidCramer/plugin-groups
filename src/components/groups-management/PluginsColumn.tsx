import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useAppState } from '@/state/context';
import { getGroupsForPlugin, isPluginUngrouped } from '@/state/selectors';
import { PluginRow } from './PluginRow';
import { SendToGroupsModal } from './SendToGroupsModal';

/**
 * Left column of Groups Management: the full list of installed plugins with search,
 * an "ungrouped only" filter, and multi-select checkboxes for bulk-assigning the
 * selection to one or more groups via <SendToGroupsModal>. Search/filter/selection
 * are local UI state — only the resulting group assignment is dispatched to the
 * shared config.
 */
export function PluginsColumn () {
  const { config } = useAppState();
  const [search, setSearch] = useState('');
  const [ungroupedOnly, setUngroupedOnly] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [sendModalOpen, setSendModalOpen] = useState(false);

  const allFiles = Object.keys(config.plugins);
  const visibleFiles = allFiles.filter((file) => {
    const plugin = config.plugins[file];
    const matchesSearch =
            !search ||
            plugin.Name.toLowerCase().includes(search.toLowerCase()) ||
            file.toLowerCase().includes(search.toLowerCase());
    const matchesUngrouped = !ungroupedOnly || isPluginUngrouped(config, file);
    return matchesSearch && matchesUngrouped;
  });

  const toggleChecked = (file: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(file)) {
        next.delete(file);
      } else {
        next.add(file);
      }
      return next;
    });
  };

  const allVisibleChecked = visibleFiles.length > 0 && visibleFiles.every((file) => checked.has(file));
  const someVisibleChecked = visibleFiles.some((file) => checked.has(file));

  const toggleSelectAll = (checkedNext: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      visibleFiles.forEach((file) => (checkedNext ? next.add(file) : next.delete(file)));
      return next;
    });
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 flex flex-col gap-2 shrink-0">
        <div className="section-title flex items-center justify-between mb-3">
          <span>{__('Plugins', 'plugin-groups')}</span>
          <span className="count-pill">{visibleFiles.length}</span>
        </div>
        <input
          className="wp-input mb-2"
          type="text"
          placeholder={__('Search plugins…', 'plugin-groups')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 select-none">
            <input
              type="checkbox"
              checked={ungroupedOnly}
              onChange={(event) => setUngroupedOnly(event.target.checked)}
            />
            {__('Ungrouped only', 'plugin-groups')}
          </label>
        </div>
      </div>
      <div className="flex flex-col h-full overflow-auto">
        <div className="px-4 py-2 border-b border-gray-200 flex shrink-0 items-center gap-2 bg-gray-50">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-medium">
            <input
              type="checkbox"
              checked={allVisibleChecked}
              ref={(el) => {
                if (el) {
                  el.indeterminate = someVisibleChecked && !allVisibleChecked;
                }
              }}
              onChange={(event) => toggleSelectAll(event.target.checked)}
            />
            {__('Select all', 'plugin-groups')}
          </label>
          <button
            type="button"
            className="btn-primary text-xs ml-auto"
            disabled={checked.size === 0}
            onClick={() => setSendModalOpen(true)}
          >
            {checked.size ? `${__('Send', 'plugin-groups')} ${checked.size}` : __('Send to Groups', 'plugin-groups')}
          </button>
        </div>

        <div className="flex flex-col h-full overflow-auto">
          {visibleFiles.map((file) => (
            <PluginRow
              key={file}
              file={file}
              plugin={config.plugins[file]}
              groups={getGroupsForPlugin(config, file)}
              checked={checked.has(file)}
              onToggle={toggleChecked}
            />
          ))}
        </div>
      </div>

      {sendModalOpen && (
        <SendToGroupsModal
          pluginFiles={Array.from(checked)}
          onClose={() => setSendModalOpen(false)}
          onAssigned={() => setChecked(new Set())}
        />
      )}
    </div>
  );
}

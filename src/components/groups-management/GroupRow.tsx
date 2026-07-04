import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';
import type { PersistedGroup, GroupUIState } from '@/types/group';
import { GroupPluginRow, PLUGIN_DRAG_MIME } from './GroupPluginRow';
import { KeywordsEditor } from './KeywordsEditor';

export const GROUP_DRAG_MIME = 'application/x-plugin-groups-group';

interface GroupRowProps {
  group: PersistedGroup;
  ui: GroupUIState;
  onReorderDrop: (draggedGroupId: string) => void;
}

export function GroupRow({ group, ui, onReorderDrop }: GroupRowProps) {
  const { config } = useAppState();
  const dispatch = useAppDispatch();
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (event: React.DragEvent<HTMLSpanElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(GROUP_DRAG_MIME, group.id);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const pluginPayload = event.dataTransfer.getData(PLUGIN_DRAG_MIME);
    if (pluginPayload) {
      const { pluginFile, sourceGroupId } = JSON.parse(pluginPayload) as {
        pluginFile: string;
        sourceGroupId: string;
      };
      dispatch({ type: 'MOVE_PLUGIN_BETWEEN_GROUPS', pluginFile, fromGroupId: sourceGroupId, toGroupId: group.id });
      return;
    }
    const draggedGroupId = event.dataTransfer.getData(GROUP_DRAG_MIME);
    if (draggedGroupId && draggedGroupId !== group.id) {
      onReorderDrop(draggedGroupId);
    }
  };

  return (
    <div
      className={`group-row border-b border-gray-200 ${ui.selected ? 'bg-brand-light' : ''} ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_GROUP_OPEN', id: group.id })}>
        <span
          className="shrink-0"
          draggable
          onDragStart={handleDragStart}
          onClick={(event) => event.stopPropagation()}
        >
          <svg className="drag-handle w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </span>
        <input
          type="checkbox"
          checked={!!ui.selected}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => dispatch({ type: 'SELECT_GROUPS', ids: [group.id], selected: event.target.checked })}
        />
        {group.color && (
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: group.color }}
            title={__('Group color', 'plugin-groups')}
          />
        )}
        {ui.editing ? (
          <input
            className="wp-input flex-1"
            data-edit={group.id}
            autoFocus={ui.focusNameInput}
            value={group.name}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => dispatch({ type: 'CHANGE_GROUP_NAME', id: group.id, name: event.target.value })}
            onBlur={() => dispatch({ type: 'COMMIT_GROUP_NAME', id: group.id })}
          />
        ) : (
          <span className="flex-1 font-semibold text-gray-800">{group.name}</span>
        )}
        <span className={`count-pill ${group.plugins.length ? 'green' : ''} mr-2`}>{group.plugins.length}</span>
        {!ui.editing && (
          <button
            type="button"
            className="text-gray-400 hover:text-brand transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              dispatch({ type: 'OPEN_GROUP_MODAL', mode: 'rename', groupId: group.id });
            }}
            title={__('Rename', 'plugin-groups')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${ui.open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {ui.open && (
        <div className="border-t border-gray-200 bg-gray-50">
          {group.plugins.length ? (
            group.plugins.map((file) => (
              <GroupPluginRow
                key={file}
                groupId={group.id}
                file={file}
                plugin={config.plugins[file]}
                onRemove={(pluginFile) =>
                  dispatch({ type: 'REMOVE_PLUGINS_FROM_GROUP', groupId: group.id, pluginFiles: [pluginFile] })
                }
              />
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-gray-400 italic">
              {__('No plugins assigned. Drag plugins here or use "Send to Groups".', 'plugin-groups')}
            </div>
          )}
          <KeywordsEditor group={group} />
        </div>
      )}
    </div>
  );
}

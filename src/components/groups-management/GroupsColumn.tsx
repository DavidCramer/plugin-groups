import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';
import { getOrderedGroupIds } from '@/state/selectors';
import { GroupRow } from './GroupRow';
import { CreateEditGroupModal } from './CreateEditGroupModal';

export function GroupsColumn() {
  const { config, groupUI } = useAppState();
  const dispatch = useAppDispatch();
  const ids = getOrderedGroupIds(config);
  const selectedIds = ids.filter((id) => groupUI[id]?.selected);

  const allSelected = ids.length > 0 && selectedIds.length === ids.length;

  const reorder = (draggedId: string, targetId: string) => {
    const withoutDragged = ids.filter((id) => id !== draggedId);
    const targetIndex = withoutDragged.indexOf(targetId);
    withoutDragged.splice(targetIndex, 0, draggedId);
    dispatch({ type: 'REORDER_GROUPS', orderedIds: withoutDragged });
  };

  const deleteSelected = () => {
    if (!selectedIds.length) {
      return;
    }
    const confirmed = window.confirm(
      selectedIds.length === 1
        ? __('Delete the selected group?', 'plugin-groups')
        : __('Delete the selected groups?', 'plugin-groups')
    );
    if (confirmed) {
      dispatch({ type: 'DELETE_GROUPS', ids: selectedIds });
    }
  };

  return (
    <div className="flex-1 bg-white border-r border-gray-200 flex flex-col min-w-0">
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="section-title flex items-center justify-between mb-3">
          <span>{__('Groups', 'plugin-groups')}</span>
          <span className="count-pill green">{ids.length}</span>
        </div>
        <div className="flex items-center gap-2 pt-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(event) => dispatch({ type: 'SELECT_GROUPS', ids, selected: event.target.checked })}
            />
            {__('Select All', 'plugin-groups')}
          </label>
          <button
            type="button"
            className="btn-danger text-xs ml-auto"
            disabled={!selectedIds.length}
            onClick={deleteSelected}
          >
            {__('Delete selected', 'plugin-groups')}
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {ids.length ? (
          ids.map((id) => (
            <GroupRow
              key={id}
              group={config.groups[id]}
              ui={groupUI[id] ?? {}}
              onReorderDrop={(draggedId) => reorder(draggedId, id)}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-gray-400 text-xs">
            {__('No groups yet. Create one below.', 'plugin-groups')}
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          className="btn-primary text-xs"
          onClick={() => dispatch({ type: 'OPEN_GROUP_MODAL', mode: 'create' })}
        >
          {__('Create new group', 'plugin-groups')}
        </button>
      </div>
      <CreateEditGroupModal />
    </div>
  );
}

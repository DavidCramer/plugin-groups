import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';
import { getOrderedGroupIds } from '@/state/selectors';
import { Modal } from '@/components/shared/Modal';
import { generateGroupId } from '@/utils/id';

interface SendToGroupsModalProps {
  pluginFiles: string[];
  onClose: () => void;
  onAssigned: () => void;
}

/**
 * Modal opened from <PluginsColumn> for bulk-assigning the checked plugins to one or
 * more groups. Lets the user create a brand-new group inline (via the "Add Group"
 * row) without leaving the modal — the new group is auto-checked as a target.
 * `onAssigned` is called after confirming (even with zero groups selected) so the
 * caller can clear its selection; the group assignment itself is only dispatched
 * when at least one target group is checked.
 */
export function SendToGroupsModal({ pluginFiles, onClose, onAssigned }: SendToGroupsModalProps) {
  const { config } = useAppState();
  const dispatch = useAppDispatch();
  const [targetGroupIds, setTargetGroupIds] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const groupIds = getOrderedGroupIds(config);

  const toggleTarget = (id: string, on: boolean) => {
    setTargetGroupIds((prev) => {
      const next = new Set(prev);
      if (on) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const createGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      return;
    }
    const id = generateGroupId();
    dispatch({ type: 'CREATE_GROUP', id, name: trimmed });
    dispatch({ type: 'COMMIT_GROUP_NAME', id });
    setTargetGroupIds((prev) => new Set(prev).add(id));
    setNewGroupName('');
  };

  const confirmSend = () => {
    if (targetGroupIds.size) {
      dispatch({ type: 'ADD_PLUGINS_TO_GROUPS', groupIds: Array.from(targetGroupIds), pluginFiles });
      dispatch({
        type: 'SHOW_TOAST',
        message: sprintf(
          __('Assigned to %d group(s)', 'plugin-groups'),
          targetGroupIds.size
        ),
        variant: 'success',
      });
    }
    onAssigned();
    onClose();
  };

  return (
    <Modal title={__('Send Plugins to Groups', 'plugin-groups')} onClose={onClose}>
      <p className="text-xs text-gray-500 mb-3">
        {__('Select which groups to add the', 'plugin-groups')}{' '}
        <span className="font-semibold text-gray-700">{pluginFiles.length}</span>{' '}
        {__('selected plugin(s) to:', 'plugin-groups')}
      </p>
      <div className="border border-gray-200 rounded divide-y divide-gray-100 max-h-52 overflow-y-auto mb-4">
        {groupIds.length ? (
          groupIds.map((id) => {
            const group = config.groups[id];
            return (
              <label key={id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={targetGroupIds.has(id)}
                  onChange={(event) => toggleTarget(id, event.target.checked)}
                />
                <span className="flex-1 text-sm text-gray-800">{group.name}</span>
                <span className="count-pill">{group.plugins.length}</span>
              </label>
            );
          })
        ) : (
          <div className="px-3 py-3 text-xs text-gray-400 text-center">{__('No groups yet.', 'plugin-groups')}</div>
        )}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          className="wp-input flex-1 text-sm"
          placeholder={__('New group name…', 'plugin-groups')}
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              createGroup();
            }
          }}
        />
        <button type="button" className="btn-secondary text-xs" onClick={createGroup} disabled={!newGroupName.trim()}>
          {__('Add Group', 'plugin-groups')}
        </button>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary text-xs" onClick={onClose}>
          {__('Cancel', 'plugin-groups')}
        </button>
        <button type="button" className="btn-primary text-xs" onClick={confirmSend}>
          {__('Assign to Groups', 'plugin-groups')}
        </button>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppState } from '@/state/context';
import { Modal } from '@/components/shared/Modal';
import { generateGroupId } from '@/utils/id';

export function CreateEditGroupModal() {
  const { groupModal, config } = useAppState();
  const dispatch = useAppDispatch();
  const isRename = groupModal?.mode === 'rename';
  const [name, setName] = useState(() =>
    isRename && groupModal?.groupId ? config.groups[groupModal.groupId]?.name ?? '' : ''
  );

  if (!groupModal) {
    return null;
  }

  const close = () => dispatch({ type: 'CLOSE_GROUP_MODAL' });

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    if (isRename && groupModal.groupId) {
      dispatch({ type: 'CHANGE_GROUP_NAME', id: groupModal.groupId, name: trimmed });
      dispatch({ type: 'COMMIT_GROUP_NAME', id: groupModal.groupId });
    } else {
      const id = generateGroupId();
      dispatch({ type: 'CREATE_GROUP', id, name: trimmed });
      dispatch({ type: 'COMMIT_GROUP_NAME', id });
    }
    close();
    setName('');
  };

  return (
    <Modal title={isRename ? __('Rename Group', 'plugin-groups') : __('Create New Group', 'plugin-groups')} onClose={close} widthClassName="w-80">
      <label className="block text-xs font-medium text-gray-700 mb-1">{__('Group Name', 'plugin-groups')}</label>
      <input
        className="wp-input mb-1"
        type="text"
        placeholder={__('e.g. Security', 'plugin-groups')}
        value={name}
        autoFocus
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            save();
          }
        }}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="btn-secondary text-xs" onClick={close}>
          {__('Cancel', 'plugin-groups')}
        </button>
        <button type="button" className="btn-primary text-xs" onClick={save}>
          {__('Save Group', 'plugin-groups')}
        </button>
      </div>
    </Modal>
  );
}

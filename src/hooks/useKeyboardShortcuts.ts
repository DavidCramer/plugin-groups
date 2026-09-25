import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import type { Dispatch } from 'react';
import type { Action, AppState } from '@/state/reducer';
import { generateGroupId } from '@/utils/id';

interface UseKeyboardShortcutsOptions {
  state: AppState;
  dispatch: Dispatch<Action>;
  onSave: () => void;
}

function getSelectedGroupIds(state: AppState): string[] {
  return Object.keys(state.groupUI).filter((id) => state.groupUI[id]?.selected);
}

function isPlainTextEntry(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
}

export function useKeyboardShortcuts({ state, dispatch, onSave }: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isSaveShortcut = event.key === 's' && (event.metaKey || event.ctrlKey);

      const target = event.target as HTMLElement | null;
      const isNameEditInput = isPlainTextEntry(target) && !!target.dataset.edit;
      if (!isSaveShortcut && isPlainTextEntry(target) && !isNameEditInput) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault();
          dispatch({
            type: 'SELECT_ADJACENT_GROUP',
            direction: event.key === 'ArrowDown' ? 'next' : 'prev',
            extend: event.shiftKey,
          });
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
          dispatch({ type: 'SET_GROUPS_OPEN', ids: getSelectedGroupIds(state), open: event.key === 'ArrowRight' });
          break;
        case 'Enter':
          if (isNameEditInput) {
            target?.blur();
          } else {
            event.preventDefault();
            dispatch({ type: 'START_RENAME_GROUP', ids: getSelectedGroupIds(state) });
          }
          break;
        case '/':
          event.preventDefault();
          dispatch({ type: 'CREATE_GROUP', id: generateGroupId(), name: '' });
          break;
        case 'Escape': {
          const editId = target?.dataset.edit;
          if (editId) {
            dispatch({ type: 'REVERT_GROUP_NAME', id: editId });
          }
          break;
        }
        case 'Delete': {
          const selected = getSelectedGroupIds(state);
          if (selected.length && window.confirm(__('Delete the selected group(s)?', 'plugin-groups'))) {
            dispatch({ type: 'DELETE_GROUPS', ids: selected });
          }
          break;
        }
        default:
          if (isSaveShortcut) {
            event.preventDefault();
            onSave();
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, dispatch, onSave]);
}

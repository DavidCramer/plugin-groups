import { __ } from '@wordpress/i18n';
import { useAppDispatch } from '@/state/context';
import type { PersistedGroup } from '@/types/group';

interface KeywordsEditorProps {
  group: PersistedGroup;
}

/**
 * Keyword tag editor shown inside an expanded <GroupRow>. Keywords let a group
 * auto-assign plugins whose name matches; adding a keyword (Enter or comma) doesn't
 * re-run matching by itself — the explicit "Re-run auto-assign" button dispatches
 * `AUTO_ASSIGN_BY_KEYWORDS` for that.
 */
export function KeywordsEditor({ group }: KeywordsEditorProps) {
  const dispatch = useAppDispatch();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') {
      return;
    }
    const value = event.currentTarget.value.trim();
    event.preventDefault();
    if (value) {
      dispatch({ type: 'ADD_KEYWORD', groupId: group.id, keyword: value });
      event.currentTarget.value = '';
    }
  };

  return (
    <div className="px-3 py-2 border-t border-dashed border-gray-200">
      <div className="text-xs font-medium text-gray-500 mb-1.5">{__('Keywords', 'plugin-groups')}</div>
      <div className="flex flex-wrap gap-1 mb-2">
        {group.keywords.map((keyword) => (
          <span key={keyword} className="tag tag-gray">
            {keyword}
            <button
              type="button"
              className="leading-none"
              onClick={() => dispatch({ type: 'REMOVE_KEYWORD', groupId: group.id, keyword })}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        className="wp-input text-xs"
        type="text"
        placeholder={__('Add keyword', 'plugin-groups')}
        onKeyDown={handleKeyDown}
      />
      {group.keywords.length > 0 && (
        <button
          type="button"
          className="btn-secondary text-xs mt-2"
          onClick={() => dispatch({ type: 'AUTO_ASSIGN_BY_KEYWORDS', groupId: group.id })}
        >
          {__('Re-run auto-assign', 'plugin-groups')}
        </button>
      )}
    </div>
  );
}

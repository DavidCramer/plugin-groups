import type { PluginMeta } from '@/types/plugin';
import { LuGrip } from 'react-icons/lu';

/** Drag-and-drop MIME type used when dragging a plugin out of a group (read by <GroupRow>). */
export const PLUGIN_DRAG_MIME = 'application/x-plugin-groups-plugin';

interface GroupPluginRowProps {
  groupId: string;
  file: string;
  plugin: PluginMeta;
  onRemove: (file: string) => void;
}

/**
 * A plugin listed inside an expanded <GroupRow>: name, version, a remove button, and
 * draggable-out support so it can be dropped onto a different group (encodes its own
 * file + source group id into the drag payload for the target to read).
 */
export function GroupPluginRow({ groupId, file, plugin, onRemove }: GroupPluginRowProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(PLUGIN_DRAG_MIME, JSON.stringify({ pluginFile: file, sourceGroupId: groupId }));
  };

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-3 hover:bg-gray-50 group/pr border-b border-gray-100 last:border-0"
      draggable
      onDragStart={handleDragStart}
    >
      <LuGrip size={10} className="shrink-0 text-gray-400" />
      <span className="flex-1 text-xs text-gray-700 truncate">{plugin?.Name ?? file}</span>
      <span className="text-gray-400 text-xs font-mono">{plugin?.Version ?? ''}</span>
      <button
        type="button"
        className="opacity-0 group-hover/pr:opacity-100 text-gray-400 hover:text-red-500 ml-1 transition-opacity text-xs leading-none"
        onClick={() => onRemove(file)}
        title="Remove"
        aria-label="Remove"
      >
        ✕
      </button>
    </div>
  );
}

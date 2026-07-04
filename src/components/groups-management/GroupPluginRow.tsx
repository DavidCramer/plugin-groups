import type { PluginMeta } from '@/types/plugin';

export const PLUGIN_DRAG_MIME = 'application/x-plugin-groups-plugin';

interface GroupPluginRowProps {
  groupId: string;
  file: string;
  plugin: PluginMeta;
  onRemove: (file: string) => void;
}

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
      <svg className="drag-handle w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="6" r="1.5" />
        <circle cx="15" cy="6" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="18" r="1.5" />
        <circle cx="15" cy="18" r="1.5" />
      </svg>
      <span className="flex-1 text-xs text-gray-700 truncate">{plugin?.Name ?? file}</span>
      <span className="text-gray-400 text-xs font-mono">{plugin?.Version ?? ''}</span>
      <button
        type="button"
        className="opacity-0 group-hover/pr:opacity-100 text-gray-400 hover:text-red-500 ml-1 transition-opacity text-xs leading-none"
        onClick={() => onRemove(file)}
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}

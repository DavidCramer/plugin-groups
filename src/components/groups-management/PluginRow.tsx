import type { PersistedGroup } from '@/types/group';
import type { PluginMeta } from '@/types/plugin';

interface PluginRowProps {
  file: string;
  plugin: PluginMeta;
  groups: PersistedGroup[];
  checked: boolean;
  onToggle: (file: string) => void;
}

/**
 * A single row in <PluginsColumn>'s list: plugin name, version, and a checkbox for
 * bulk selection. The whole row is clickable to toggle the checkbox. `groups` is
 * accepted for callers that already compute it but isn't rendered here.
 */
export function PluginRow({ file, plugin, groups, checked, onToggle }: PluginRowProps) {
  return (
    <div
      className={`wp-row px-4 py-2 flex items-center gap-2 border-b border-gray-100 cursor-pointer ${checked ? 'selected' : ''}`}
      onClick={() => onToggle(file)}
    >
      <input type="checkbox" checked={checked} onChange={() => onToggle(file)} onClick={(event) => event.stopPropagation()} />
      <span className="flex-1 font-medium text-gray-800 truncate">{plugin.Name}</span>
      <span className="text-gray-400 text-xs font-mono ml-1 shrink-0">{plugin.Version}</span>
    </div>
  );
}

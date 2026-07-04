import type { Config } from '@/types/config';
import type { PersistedGroup } from '@/types/group';

export function getOrderedGroupIds(config: Config): string[] {
  return Object.keys(config.groups);
}

export function getGroupsForPlugin(config: Config, pluginFile: string): PersistedGroup[] {
  return getOrderedGroupIds(config)
    .map((id) => config.groups[id])
    .filter((group) => group.plugins.includes(pluginFile));
}

export function isPluginUngrouped(config: Config, pluginFile: string): boolean {
  return getGroupsForPlugin(config, pluginFile).length === 0;
}

export function getShiftedGroupId(
  ids: string[],
  activeId: string | null,
  direction: 'next' | 'prev'
): string | null {
  const index = activeId ? ids.indexOf(activeId) : -1;
  const nextIndex = direction === 'next' ? index + 1 : index - 1;
  const nextId = ids[nextIndex];
  return nextId && nextId !== activeId ? nextId : null;
}

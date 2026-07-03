import type { PersistedGroup } from '@/types/group';

interface LegacyExport {
  'plugin-groups-setup': unknown;
  group: Record<
    string,
    {
      config: {
        group_name: string;
        plugins?: string[];
        keywords?: string;
      };
    }
  >;
}

function isLegacyExport(data: unknown): data is LegacyExport {
  return !!data && typeof data === 'object' && 'plugin-groups-setup' in (data as Record<string, unknown>);
}

export function convertLegacyImport(oldData: LegacyExport): Record<string, PersistedGroup> {
  const groups: Record<string, PersistedGroup> = {};
  Object.keys(oldData.group).forEach((id) => {
    const group = oldData.group[id];
    groups[id] = {
      id,
      name: group.config.group_name,
      plugins: group.config.plugins ?? [],
      keywords: group.config.keywords
        ? group.config.keywords.split(' ').filter(Boolean)
        : [],
    };
  });
  return groups;
}

export function parseImportedGroups(data: unknown): Record<string, PersistedGroup> {
  if (isLegacyExport(data)) {
    return convertLegacyImport(data);
  }
  const raw = (data ?? {}) as Record<string, Partial<PersistedGroup>>;
  const groups: Record<string, PersistedGroup> = {};
  Object.keys(raw).forEach((id) => {
    const group = raw[id];
    groups[id] = {
      id: group.id ?? id,
      name: group.name ?? '',
      plugins: group.plugins ?? [],
      keywords: group.keywords ?? [],
    };
  });
  return groups;
}

export async function readFileAsJson(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text);
}

export function exportGroups(groups: Record<string, PersistedGroup>): void {
  const stamp = JSON.stringify(new Date())
    .replace(/"/g, '-')
    .replace(/:/g, '-')
    .split('.')[0];
  const blob = new Blob([JSON.stringify(groups)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plugin-groups-export' + stamp + '.json';
  link.click();
  URL.revokeObjectURL(url);
}

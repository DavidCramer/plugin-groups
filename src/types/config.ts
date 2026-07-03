import type { PersistedGroup } from './group';
import type { PluginsMap } from './plugin';
import type { PresetGroup } from './preset';

export type NavStyle = 'subsubsub' | 'groups-modern' | 'groups-dropdown';

export interface Params {
  legacyGrouping: boolean;
  navStyle: NavStyle;
  menuGroups: boolean;
  showUngrouped: boolean;
}

export interface Site {
  blog_id: number | string;
  domain: string;
  path: string;
  [key: string]: unknown;
}

export interface Config {
  groups: Record<string, PersistedGroup>;
  selectedPresets: string[];
  params: Params;
  sitesEnabled?: number[];
  siteID?: number;
  pluginName: string;
  version: string;
  slug: string;
  networkAdmin?: boolean;
  preset_groups: Record<string, PresetGroup>;
  presets: string[];
  saveURL: string;
  legacyURL: string;
  restNonce: string;
  loadURL?: string;
  sites?: Site[];
  mainSite?: number;
  plugins: PluginsMap;
}

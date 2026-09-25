export interface PluginMeta {
  Name: string;
  Version: string;
  Description?: string;
  Author?: string;
  AuthorURI?: string;
  PluginURI?: string;
  TextDomain?: string;
  [key: string]: unknown;
}

export type PluginsMap = Record<string, PluginMeta>;

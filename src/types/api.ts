import type { PersistedGroup } from './group';
import type { Params } from './config';

export interface SaveRequestBody {
  groups: Record<string, PersistedGroup>;
  selectedPresets: string[];
  params: Params;
  sitesEnabled?: number[];
  siteID?: number;
}

export interface SaveResponse {
  success: boolean;
}

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

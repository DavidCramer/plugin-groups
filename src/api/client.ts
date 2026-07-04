import { ApiError, type SaveRequestBody, type SaveResponse } from '@/types/api';
import type { Config } from '@/types/config';

interface RestFetchOptions {
  method?: 'GET' | 'POST';
  nonce: string;
  body?: unknown;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    if (data && typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    // Response body wasn't JSON; fall through to statusText.
  }
  return response.statusText || 'Request failed';
}

export async function restFetch<T>(url: string, options: RestFetchOptions): Promise<T> {
  const { method = 'GET', nonce, body } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network error');
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

export async function saveConfig(
  saveURL: string,
  restNonce: string,
  body: SaveRequestBody
): Promise<SaveResponse> {
  const result = await restFetch<SaveResponse>(saveURL, {
    method: 'POST',
    nonce: restNonce,
    body,
  });
  if (!result.success) {
    throw new ApiError('Save failed');
  }
  return result;
}

export async function loadSiteConfig(
  loadURL: string,
  restNonce: string,
  siteID: number
): Promise<Config> {
  const url = loadURL + '?siteID=' + siteID;
  return restFetch<Config>(url, { method: 'GET', nonce: restNonce });
}

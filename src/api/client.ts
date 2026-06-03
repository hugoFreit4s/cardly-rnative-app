import { mapApiErrorMessage } from './errorMessages';
import { getApiBaseUrl } from './getBaseUrl';
import type { ApiErrorBody } from './types';

export type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error('API não configurada. Defina EXPO_PUBLIC_API_BASE_URL.');
  }
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  let parsed: unknown = null;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }
  if (!res.ok) {
    const body = parsed as ApiErrorBody | null;
    const raw =
      body?.detail ??
      body?.message ??
      body?.error ??
      body?.title ??
      `Erro ${res.status}`;
    throw new Error(mapApiErrorMessage(res.status, raw, path));
  }
  return (parsed ?? ({} as T)) as T;
}

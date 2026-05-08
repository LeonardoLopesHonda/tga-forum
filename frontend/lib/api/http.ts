const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'tga_access_token';

export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
export function storeToken(t: string)     { localStorage.setItem(TOKEN_KEY, t); }
export function removeToken()             { localStorage.removeItem(TOKEN_KEY); }

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) { onUnauthorized = fn; }

export type ReqOptions = {
  formEncoded?: boolean;
  skipAuthHandler?: boolean;
  status202?: boolean;
};

export type Req202<T> = { status: 202; data: T };

export async function req<T>(
  method: string,
  path: string,
  body?: Record<string, unknown> | null,
  opts: ReqOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init: RequestInit = { method, headers };

  if (body) {
    if (opts.formEncoded) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      init.body = new URLSearchParams(body as Record<string, string>).toString();
    } else {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    if (res.status === 401 && !opts.skipAuthHandler) {
      onUnauthorized?.();
    }
    let detail = `${res.status}`;
    try { const d = await res.json(); detail = d.detail || detail; } catch (_) { /* noop */ }
    throw Object.assign(new Error(detail), { status: res.status });
  }

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (opts.status202) return { status: res.status, data } as unknown as T;
  return data as T;
}

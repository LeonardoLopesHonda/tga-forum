const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'tga_access_token';

export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
export function storeToken(t: string)     { localStorage.setItem(TOKEN_KEY, t); }
export function removeToken()             { localStorage.removeItem(TOKEN_KEY); }

export async function req<T>(method: string, path: string, body?: Record<string, unknown> | null, formEncoded = false): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts: RequestInit = { method, headers };

  if (body) {
    if (formEncoded) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      opts.body = new URLSearchParams(body as Record<string, string>).toString();
    } else {
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    let detail = `${res.status}`;
    try { const d = await res.json(); detail = d.detail || detail; } catch (_) { /* noop */ }
    throw Object.assign(new Error(detail), { status: res.status });
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return res.text() as unknown as T;
}

const BASE_URL = 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'tga_access_token';

export type UserPublic    = { user_id: number; username: string; email: string };
export type PostPublic    = { post_id: number; title: string; content: string; user_id: number; created_at: string };
export type CommentPublic = { comment_id: number; content: string; post_id: number; user_id: number; parent_id: number | null; created_at: string };
export type Token         = { access_token: string; token_type: 'bearer' };

function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
function storeToken(t: string)     { localStorage.setItem(TOKEN_KEY, t); }
function removeToken()             { localStorage.removeItem(TOKEN_KEY); }

async function req<T>(method: string, path: string, body?: Record<string, unknown> | null, formEncoded = false): Promise<T> {
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

export async function login(email: string, password: string): Promise<Token> {
  const data = await req<Token>('POST', '/auth', { username: email, password }, true);
  storeToken(data.access_token);
  return data;
}

export async function register(username: string, email: string, password: string): Promise<UserPublic> {
  return req<UserPublic>('POST', '/user', { username, email, password });
}

export function logout() { removeToken(); }
export function isLoggedIn() { return !!getToken(); }
export { getToken, storeToken, removeToken };

export async function getPosts(): Promise<PostPublic[]>      { return req<PostPublic[]>('GET', '/posts'); }
export async function getPost(id: number): Promise<PostPublic> { return req<PostPublic>('GET', `/posts/${id}`); }
export async function createPost(title: string, content: string): Promise<PostPublic> {
  return req<PostPublic>('POST', '/posts', { title, content });
}
export async function deletePost(id: number) { return req('DELETE', `/posts/${id}`); }

export async function getComments(postId: number): Promise<CommentPublic[]> {
  return req<CommentPublic[]>('GET', `/posts/${postId}/comments`);
}
export async function createComment(postId: number, content: string, parentId?: number | null): Promise<CommentPublic> {
  const body: Record<string, unknown> = { content };
  if (parentId != null) body.parent_id = parentId;
  return req<CommentPublic>('POST', `/posts/${postId}/comments`, body);
}
export async function replyToComment(commentId: number, content: string): Promise<CommentPublic> {
  return req<CommentPublic>('POST', `/comments/${commentId}/replies`, { content });
}
export async function deleteComment(id: number) { return req('DELETE', `/comments/${id}`); }

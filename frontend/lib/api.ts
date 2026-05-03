const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'tga_access_token';

export type PostPublic    = { post_id: string; title: string; content: string; user_id: string; username: string; created_at?: string };
export type CommentPublic = { comment_id: string; content: string; post_id: string; user_id: string; username: string; parent_id: string | null; created_at?: string };
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
  const data = await req<Token>('POST', '/auth/login', { username: email, password }, true);
  storeToken(data.access_token);
  return data;
}

export async function register(username: string, email: string, password: string): Promise<Token> {
  const data = await req<Token>('POST', '/auth/signup', { username, email, password });
  storeToken(data.access_token);
  return data;
}

export function logout() { removeToken(); }
export function isLoggedIn() { return !!getToken(); }
export { getToken, storeToken, removeToken };

export async function getPosts(): Promise<PostPublic[]>      { return req<PostPublic[]>('GET', '/posts'); }
export async function getPost(id: string): Promise<PostPublic> { return req<PostPublic>('GET', `/posts/${id}`); }
export async function createPost(title: string, content: string): Promise<PostPublic> {
  return req<PostPublic>('POST', '/posts', { title, content });
}
export async function deletePost(id: string) { return req('DELETE', `/posts/${id}`); }

export async function getComments(postId: string): Promise<CommentPublic[]> {
  return req<CommentPublic[]>('GET', `/posts/${postId}/comments`);
}
export async function createComment(postId: string, content: string, parentId?: string | null): Promise<CommentPublic> {
  const body: Record<string, unknown> = { content };
  if (parentId != null) body.parent_id = parentId;
  return req<CommentPublic>('POST', `/posts/${postId}/comments`, body);
}
export async function replyToComment(commentId: string, content: string): Promise<CommentPublic> {
  return req<CommentPublic>('POST', `/comments/${commentId}/replies`, { content });
}
export async function deleteComment(id: string) { return req('DELETE', `/comments/${id}`); }

export type AiAssistResponse = { title: string | null; content: string | null };
export async function aiAssistPost(title?: string, content?: string): Promise<AiAssistResponse> {
  const body: Record<string, string> = {};
  if (title)   body.title   = title;
  if (content) body.content = content;
  return req<AiAssistResponse>('POST', '/ai/post-assist', body);
}


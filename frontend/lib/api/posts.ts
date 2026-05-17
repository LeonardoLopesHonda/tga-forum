import { req } from './http';

export type PostPublic = {
  post_id:     string;
  title:       string;
  content:     string;
  user_id:     string;
  username:    string;
  created_at:  string;
  category_id: number | null;
};

export type Cursor   = { before: string; before_id: number };
export type PostPage = { items: PostPublic[]; next_cursor: Cursor | null };

export async function list(opts: { limit?: number; cursor?: Cursor | null; category?: string | null } = {}): Promise<PostPage> {
  const params = new URLSearchParams();
  params.set('limit', String(opts.limit ?? 10));
  if (opts.cursor) {
    params.set('before', opts.cursor.before);
    params.set('before_id', String(opts.cursor.before_id));
  }
  if (opts.category) {
    params.set('category', opts.category);
  }
  return req<PostPage>('GET', `/posts?${params.toString()}`);
}

export async function get(id: string): Promise<PostPublic> {
  return req<PostPublic>('GET', `/posts/${id}`);
}

export async function create(title: string, content: string, category_id: number): Promise<PostPublic> {
  return req<PostPublic>('POST', '/posts', { title, content, category_id });
}

export async function update(id: string, body: { title?: string; content?: string }): Promise<PostPublic> {
  return req<PostPublic>('PUT', `/posts/${id}`, body);
}

export async function remove(id: string) {
  return req('DELETE', `/posts/${id}`);
}

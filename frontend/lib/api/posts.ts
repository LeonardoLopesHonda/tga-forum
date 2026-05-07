import { req } from './http';

export type PostPublic = {
  post_id:     string;
  title:       string;
  content:     string;
  user_id:     string;
  username:    string;
  created_at?: string;
};

export async function list(): Promise<PostPublic[]> {
  return req<PostPublic[]>('GET', '/posts');
}

export async function get(id: string): Promise<PostPublic> {
  return req<PostPublic>('GET', `/posts/${id}`);
}

export async function create(title: string, content: string): Promise<PostPublic> {
  return req<PostPublic>('POST', '/posts', { title, content });
}

export async function remove(id: string) {
  return req('DELETE', `/posts/${id}`);
}

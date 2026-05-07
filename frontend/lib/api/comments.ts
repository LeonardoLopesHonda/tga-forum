import { req } from './http';

export type CommentPublic = {
  comment_id:  string;
  content:     string;
  post_id:     string;
  user_id:     string;
  username:    string;
  parent_id:   string | null;
  created_at?: string;
};

export async function list(postId: string): Promise<CommentPublic[]> {
  return req<CommentPublic[]>('GET', `/posts/${postId}/comments`);
}

export async function create(postId: string, content: string, parentId?: string | null): Promise<CommentPublic> {
  const body: Record<string, unknown> = { content };
  if (parentId != null) body.parent_id = parentId;
  return req<CommentPublic>('POST', `/posts/${postId}/comments`, body);
}

export async function reply(commentId: string, content: string): Promise<CommentPublic> {
  return req<CommentPublic>('POST', `/comments/${commentId}/replies`, { content });
}

export async function remove(id: string) {
  return req('DELETE', `/comments/${id}`);
}

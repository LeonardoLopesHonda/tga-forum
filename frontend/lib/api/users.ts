import { req } from './http';
import type { Cursor, PostPage } from './posts';

export type UserPublic = { user_id: string; username: string; bio: string | null };

export async function me(): Promise<UserPublic> {
  return req<UserPublic>('GET', '/users/me');
}

export async function meSilent(): Promise<UserPublic> {
  return req<UserPublic>('GET', '/users/me', null, { skipAuthHandler: true });
}

export async function getProfile(username: string): Promise<UserPublic> {
  return req<UserPublic>('GET', `/users/${encodeURIComponent(username)}`);
}

export async function getProfilePosts(
  username: string,
  opts: { limit?: number; cursor?: Cursor | null } = {},
): Promise<PostPage> {
  const params = new URLSearchParams();
  params.set('limit', String(opts.limit ?? 10));
  if (opts.cursor) {
    params.set('before', opts.cursor.before);
    params.set('before_id', String(opts.cursor.before_id));
  }
  return req<PostPage>('GET', `/users/${encodeURIComponent(username)}/posts?${params.toString()}`);
}

export async function updateBio(username: string, bio: string): Promise<UserPublic> {
  return req<UserPublic>('PATCH', `/users/${encodeURIComponent(username)}`, { bio });
}

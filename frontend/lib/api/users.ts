import { req } from './http';
import type { PostPublic } from './posts';

export type UserPublic    = { user_id: string; username: string; bio: string | null };
export type ProfilePublic = UserPublic & { posts: PostPublic[] };

export async function me(): Promise<UserPublic> {
  return req<UserPublic>('GET', '/users/me');
}

export async function getProfile(username: string): Promise<ProfilePublic> {
  return req<ProfilePublic>('GET', `/users/${encodeURIComponent(username)}`);
}

export async function updateBio(username: string, bio: string): Promise<UserPublic> {
  return req<UserPublic>('PATCH', `/users/${encodeURIComponent(username)}`, { bio });
}

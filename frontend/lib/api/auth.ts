import { req, getToken, storeToken, removeToken } from './http';

export type Token = { access_token: string; token_type: 'bearer' };

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

export function logout()     { removeToken(); }
export function isLoggedIn() { return !!getToken(); }

export { getToken, storeToken, removeToken };

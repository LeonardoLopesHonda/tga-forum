import { req, getToken, storeToken, removeToken, type Req202 } from './http';

export type Token = { access_token: string; token_type: 'bearer' };
export type SignupResult =
  | { kind: 'session'; token: Token }
  | { kind: 'pending_confirmation' };

export async function login(email: string, password: string): Promise<Token> {
  const data = await req<Token>('POST', '/auth/login', { username: email, password }, {
    formEncoded: true,
    skipAuthHandler: true,
  });
  storeToken(data.access_token);
  return data;
}

export async function register(username: string, email: string, password: string): Promise<SignupResult> {
  const email_redirect_to = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : undefined;
  const res = await req<Req202<Token | { pending_confirmation: true }>>(
    'POST', '/auth/signup',
    { username, email, password, email_redirect_to },
    { status202: true },
  );
  if (res.status === 202) return { kind: 'pending_confirmation' };
  const token = res.data as Token;
  storeToken(token.access_token);
  return { kind: 'session', token };
}

export function logout()     { removeToken(); }
export function isLoggedIn() { return !!getToken(); }

export { getToken, storeToken, removeToken };

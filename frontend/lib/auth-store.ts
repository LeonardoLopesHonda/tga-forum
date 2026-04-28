'use client';

import * as api from './api';

const STORE_KEY = 'tga_user';

export type AuthUser = { user_id: number; username: string; email: string };

type Listener = (user: AuthUser | null, token: string | null) => void;

function loadUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); }
  catch (_) { return null; }
}

function saveUser(u: AuthUser | null) {
  if (u) localStorage.setItem(STORE_KEY, JSON.stringify(u));
  else   localStorage.removeItem(STORE_KEY);
}

const listeners: Listener[] = [];

function notify() {
  listeners.forEach(fn => fn(store.user, store.token));
}

const store = {
  user:  null as AuthUser | null,
  token: null as string | null,

  init() {
    this.token = api.getToken();
    this.user  = loadUser();
  },

  subscribe(fn: Listener): () => void {
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); };
  },

  isLoggedIn() { return !!this.token && !!this.user; },

  async login(email: string, password: string): Promise<AuthUser> {
    const data = await api.login(email, password);
    store.token = data.access_token;
    let user: AuthUser;
    try {
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      const userId: number = payload.user_id;
      try {
        const userPublic = await api.getUser(userId);
        user = { user_id: userPublic.user_id, email: userPublic.email, username: userPublic.username };
      } catch (_) {
        user = { user_id: userId, email: payload.email ?? email, username: (payload.email ?? email).split('@')[0] };
      }
    } catch (_) {
      user = { user_id: 0, email, username: email.split('@')[0] };
    }
    store.user = user;
    saveUser(store.user);
    notify();
    return store.user;
  },

  async register(username: string, email: string, password: string): Promise<AuthUser> {
    const newUser = await api.register(username, email, password);
    await store.login(email, password);
    store.user = { ...store.user!, username: newUser.username, user_id: newUser.user_id };
    saveUser(store.user);
    notify();
    return store.user;
  },

  logout() {
    api.logout();
    store.token = null;
    store.user  = null;
    saveUser(null);
    notify();
  },
};

export default store;

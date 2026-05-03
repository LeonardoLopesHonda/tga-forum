'use client';

import * as api from './api';

const STORE_KEY = 'tga_user';

export type AuthUser = { user_id: string; username: string; email: string };

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
    if (this.token) {
      api.getMe().then(me => {
        if (!store.user) return;
        store.user = { ...store.user, username: me.username };
        saveUser(store.user);
        notify();
      }).catch(() => {});
    }
  },

  subscribe(fn: Listener): () => void {
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); };
  },

  isLoggedIn() { return !!this.token && !!this.user; },

  async login(email: string, password: string): Promise<AuthUser> {
    const data = await api.login(email, password);
    store.token = data.access_token;
    const me = await api.getMe();
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    store.user = { user_id: payload.sub, email: payload.email ?? email, username: me.username };
    saveUser(store.user);
    notify();
    return store.user;
  },

  async register(username: string, email: string, password: string): Promise<AuthUser> {
    const data = await api.register(username, email, password);
    store.token = data.access_token;
    let user: AuthUser;
    try {
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      user = { user_id: payload.sub, email: payload.email ?? email, username };
    } catch (_) {
      user = { user_id: '', email, username };
    }
    store.user = user;
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

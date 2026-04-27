'use client';

import { useState } from 'react';
import authStore from '@/lib/auth-store';

type Props = { open: boolean; onClose: () => void };

export default function AuthModal({ open, onClose }: Props) {
  const [mode, setMode]    = useState<'signin' | 'register'>('signin');
  const [form, setForm]    = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState('');

  if (!open) return null;
  const isReg = mode === 'register';

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (isReg) {
        await authStore.register(form.username, form.email, form.password);
      } else {
        await authStore.login(form.email, form.password);
      }
      setForm({ username: '', email: '', password: '' });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type: string, placeholder: string) => (
    <div key={key}>
      <label style={{ fontSize: 12, color: 'var(--cream-2)', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        value={form[key]} type={type} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        style={{
          width: '100%', background: 'var(--depth-2)',
          border: '1px solid rgba(212,168,67,0.18)', borderRadius: 6,
          padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14,
          color: 'var(--cream)', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,4,10,0.78)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.18)',
          borderRadius: 10, width: '100%', maxWidth: 400, padding: 36, position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 40px rgba(212,168,67,0.07)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 16, background: 'none', border: 'none',
            color: 'var(--cream-3)', cursor: 'pointer', fontSize: 22, lineHeight: 1,
          }}
        >
          ×
        </button>

        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
          {isReg ? 'Join TGA' : 'Welcome back'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--cream)', marginBottom: 26, lineHeight: 1.2 }}>
          {isReg ? 'Something’s pulling you here.' : 'The conversation continues.'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 16 }}>
          {isReg && field('Username', 'username', 'text', 'your_handle')}
          {field('Email', 'email', 'email', 'you@example.com')}
          {field('Password', 'password', 'password', '••••••••')}
        </div>

        {error && <p style={{ fontSize: 12, color: '#c07070', marginBottom: 12, lineHeight: 1.5 }}>{error}</p>}

        <button
          onClick={handleSubmit} disabled={loading}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = loading ? 'rgba(212,168,67,0.5)' : 'var(--gold)'; }}
          style={{
            width: '100%', background: loading ? 'rgba(212,168,67,0.5)' : 'var(--gold)',
            color: '#05040A', border: 'none', borderRadius: 6, padding: 12,
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'default' : 'pointer', marginBottom: 16,
            transition: 'background 0.2s var(--ease)',
          }}
        >
          {loading ? (isReg ? 'Creating…' : 'Signing in…') : (isReg ? 'Create account' : 'Sign in')}
        </button>

        <p style={{ fontSize: 13, color: 'var(--cream-3)', textAlign: 'center' }}>
          {isReg ? 'Already have an account? ' : "Don’t have an account? "}
          <button
            onClick={() => { setMode(isReg ? 'signin' : 'register'); setError(''); }}
            style={{
              background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer',
              fontSize: 13, fontFamily: 'var(--font-body)', padding: 0, textDecoration: 'underline',
            }}
          >
            {isReg ? 'Sign in' : 'Join TGA'}
          </button>
        </p>
      </div>
    </div>
  );
}

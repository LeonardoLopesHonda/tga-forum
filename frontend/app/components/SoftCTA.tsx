'use client';

import { useEffect, useState } from 'react';
import authStore, { type AuthUser } from '@/lib/auth-store';

export default function SoftCTA({ onAuthOpen }: { onAuthOpen: () => void }) {
  const [auth, setAuth] = useState<{ user: AuthUser | null }>({ user: null });

  useEffect(() => {
    authStore.init();
    setAuth({ user: authStore.user });
    const unsub = authStore.subscribe((user) => setAuth({ user }));
    return unsub;
  }, []);

  if (auth.user) return null;

  return (
    <div style={{
      borderTop: '1px solid rgba(212,168,67,0.07)', borderBottom: '1px solid rgba(212,168,67,0.07)',
      background: 'var(--depth-1)', padding: '72px 24px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.5)', marginBottom: 14 }}>
          The pull is real
        </p>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, color: 'var(--cream)', marginBottom: 14, lineHeight: 1.25 }}>
          You belong in this conversation.
        </h3>
        <p style={{ fontSize: 15, color: 'var(--cream-2)', marginBottom: 30, lineHeight: 1.65 }}>
          Create a free account to reply, post your questions, and find your people.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onAuthOpen}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--gold-light)'; el.style.boxShadow = '0 0 22px rgba(212,168,67,0.28)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--gold)'; el.style.boxShadow = 'none'; }}
            style={{
              background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
              padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.2s var(--ease)',
            }}>Create account</button>
          <button onClick={onAuthOpen}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(212,168,67,0.45)'; el.style.color = 'var(--cream)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(212,168,67,0.20)'; el.style.color = 'var(--cream-2)'; }}
            style={{
              background: 'transparent', color: 'var(--cream-2)', border: '1px solid rgba(212,168,67,0.20)',
              borderRadius: 6, padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s var(--ease)',
            }}>Sign in</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--cream-4)', marginTop: 18 }}>No ads, no noise.</p>
      </div>
    </div>
  );
}

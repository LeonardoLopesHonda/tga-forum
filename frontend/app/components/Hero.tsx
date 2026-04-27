'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import authStore, { type AuthUser } from '@/lib/auth-store';

const LaniakeaCanvas = dynamic(() => import('./LaniakeaCanvas'), { ssr: false });

type Props = { onAuthOpen: () => void };

export default function Hero({ onAuthOpen }: Props) {
  const [auth, setAuth] = useState<{ user: AuthUser | null }>({ user: null });
  const router = useRouter();

  useEffect(() => {
    authStore.init();
    setAuth({ user: authStore.user });
    const unsub = authStore.subscribe((user) => setAuth({ user }));
    return unsub;
  }, []);

  const scrollToPosts = () => {
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      position: 'relative', height: '88vh', minHeight: 560,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      <LaniakeaCanvas />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
        background: 'linear-gradient(to top, var(--void), transparent)', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 660 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'rgba(212,168,67,0.65)', marginBottom: 18,
        }}>
          Connect · Explore · Engineer
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 400,
          fontSize: 'clamp(38px,7vw,68px)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: 'var(--cream)', marginBottom: 22,
        }}>
          Something's pulling{'\n'}you here.
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--cream-2)',
          lineHeight: 1.65, margin: '0 auto 38px', maxWidth: 460,
        }}>
          The center of gravity for curious minds. Share ideas, ask hard questions, find your people.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {auth.user ? (
            <button onClick={() => router.push('/create')}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--gold-light)'; el.style.boxShadow = '0 0 28px rgba(212,168,67,0.32)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--gold)'; el.style.boxShadow = 'none'; }}
              style={{
                background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
                padding: '12px 26px', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.22s var(--ease)',
              }}>
              Start a discussion
            </button>
          ) : (
            <button onClick={onAuthOpen}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--gold-light)'; el.style.boxShadow = '0 0 28px rgba(212,168,67,0.32)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--gold)'; el.style.boxShadow = 'none'; }}
              style={{
                background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
                padding: '12px 26px', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.22s var(--ease)',
              }}>
              Join the conversation
            </button>
          )}

          <button onClick={scrollToPosts}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(212,168,67,0.45)'; el.style.color = 'var(--cream)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(212,168,67,0.20)'; el.style.color = 'var(--cream-2)'; }}
            style={{
              background: 'transparent', color: 'var(--cream-2)',
              border: '1px solid rgba(212,168,67,0.20)', borderRadius: 6,
              padding: '12px 26px', fontFamily: 'var(--font-body)', fontSize: 15,
              cursor: 'pointer', transition: 'all 0.22s var(--ease)',
            }}>
            Browse posts
          </button>
        </div>
      </div>
    </section>
  );
}

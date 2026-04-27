'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Avatar, { deriveUser } from './Avatar';
import authStore, { type AuthUser } from '@/lib/auth-store';

type Props = { onAuthOpen: () => void };

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" style={{ display: 'block' }}>
      {open ? (
        <g stroke="#A09070" strokeWidth={1.6} strokeLinecap="round">
          <line x1={4} y1={4} x2={18} y2={18} />
          <line x1={18} y1={4} x2={4} y2={18} />
        </g>
      ) : (
        <g stroke="#A09070" strokeWidth={1.6} strokeLinecap="round">
          <line x1={3} y1={6} x2={19} y2={6} />
          <line x1={3} y1={11} x2={19} y2={11} />
          <line x1={3} y1={16} x2={19} y2={16} />
        </g>
      )}
    </svg>
  );
}

function MobileDrawer({ open, onClose, onAuthOpen, auth }: { open: boolean; onClose: () => void; onAuthOpen: () => void; auth: { user: AuthUser | null } }) {
  const router = useRouter();
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  const go = (path: string) => { router.push(path); onClose(); };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(5,4,10,0.97)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', padding: '80px 32px 40px',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.32s var(--ease)', pointerEvents: open ? 'all' : 'none',
    }}>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {(['Forum', '/'] as const).map(([label, path]) => (
          <button key={label as string} onClick={() => go(path as string)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0',
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400,
            color: 'var(--cream)', textAlign: 'left', letterSpacing: '-0.01em',
            borderBottom: '1px solid rgba(212,168,67,0.08)', width: '100%',
          }}>{label}</button>
        ))}
        <button onClick={() => go('/create')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0',
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400,
          color: 'var(--gold)', textAlign: 'left', letterSpacing: '-0.01em',
          borderBottom: '1px solid rgba(212,168,67,0.08)', width: '100%',
        }}>New post</button>
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {auth.user ? (
          <button onClick={() => { authStore.logout(); onClose(); }} style={{
            background: 'transparent', color: 'var(--cream-2)', border: '1px solid rgba(212,168,67,0.22)',
            borderRadius: 6, padding: 14, fontFamily: 'var(--font-body)', fontSize: 15, cursor: 'pointer', width: '100%',
          }}>Sign out ({auth.user.username || auth.user.email})</button>
        ) : (
          <>
            <button onClick={() => { onAuthOpen(); onClose(); }} style={{
              background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
              padding: 14, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%',
            }}>Sign in</button>
            <button onClick={() => { onAuthOpen(); onClose(); }} style={{
              background: 'transparent', color: 'var(--cream-2)', border: '1px solid rgba(212,168,67,0.22)',
              borderRadius: 6, padding: 14, fontFamily: 'var(--font-body)', fontSize: 15, cursor: 'pointer', width: '100%',
            }}>Create account</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Header({ onAuthOpen }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [auth, setAuth] = useState<{ user: AuthUser | null }>({ user: null });
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    authStore.init();
    setAuth({ user: authStore.user });
    const unsub = authStore.subscribe((user) => setAuth({ user }));
    return unsub;
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 680);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 160, height: 62,
        padding: '0 clamp(20px,5vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: (scrolled || menuOpen) ? 'rgba(5,4,10,0.92)' : 'transparent',
        backdropFilter: (scrolled || menuOpen) ? 'blur(18px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(212,168,67,0.10)' : 'transparent'}`,
        transition: 'background 0.35s var(--ease), border-color 0.35s var(--ease)',
      }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, zIndex: 1 }}>
          <Image src="/logo-mark.png" alt="TGA" width={30} height={30} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--cream)', letterSpacing: '0.05em' }}>TGA</span>
        </button>

        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <button onClick={() => router.push('/')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
              fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: pathname === '/' ? 'var(--cream)' : 'var(--cream-2)', transition: 'color 0.18s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = pathname === '/' ? 'var(--cream)' : 'var(--cream-2)'; }}
            >Forum</button>

            <button onClick={() => router.push('/create')}
              onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(212,168,67,0.6)'; el.style.background = 'rgba(212,168,67,0.07)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(212,168,67,0.28)'; el.style.background = 'transparent'; }}
              style={{
                background: 'transparent', border: '1px solid rgba(212,168,67,0.28)', color: 'var(--gold)',
                borderRadius: 6, padding: '7px 16px', fontFamily: 'var(--font-body)', fontSize: 13,
                cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.22s var(--ease)',
              }}>+ New post</button>

            {auth.user ? (
              <button onClick={() => authStore.logout()} title={`Signed in as ${auth.user.username || auth.user.email} — click to sign out`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar user={deriveUser(auth.user.user_id || 0)} size={30} />
                <span style={{ fontSize: 13, color: 'var(--cream-2)' }}>{auth.user.username || auth.user.email}</span>
              </button>
            ) : (
              <button onClick={onAuthOpen}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'; }}
                style={{
                  background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
                  padding: '7px 18px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', letterSpacing: '0.03em', transition: 'background 0.2s var(--ease)',
                }}>Sign in</button>
            )}
          </nav>
        )}

        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, zIndex: 1 }}>
            <HamburgerIcon open={menuOpen} />
          </button>
        )}
      </header>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onAuthOpen={onAuthOpen} auth={auth} />
    </>
  );
}

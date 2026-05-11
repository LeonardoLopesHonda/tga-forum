'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authStore from '@/lib/auth-store';

type State = { status: 'loading' } | { status: 'error'; message: string };

function parseHash(hash: string): Record<string, string> {
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  const out: Record<string, string> = {};
  for (const part of clean.split('&')) {
    if (!part) continue;
    const [k, v] = part.split('=');
    out[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return out;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const hash   = window.location.hash;
    const params = parseHash(hash);

    const errorDesc = params.error_description || params.error;
    if (errorDesc) {
      setState({ status: 'error', message: errorDesc });
      return;
    }

    const token = params.access_token;
    if (!token) {
      setState({ status: 'error', message: 'No access token in callback URL.' });
      return;
    }

    authStore.adoptSession(token)
      .then(() => { router.replace('/'); })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Could not complete sign-in.';
        setState({ status: 'error', message: msg });
      });
  }, [router]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
      {state.status === 'loading' ? (
        <>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 14 }}>
            Finishing sign-in
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--cream)', marginBottom: 12, lineHeight: 1.2 }}>
            Confirming your email…
          </h2>
          <p style={{ fontSize: 14, color: 'var(--cream-3)' }}>One moment.</p>
        </>
      ) : (
        <>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c07070', marginBottom: 14 }}>
            Something went wrong
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--cream)', marginBottom: 12, lineHeight: 1.2 }}>
            We couldn’t verify this link.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--cream-2)', marginBottom: 28, lineHeight: 1.6 }}>
            {state.message}
          </p>
          <button onClick={() => router.replace('/')} style={{
            background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
            padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Back to forum</button>
        </>
      )}
    </div>
  );
}

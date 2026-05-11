'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authStore from '@/lib/auth-store';
import toast from '@/lib/toast';

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

function failHome(router: ReturnType<typeof useRouter>, message: string) {
  toast.error(message, { label: 'Sign in', onClick: () => authStore.openModal() });
  router.replace('/');
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = parseHash(window.location.hash);

    const errorDesc = params.error_description || params.error;
    if (errorDesc) { failHome(router, errorDesc); return; }

    const token = params.access_token;
    if (!token) { failHome(router, 'Confirmation link was missing its access token.'); return; }

    authStore.adoptSession(token)
      .then(() => { router.replace('/'); })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Could not complete sign-in.';
        failHome(router, msg);
      });
  }, [router]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 14 }}>
        Finishing sign-in
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--cream)', marginBottom: 12, lineHeight: 1.2 }}>
        Confirming your email…
      </h2>
      <p style={{ fontSize: 14, color: 'var(--cream-3)' }}>One moment.</p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import authStore from '@/lib/auth-store';
import toast from '@/lib/toast';
import { useField, validators } from '@/lib/use-field';

type Props = { open: boolean; onClose: () => void };

const inputStyle = {
  width: '100%', background: 'var(--depth-2)',
  border: '1px solid rgba(212,168,67,0.18)', borderRadius: 6,
  padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14,
  color: 'var(--cream)', outline: 'none', boxSizing: 'border-box' as const,
};

export default function AuthModal({ open, onClose }: Props) {
  const [mode, setMode]       = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const isReg = mode === 'register';

  const username = useField('', validators.username());
  const email    = useField('', validators.compose(validators.required('Email'), validators.email()));
  const password = useField('', validators.minLength(6, 'Password'));

  const canSubmit = !loading &&
    (!isReg || username.isValid) &&
    email.isValid &&
    password.isValid;

  if (!open) return null;

  const resetAll = () => {
    username.reset(); email.reset(); password.reset();
    setServerError(''); setPendingEmail(null);
  };

  const handleClose = () => { resetAll(); onClose(); };

  const handleSubmit = async () => {
    setServerError(''); setLoading(true);
    try {
      if (isReg) {
        const result = await authStore.register(username.value, email.value, password.value);
        if (result.kind === 'pending_confirmation') {
          setPendingEmail(email.value);
          return;
        }
      } else {
        await authStore.login(email.value, password.value);
      }
      username.reset(); email.reset(); password.reset();
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Try again.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleClose}
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
          onClick={handleClose}
          style={{
            position: 'absolute', top: 14, right: 16, background: 'none', border: 'none',
            color: 'var(--cream-3)', cursor: 'pointer', fontSize: 22, lineHeight: 1,
          }}
        >
          ×
        </button>

        {pendingEmail ? (
          <>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
              Almost there
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--cream)', marginBottom: 18, lineHeight: 1.2 }}>
              Check your email to finish signing up.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--cream-2)', marginBottom: 26, lineHeight: 1.6 }}>
              We sent a confirmation link to <span style={{ color: 'var(--cream)' }}>{pendingEmail}</span>. Click the link in that email to activate your account.
            </p>
            <button
              onClick={handleClose}
              style={{
                width: '100%', background: 'var(--gold)', color: '#05040A', border: 'none',
                borderRadius: 6, padding: 12, fontFamily: 'var(--font-body)', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', marginBottom: 12,
              }}
            >
              Got it
            </button>
            <p style={{ fontSize: 13, color: 'var(--cream-3)', textAlign: 'center' }}>
              Wrong email?{' '}
              <button
                onClick={() => { setPendingEmail(null); password.reset(); }}
                style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: 0, textDecoration: 'underline' }}
              >
                Try again
              </button>
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
              {isReg ? 'Join TGA' : 'Welcome back'}
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--cream)', marginBottom: 26, lineHeight: 1.2 }}>
              {isReg ? 'Something’s pulling you here.' : 'The conversation continues.'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 16 }}>
              {isReg && (
                <div>
                  <label style={{ fontSize: 12, color: 'var(--cream-2)', display: 'block', marginBottom: 5 }}>Username</label>
                  <input {...username} onKeyDown={e => e.key === 'Enter' && handleSubmit()} type="text" placeholder="your_handle" style={inputStyle} />
                  {username.error && <p style={{ fontSize: 11, color: '#c07070', marginTop: 4 }}>{username.error}</p>}
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, color: 'var(--cream-2)', display: 'block', marginBottom: 5 }}>Email</label>
                <input {...email} onKeyDown={e => e.key === 'Enter' && handleSubmit()} type="email" placeholder="you@example.com" style={inputStyle} />
                {email.error && <p style={{ fontSize: 11, color: '#c07070', marginTop: 4 }}>{email.error}</p>}
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--cream-2)', display: 'block', marginBottom: 5 }}>Password</label>
                <input {...password} onKeyDown={e => e.key === 'Enter' && handleSubmit()} type="password" placeholder="••••••••" style={inputStyle} />
                {password.error && <p style={{ fontSize: 11, color: '#c07070', marginTop: 4 }}>{password.error}</p>}
              </div>
            </div>

            {serverError && <p style={{ fontSize: 12, color: '#c07070', marginBottom: 12, lineHeight: 1.5 }}>{serverError}</p>}

            <button
              onClick={handleSubmit} disabled={!canSubmit}
              onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = !canSubmit ? 'rgba(212,168,67,0.5)' : 'var(--gold)'; }}
              style={{
                width: '100%', background: !canSubmit ? 'rgba(212,168,67,0.5)' : 'var(--gold)',
                color: '#05040A', border: 'none', borderRadius: 6, padding: 12,
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                cursor: !canSubmit ? 'default' : 'pointer', marginBottom: 16,
                transition: 'background 0.2s var(--ease)',
              }}
            >
              {loading ? (isReg ? 'Creating…' : 'Signing in…') : (isReg ? 'Create account' : 'Sign in')}
            </button>

            <p style={{ fontSize: 13, color: 'var(--cream-3)', textAlign: 'center' }}>
              {isReg ? 'Already have an account? ' : "Don’t have an account? "}
              <button
                onClick={() => { setMode(isReg ? 'signin' : 'register'); setServerError(''); username.reset(); email.reset(); password.reset(); }}
                style={{
                  background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer',
                  fontSize: 13, fontFamily: 'var(--font-body)', padding: 0, textDecoration: 'underline',
                }}
              >
                {isReg ? 'Sign in' : 'Join TGA'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { ToastAction } from '@/lib/toast';

type Toast = { id: number; message: string; level: 'error' | 'info'; action?: ToastAction; exiting: boolean };

let nextId = 0;
const DURATION = 4000;
const EXIT_MS  = 300;

function dismiss(setToasts: React.Dispatch<React.SetStateAction<Toast[]>>, id: number) {
  setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
  setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), EXIT_MS);
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const { message, level, action } = (e as CustomEvent).detail;
      const id = nextId++;
      setToasts(prev => [...prev, { id, message, level, action, exiting: false }]);

      if (!action) {
        setTimeout(() => dismiss(setToasts, id), DURATION);
      }
    }

    window.addEventListener('tga:toast', onToast);
    return () => window.removeEventListener('tga:toast', onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 500,
      display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => !t.action && dismiss(setToasts, t.id)}
          style={{
            background: t.level === 'error' ? 'rgba(30,10,10,0.97)' : 'rgba(10,10,20,0.97)',
            border: `1px solid ${t.level === 'error' ? 'rgba(192,80,80,0.40)' : 'rgba(212,168,67,0.25)'}`,
            borderRadius: 8, padding: '12px 16px', maxWidth: 340,
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream-2)', lineHeight: 1.5,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            cursor: t.action ? 'default' : 'pointer',
            opacity: t.exiting ? 0 : 1,
            transform: t.exiting ? 'translateY(8px)' : 'translateY(0)',
            transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>
              <span style={{ color: t.level === 'error' ? '#c07070' : 'var(--gold)', marginRight: 8 }}>
                {t.level === 'error' ? '✕' : 'ℹ'}
              </span>
              {t.message}
            </span>
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); dismiss(setToasts, t.id); }}
                style={{
                  background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 4,
                  padding: '5px 12px', fontFamily: 'var(--font-body)', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

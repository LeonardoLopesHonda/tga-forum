'use client';

import { useEffect, useState } from 'react';

type Toast = { id: number; message: string; level: 'error' | 'info'; exiting: boolean };

let nextId = 0;
const DURATION = 4000;
const EXIT_MS  = 300;

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const { message, level } = (e as CustomEvent).detail;
      const id = nextId++;
      setToasts(prev => [...prev, { id, message, level, exiting: false }]);

      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), EXIT_MS);
      }, DURATION);
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
          onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          style={{
            background: t.level === 'error' ? 'rgba(30,10,10,0.97)' : 'rgba(10,10,20,0.97)',
            border: `1px solid ${t.level === 'error' ? 'rgba(192,80,80,0.40)' : 'rgba(212,168,67,0.25)'}`,
            borderRadius: 8, padding: '12px 16px', maxWidth: 340,
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cream-2)', lineHeight: 1.5,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            cursor: 'pointer',
            opacity: t.exiting ? 0 : 1,
            transform: t.exiting ? 'translateY(8px)' : 'translateY(0)',
            transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`,
          }}
        >
          <span style={{ color: t.level === 'error' ? '#c07070' : 'var(--gold)', marginRight: 8 }}>
            {t.level === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

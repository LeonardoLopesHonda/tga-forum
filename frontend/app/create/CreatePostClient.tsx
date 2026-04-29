'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import authStore, { type AuthUser } from '@/lib/auth-store';
import toast from '@/lib/toast';
import AuthModal from '@/app/components/AuthModal';

const TAGS = ['Engineering', 'Explore', 'Connect'] as const;
type Tag = typeof TAGS[number];

const TAG_COLORS: Record<Tag, { bg: string; border: string; text: string }> = {
  Engineering: { bg: 'rgba(212,168,67,0.10)', border: 'rgba(212,168,67,0.25)', text: '#D4A843' },
  Explore:     { bg: 'rgba(160,144,112,0.10)', border: 'rgba(160,144,112,0.22)', text: '#A09070' },
  Connect:     { bg: 'rgba(180,130,80,0.10)', border: 'rgba(180,130,80,0.22)', text: '#C09060' },
};

export default function CreatePostClient() {
  const [auth, setAuth]         = useState<{ user: AuthUser | null }>({ user: null });
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [title, setTitle]       = useState('');
  const [content, setContent]   = useState('');
  const [tag, setTag]           = useState<Tag | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);
  const router = useRouter();

  useEffect(() => {
    authStore.init();
    setAuth({ user: authStore.user });
    setAuthReady(true);
    const unsub = authStore.subscribe((user) => setAuth({ user }));
    return unsub;
  }, []);

  if (!authReady) return null;

  if (!auth.user) return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 14 }}>
          Members only
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, color: 'var(--cream)', marginBottom: 14, lineHeight: 1.2 }}>
          Sign in to post a discussion.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--cream-2)', marginBottom: 32, lineHeight: 1.65 }}>
          Create a free account to share your ideas with the community.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setAuthOpen(true)} style={{
            background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
            padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Sign in / Join TGA</button>
          <button onClick={() => router.push('/')} style={{
            background: 'transparent', color: 'var(--cream-2)', border: '1px solid rgba(212,168,67,0.20)',
            borderRadius: 6, padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, cursor: 'pointer',
          }}>Back to forum</button>
        </div>
      </div>
    </>
  );

  if (done) return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 14 }}>
        Posted
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, color: 'var(--cream)', marginBottom: 14 }}>
        It's out there now.
      </h2>
      <p style={{ fontSize: 15, color: 'var(--cream-2)', marginBottom: 32, lineHeight: 1.65 }}>
        Your post has been added to the forum. The conversation can begin.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => router.push('/')}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'; }}
          style={{
            background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
            padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.18s',
          }}>Back to forum</button>
        <button onClick={() => { setTitle(''); setContent(''); setTag(''); setDone(false); setError(''); }} style={{
          background: 'transparent', color: 'var(--cream-2)', border: '1px solid rgba(212,168,67,0.20)',
          borderRadius: 6, padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, cursor: 'pointer',
        }}>Write another</button>
      </div>
    </div>
  );

  const canSubmit = title.trim().length >= 5 && content.trim().length >= 10 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(''); setSubmitting(true);
    try {
      // tag is UI-only — backend has no tag field yet
      await api.createPost(title.trim(), content.trim());
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error && (e as Error & { status?: number }).status === 401
        ? 'Your session expired. Please sign in again.'
        : (e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const statusMsg = submitting ? 'Posting…'
    : !title.trim() ? 'Add a title'
    : title.trim().length < 5 ? 'Title too short'
    : !content.trim() ? 'Add some content'
    : content.trim().length < 10 ? 'Content too short'
    : 'Ready to post';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 80px' }}>
      <button onClick={() => router.push('/')}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream-3)'; }}
        style={{
          background: 'none', border: 'none', color: 'var(--cream-3)', cursor: 'pointer',
          fontSize: 13, letterSpacing: '0.06em', marginBottom: 40, display: 'flex',
          alignItems: 'center', gap: 6, padding: 0, fontFamily: 'var(--font-body)', transition: 'color 0.15s',
        }}>← Forum</button>

      <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,168,67,0.6)', marginBottom: 10 }}>
        New discussion
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,4vw,36px)', fontWeight: 400, color: 'var(--cream)', marginBottom: 8, lineHeight: 1.2 }}>
        What's on your mind?
      </h1>
      <p style={{ fontSize: 14, color: 'var(--cream-3)', marginBottom: 36 }}>
        Posting as {auth.user.username || auth.user.email}
      </p>

      {/* Tag selector */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 12, color: 'var(--cream-2)', display: 'block', marginBottom: 10, letterSpacing: '0.04em' }}>Topic (optional)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {TAGS.map(t => {
            const active = tag === t;
            const c = TAG_COLORS[t];
            return (
              <button key={t} onClick={() => setTag(active ? '' : t)} style={{
                background: active ? c.bg : 'transparent',
                border: `1px solid ${active ? c.border : 'rgba(212,168,67,0.16)'}`,
                borderRadius: 4, padding: '7px 18px', fontFamily: 'var(--font-body)', fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: active ? c.text : 'var(--cream-3)', cursor: 'pointer', transition: 'all 0.18s var(--ease)',
              }}>{t}</button>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 22 }}>
        <label style={{ fontSize: 12, color: 'var(--cream-2)', display: 'block', marginBottom: 8, letterSpacing: '0.04em' }}>Title</label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="A specific, interesting question or statement" maxLength={160}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(212,168,67,0.50)'; }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(212,168,67,0.20)'; }}
          style={{
            width: '100%', background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.20)',
            borderRadius: 6, padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 18,
            color: 'var(--cream)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: title.length > 140 ? '#c07070' : 'var(--cream-4)' }}>
            {title.length}/160
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 12, color: 'var(--cream-2)', display: 'block', marginBottom: 8, letterSpacing: '0.04em' }}>Content</label>
        <textarea
          value={content} onChange={e => setContent(e.target.value)}
          placeholder="Share your thinking. Be specific. Give people something to respond to."
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,168,67,0.50)'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,168,67,0.20)'; }}
          style={{
            width: '100%', background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.20)',
            borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 15,
            color: 'var(--cream)', outline: 'none', resize: 'vertical', minHeight: 220,
            boxSizing: 'border-box', lineHeight: 1.7, transition: 'border-color 0.18s',
          }}
        />
      </div>

      {error && <p style={{ fontSize: 13, color: '#c07070', marginBottom: 16, lineHeight: 1.5 }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 8, borderTop: '1px solid rgba(212,168,67,0.08)' }}>
        <p style={{ fontSize: 12, color: 'var(--cream-4)' }}>{statusMsg}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--cream-3)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', padding: '10px 4px' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            onMouseEnter={e => { if (canSubmit) { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--gold-light)'; el.style.boxShadow = '0 0 20px rgba(212,168,67,0.25)'; } }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = canSubmit ? 'var(--gold)' : 'rgba(212,168,67,0.25)'; el.style.boxShadow = 'none'; }}
            style={{
              background: canSubmit ? 'var(--gold)' : 'rgba(212,168,67,0.25)',
              color: '#05040A', border: 'none', borderRadius: 6, padding: '11px 28px',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'default', transition: 'all 0.18s var(--ease)',
            }}>
            {submitting ? 'Posting…' : 'Post discussion'}
          </button>
        </div>
      </div>
    </div>
  );
}

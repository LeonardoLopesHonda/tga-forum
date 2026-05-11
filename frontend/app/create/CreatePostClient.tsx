'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as posts from '@/lib/api/posts';
import * as ai from '@/lib/api/ai';
import authStore, { useAuth } from '@/lib/auth-store';
import toast from '@/lib/toast';
import { useField, validators } from '@/lib/use-field';

const TAGS = ['Engineering', 'Explore', 'Connect'] as const;
type Tag = typeof TAGS[number];

const TAG_COLORS: Record<Tag, { bg: string; border: string; text: string }> = {
  Engineering: { bg: 'rgba(212,168,67,0.10)', border: 'rgba(212,168,67,0.25)', text: '#D4A843' },
  Explore:     { bg: 'rgba(160,144,112,0.10)', border: 'rgba(160,144,112,0.22)', text: '#A09070' },
  Connect:     { bg: 'rgba(180,130,80,0.10)', border: 'rgba(180,130,80,0.22)', text: '#C09060' },
};

export default function CreatePostClient() {
  const { user, ready } = useAuth();
  const title   = useField('', validators.minLength(5, 'Title'));
  const content = useField('', validators.minLength(10, 'Content'));
  const [tag, setTag]               = useState<Tag | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading]   = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone]             = useState(false);
  const [suggestedTitle,   setSuggestedTitle]   = useState<string | null>(null);
  const [suggestedContent, setSuggestedContent] = useState<string | null>(null);
  const router = useRouter();

  const canSubmit = title.isValid && content.isValid && !submitting;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/');
      authStore.openModal();
    }
  }, [ready, user, router]);

  if (!ready || !user) return null;

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
        <button onClick={() => { title.reset(); content.reset(); setTag(''); setDone(false); setServerError(''); }} style={{
          background: 'transparent', color: 'var(--cream-2)', border: '1px solid rgba(212,168,67,0.20)',
          borderRadius: 6, padding: '11px 24px', fontFamily: 'var(--font-body)', fontSize: 14, cursor: 'pointer',
        }}>Write another</button>
      </div>
    </div>
  );

  const handleAiAssist = async () => {
    const titleVal   = title.value.trim();
    const contentVal = content.value.trim();
    if (aiLoading || (!titleVal && !contentVal)) return;
    setSuggestedTitle(null); setSuggestedContent(null);
    setAiLoading(true);
    try {
      const result = await ai.assistPost(titleVal || undefined, contentVal || undefined);
      const bothSent = !!titleVal && !!contentVal;
      // Single-field send: auto-apply the generated field (the user's field was empty).
      // Both-fields send: show each refinement as a chip the user can accept or dismiss.
      if (bothSent) {
        if (result.title   && result.title   !== titleVal)   setSuggestedTitle(result.title);
        if (result.content && result.content !== contentVal) setSuggestedContent(result.content);
      } else {
        if (result.title)   title.reset(result.title);
        if (result.content) content.reset(result.content);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI assist failed. Try again.';
      toast.error(msg);
    } finally { setAiLoading(false); }
  };

  const acceptTitle   = () => { if (suggestedTitle)   { title.reset(suggestedTitle);     setSuggestedTitle(null);   } };
  const dismissTitle  = () => setSuggestedTitle(null);
  const acceptContent = () => { if (suggestedContent) { content.reset(suggestedContent); setSuggestedContent(null); } };
  const dismissContent= () => setSuggestedContent(null);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setServerError(''); setSubmitting(true);
    try {
      // tag is UI-only — backend has no tag field yet
      await posts.create(title.value.trim(), content.value.trim());
      setDone(true);
    } catch (e: unknown) {
      const msg = e instanceof Error && (e as Error & { status?: number }).status === 401
        ? 'Your session expired. Please sign in again.'
        : (e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setServerError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

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
        Posting as {user.username || user.email}
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
          {...title.props}
          placeholder="A specific, interesting question or statement" maxLength={160}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(212,168,67,0.50)'; }}
          style={{
            width: '100%', background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.20)',
            borderRadius: 6, padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 18,
            color: 'var(--cream)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {title.error
            ? <span style={{ fontSize: 11, color: '#c07070' }}>{title.error}</span>
            : <span />}
          <span style={{ fontSize: 11, color: title.value.length > 140 ? '#c07070' : 'var(--cream-4)' }}>
            {title.value.length}/160
          </span>
        </div>
        {suggestedTitle && (
          <SuggestionChip
            label="Suggested title"
            text={suggestedTitle}
            onAccept={acceptTitle}
            onDismiss={dismissTitle}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 12, color: 'var(--cream-2)', letterSpacing: '0.04em' }}>Content</label>
          <button
            onClick={handleAiAssist}
            disabled={aiLoading || (!title.value.trim() && !content.value.trim())}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent',
              border: `1px solid ${aiLoading ? 'rgba(100,120,220,0.20)' : 'rgba(100,160,255,0.30)'}`,
              borderRadius: 5, padding: '5px 12px',
              fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.05em',
              color: aiLoading ? 'rgba(140,160,255,0.45)' : 'rgba(160,200,255,0.80)',
              cursor: aiLoading || (!title.value.trim() && !content.value.trim()) ? 'default' : 'pointer',
              transition: 'all 0.18s var(--ease)',
              opacity: (!title.value.trim() && !content.value.trim()) ? 0.4 : 1,
            }}
            onMouseEnter={e => {
              if (!aiLoading && (title.value.trim() || content.value.trim())) {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.borderColor = 'rgba(140,160,255,0.55)';
                el.style.background = 'rgba(100,120,255,0.08)';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'rgba(100,160,255,0.30)';
              el.style.background = 'transparent';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M9.5 1 L10.15 3.85 L13 4.5 L10.15 5.15 L9.5 8 L8.85 5.15 L6 4.5 L8.85 3.85 Z" fill="rgba(140,180,255,0.90)" />
              <path d="M3.5 7 L3.9 8.6 L5.5 9 L3.9 9.4 L3.5 11 L3.1 9.4 L1.5 9 L3.1 8.6 Z" fill="rgba(180,130,255,0.85)" />
            </svg>
            {aiLoading ? 'Generating…' : 'AI assist'}
          </button>
        </div>
        <textarea
          {...content.props}
          placeholder="Share your thinking. Be specific. Give people something to respond to."
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,168,67,0.50)'; }}
          style={{
            width: '100%', background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.20)',
            borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 15,
            color: 'var(--cream)', outline: 'none', resize: 'vertical', minHeight: 220,
            boxSizing: 'border-box', lineHeight: 1.7, transition: 'border-color 0.18s',
          }}
        />
        {content.error && <p style={{ fontSize: 11, color: '#c07070', marginTop: 4 }}>{content.error}</p>}
        {suggestedContent && (
          <SuggestionChip
            label="Suggested content"
            text={suggestedContent}
            onAccept={acceptContent}
            onDismiss={dismissContent}
            multiline
          />
        )}
      </div>

      {serverError && <p style={{ fontSize: 13, color: '#c07070', marginBottom: 16, lineHeight: 1.5 }}>{serverError}</p>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 8, borderTop: '1px solid rgba(212,168,67,0.08)' }}>
        <p style={{ fontSize: 12, color: 'var(--cream-4)' }}>{canSubmit ? 'Ready to post' : 'Fill in all fields'}</p>
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

type ChipProps = {
  label: string;
  text: string;
  onAccept: () => void;
  onDismiss: () => void;
  multiline?: boolean;
};

function SuggestionChip({ label, text, onAccept, onDismiss, multiline }: ChipProps) {
  return (
    <div style={{
      marginTop: 10,
      background: 'rgba(100,120,255,0.06)',
      border: '1px solid rgba(140,160,255,0.30)',
      borderRadius: 6, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(180,200,255,0.75)', margin: 0 }}>
        {label}
      </p>
      <p style={{
        fontSize: 13, color: 'var(--cream-2)', lineHeight: 1.55, margin: 0,
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
        maxHeight: multiline ? 180 : undefined,
        overflowY: multiline ? 'auto' : undefined,
      }}>
        {text}
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onDismiss} style={{
          background: 'transparent', border: '1px solid rgba(212,168,67,0.20)',
          borderRadius: 5, padding: '5px 12px', color: 'var(--cream-3)',
          fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer',
        }}>Dismiss</button>
        <button onClick={onAccept} style={{
          background: 'rgba(140,160,255,0.85)', border: 'none',
          borderRadius: 5, padding: '5px 14px', color: '#05040A',
          fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
        }}>Accept</button>
      </div>
    </div>
  );
}

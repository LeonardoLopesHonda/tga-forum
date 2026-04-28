'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import type { PostPublic, CommentPublic } from '@/lib/api';
import authStore, { type AuthUser } from '@/lib/auth-store';
import Avatar, { deriveUser } from '@/app/components/Avatar';
import TagChip from '@/app/components/TagChip';
import Shimmer from '@/app/components/Shimmer';
import AuthModal from '@/app/components/AuthModal';

function renderBody(text: string) {
  return (text || '').split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
      if (chunk.startsWith('**') && chunk.endsWith('**'))
        return <strong key={j} style={{ color: 'var(--cream)', fontWeight: 600 }}>{chunk.slice(2, -2)}</strong>;
      return chunk;
    });
    return <p key={i} style={{ fontSize: 17, color: 'var(--cream-2)', lineHeight: 1.75, marginBottom: 20 }}>{parts}</p>;
  });
}

function AuthGate({ onAuthOpen }: { onAuthOpen: () => void }) {
  return (
    <div style={{
      background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.14)', borderRadius: 6,
      padding: '20px 24px', marginBottom: 32, textAlign: 'center',
    }}>
      <p style={{ fontSize: 14, color: 'var(--cream-2)', marginBottom: 12 }}>Sign in to join this conversation.</p>
      <button onClick={onAuthOpen}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'; }}
        style={{
          background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
          padding: '8px 22px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'background 0.18s',
        }}>Sign in / Create account</button>
    </div>
  );
}

function CommentNode({
  comment, depth, allComments, onReply, replyingTo, onSubmitReply, onDelete, currentUserId,
}: {
  comment: CommentPublic; depth: number; allComments: CommentPublic[];
  onReply: (id: number | null) => void; replyingTo: number | null;
  onSubmitReply: (parentId: number, content: string) => void;
  onDelete: (id: number) => void; currentUserId: number | null;
}) {
  const [replyText, setReplyText] = useState('');
  const user        = { ...deriveUser(comment.user_id), username: comment.username };
  const children    = allComments.filter(c => c.parent_id === comment.comment_id);
  const isReplying  = replyingTo === comment.comment_id;
  const isOwn       = currentUserId != null && currentUserId === comment.user_id;
  const indentPx    = Math.min(depth, 4) * 22;

  return (
    <div style={{ marginLeft: indentPx, position: 'relative' }}>
      {depth > 0 && (
        <div style={{ position: 'absolute', left: -14, top: 0, bottom: 0, width: 1, background: 'rgba(212,168,67,0.15)' }} />
      )}

      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Avatar user={user} size={24} />
          <span style={{ fontSize: 13, color: 'var(--cream-2)', fontWeight: 500 }}>{user.username}</span>
          {isOwn && (
            <button onClick={() => onDelete(comment.comment_id)}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#c07070'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream-4)'; }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 11,
                color: 'var(--cream-4)', marginLeft: 'auto', fontFamily: 'var(--font-body)',
                letterSpacing: '0.04em', transition: 'color 0.15s',
              }}>Delete</button>
          )}
        </div>
        <p style={{ fontSize: 15, color: 'var(--cream-2)', lineHeight: 1.68, marginBottom: 8, paddingLeft: 32, fontFamily: 'var(--font-body)' }}>
          {comment.content}
        </p>
        <button onClick={() => onReply(isReplying ? null : comment.comment_id)}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = isReplying ? 'var(--gold)' : 'var(--cream-4)'; }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', paddingLeft: 32, fontSize: 12,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: isReplying ? 'var(--gold)' : 'var(--cream-4)',
            transition: 'color 0.15s', fontFamily: 'var(--font-body)',
          }}>
          {isReplying ? 'Cancel' : 'Reply'}
        </button>
      </div>

      {isReplying && (
        <div style={{ paddingLeft: 32, marginBottom: 12 }}>
          <textarea
            value={replyText} onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply…" autoFocus
            onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,168,67,0.52)'; }}
            onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,168,67,0.22)'; }}
            style={{
              width: '100%', background: 'var(--depth-2)', border: '1px solid rgba(212,168,67,0.22)',
              borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--cream)', outline: 'none', resize: 'vertical', minHeight: 80,
              boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 0.18s',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button onClick={() => onReply(null)} style={{ background: 'none', border: 'none', color: 'var(--cream-3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: '6px 0' }}>Cancel</button>
            <button
              onClick={() => { onSubmitReply(comment.comment_id, replyText); setReplyText(''); }}
              disabled={!replyText.trim()}
              style={{
                background: replyText.trim() ? 'var(--gold)' : 'rgba(212,168,67,0.3)',
                color: '#05040A', border: 'none', borderRadius: 5, padding: '7px 18px',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                cursor: replyText.trim() ? 'pointer' : 'default', transition: 'all 0.18s',
              }}>Reply</button>
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div style={{ marginTop: 4, paddingLeft: 14, borderLeft: '1px solid rgba(212,168,67,0.10)' }}>
          {children.map(child => (
            <CommentNode
              key={child.comment_id} comment={child} depth={depth + 1}
              allComments={allComments} onReply={onReply} replyingTo={replyingTo}
              onSubmitReply={onSubmitReply} onDelete={onDelete} currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentSection({ postId, onAuthOpen, currentUser }: { postId: number; onAuthOpen: () => void; currentUser: AuthUser | null }) {
  const [comments, setComments]     = useState<CommentPublic[]>([]);
  const [loading, setLoading]       = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nextId = useRef(9000);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getComments(postId)
      .then(data => { if (!cancelled) { setComments(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setComments([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [postId]);

  const handleSubmitTop = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const c = await api.createComment(postId, newComment.trim());
      setComments(prev => [...prev, c]);
    } catch (_) {
      setComments(prev => [...prev, {
        comment_id: nextId.current++, post_id: postId,
        user_id: currentUser?.user_id || 1, parent_id: null, content: newComment.trim(),
        username: currentUser?.username || '', created_at: new Date().toISOString(),
      }]);
    } finally { setNewComment(''); setSubmitting(false); }
  };

  const handleSubmitReply = async (parentId: number, content: string) => {
    if (!content.trim()) return;
    try {
      const c = await api.replyToComment(parentId, content.trim());
      setComments(prev => [...prev, c]);
    } catch (_) {
      setComments(prev => [...prev, {
        comment_id: nextId.current++, post_id: postId,
        user_id: currentUser?.user_id || 1, parent_id: parentId, content: content.trim(),
        username: currentUser?.username || '', created_at: new Date().toISOString(),
      }]);
    }
    setReplyingTo(null);
  };

  const handleDelete = async (commentId: number) => {
    try { await api.deleteComment(commentId); } catch (_) { /* noop */ }
    setComments(prev => prev.filter(c => c.comment_id !== commentId));
  };

  const topLevel = comments.filter(c => !c.parent_id);

  return (
    <div style={{ marginTop: 56 }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--cream)', marginBottom: 28 }}>
        {loading ? 'Replies' : `${comments.length} ${comments.length === 1 ? 'reply' : 'replies'}`}
      </h3>

      {currentUser ? (
        <div style={{ marginBottom: 40 }}>
          <textarea
            value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Add to the conversation…"
            onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,168,67,0.50)'; }}
            onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(212,168,67,0.20)'; }}
            style={{
              width: '100%', background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.20)',
              borderRadius: 6, padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: 15,
              color: 'var(--cream)', outline: 'none', resize: 'vertical', minHeight: 90,
              boxSizing: 'border-box', lineHeight: 1.65, transition: 'border-color 0.18s',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button onClick={handleSubmitTop} disabled={!newComment.trim() || submitting}
              onMouseEnter={e => { if (newComment.trim() && !submitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = newComment.trim() && !submitting ? 'var(--gold)' : 'rgba(212,168,67,0.25)'; }}
              style={{
                background: newComment.trim() && !submitting ? 'var(--gold)' : 'rgba(212,168,67,0.25)',
                color: '#05040A', border: 'none', borderRadius: 6, padding: '9px 22px',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                cursor: newComment.trim() && !submitting ? 'pointer' : 'default', transition: 'all 0.18s var(--ease)',
              }}>
              {submitting ? 'Posting…' : 'Post reply'}
            </button>
          </div>
        </div>
      ) : (
        <AuthGate onAuthOpen={onAuthOpen} />
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2].map(i => <Shimmer key={i} height={70} />)}
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {topLevel.map(c => (
            <CommentNode key={c.comment_id} comment={c} depth={0}
              allComments={comments} onReply={setReplyingTo} replyingTo={replyingTo}
              onSubmitReply={handleSubmitReply} onDelete={handleDelete}
              currentUserId={currentUser?.user_id ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetailClient({ postId }: { postId: number }) {
  const [post, setPost]       = useState<PostPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [auth, setAuth]       = useState<{ user: AuthUser | null }>({ user: null });
  const [authOpen, setAuthOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    authStore.init();
    setAuth({ user: authStore.user });
    const unsub = authStore.subscribe((user) => setAuth({ user }));
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(''); setPost(null);
    api.getPost(postId)
      .then(data => { if (!cancelled) { setPost(data); setLoading(false); } })
      .catch(() => {
        if (!cancelled) { setError('Post not found.'); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [postId]);

  const author      = post ? { ...deriveUser(post.user_id), username: post.username } : null;
  const isOwn       = auth.user && post && auth.user.user_id === post.user_id;

  if (loading) return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 80px' }}>
      <div style={{ height: 32, width: 80, borderRadius: 4, background: 'var(--depth-2)', marginBottom: 40 }} />
      <Shimmer height={52} radius={4} />
      <div style={{ marginTop: 16 }} />
      <Shimmer height={200} radius={4} />
    </div>
  );

  if (error || !post) return (
    <div style={{ maxWidth: 700, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--cream-3)', fontSize: 17 }}>{error || 'Post not found.'}</p>
      <button onClick={() => router.push('/')} style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 14 }}>
        ← Back to forum
      </button>
    </div>
  );

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button onClick={() => router.push('/')}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream-3)'; }}
            style={{
              background: 'none', border: 'none', color: 'var(--cream-3)', cursor: 'pointer',
              fontSize: 13, letterSpacing: '0.06em', display: 'flex', alignItems: 'center',
              gap: 6, padding: 0, fontFamily: 'var(--font-body)', transition: 'color 0.15s',
            }}>← Forum</button>
          {isOwn && (
            <button
              onClick={async () => { try { await api.deletePost(post.post_id); } catch (_) { /* noop */ } router.push('/'); }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#c07070'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream-4)'; }}
              style={{
                background: 'none', border: 'none', color: 'var(--cream-4)', cursor: 'pointer',
                fontSize: 12, fontFamily: 'var(--font-body)', letterSpacing: '0.04em', transition: 'color 0.15s',
              }}>Delete post</button>
          )}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,5vw,42px)', fontWeight: 400,
          color: 'var(--cream)', lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: 20,
        }}>{post.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid rgba(212,168,67,0.10)' }}>
          <Avatar user={author} size={28} />
          <span style={{ fontSize: 14, color: 'var(--cream-2)' }}>{author?.username}</span>
        </div>

        <div style={{ marginBottom: 56 }}>{renderBody(post.content)}</div>

        <div style={{ height: 1, background: 'rgba(212,168,67,0.08)', marginBottom: 8 }} />

        <CommentSection postId={post.post_id} onAuthOpen={() => setAuthOpen(true)} currentUser={auth.user} />
      </div>
    </>
  );
}

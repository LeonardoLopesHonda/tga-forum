'use client';

import { useEffect, useState, useRef } from 'react';
import * as api from '@/lib/api';
import type { CommentPublic } from '@/lib/api';
import type { AuthUser } from '@/lib/auth-store';
import authStore from '@/lib/auth-store';
import toast from '@/lib/toast';
import Shimmer from '@/app/components/Shimmer';
import CommentContext from './CommentContext';
import CommentNode from './CommentNode';

function AuthGate() {
  return (
    <div style={{
      background: 'var(--depth-1)', border: '1px solid rgba(212,168,67,0.14)', borderRadius: 6,
      padding: '20px 24px', marginBottom: 32, textAlign: 'center',
    }}>
      <p style={{ fontSize: 14, color: 'var(--cream-2)', marginBottom: 12 }}>Sign in to join this conversation.</p>
      <button
        onClick={() => authStore.openModal()}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'; }}
        style={{
          background: 'var(--gold)', color: '#05040A', border: 'none', borderRadius: 6,
          padding: '8px 22px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'background 0.18s',
        }}
      >Sign in / Create account</button>
    </div>
  );
}

export default function CommentSection({ postId, currentUser }: { postId: string; currentUser: AuthUser | null }) {
  const [comments, setComments]     = useState<CommentPublic[]>([]);
  const [loading, setLoading]       = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nextId = useRef(9000);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getComments(postId)
      .then(data  => { if (!cancelled) { setComments(data); setLoading(false); } })
      .catch(()   => { if (!cancelled) { setComments([]);   setLoading(false); } });
    return () => { cancelled = true; };
  }, [postId]);

  const handleSubmitTop = async () => {
    if (!newComment.trim()) return;
    const optimisticId = `optimistic-${nextId.current++}`;
    const optimistic: CommentPublic = {
      comment_id: optimisticId, post_id: postId, parent_id: null,
      user_id: currentUser?.user_id || '', username: currentUser?.username || '',
      content: newComment.trim(), created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    setNewComment('');
    setSubmitting(true);
    try {
      const confirmed = await api.createComment(postId, optimistic.content);
      setComments(prev => prev.map(c => c.comment_id === optimisticId ? confirmed : c));
    } catch (e) {
      setComments(prev => prev.filter(c => c.comment_id !== optimisticId));
      toast.error(e instanceof Error ? e.message : 'Failed to post comment. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string, content: string) => {
    if (!content.trim()) return;
    const optimisticId = `optimistic-${nextId.current++}`;
    const optimistic: CommentPublic = {
      comment_id: optimisticId, post_id: postId, parent_id: parentId,
      user_id: currentUser?.user_id || '', username: currentUser?.username || '',
      content: content.trim(), created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    setReplyingTo(null);
    try {
      const confirmed = await api.replyToComment(parentId, content.trim());
      setComments(prev => prev.map(c => c.comment_id === optimisticId ? confirmed : c));
    } catch (e) {
      setComments(prev => prev.filter(c => c.comment_id !== optimisticId));
      toast.error(e instanceof Error ? e.message : 'Failed to post reply. Try again.');
    }
  };

  const handleDelete = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.comment_id !== commentId));
    try {
      await api.deleteComment(commentId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete comment.');
    }
  };

  const topLevel = comments.filter(c => !c.parent_id);

  return (
    <CommentContext.Provider value={{
      replyingTo,
      currentUserId: currentUser?.user_id ?? null,
      onReply:       setReplyingTo,
      onSubmitReply: handleSubmitReply,
      onDelete:      handleDelete,
    }}>
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
              <button
                onClick={handleSubmitTop} disabled={!newComment.trim() || submitting}
                onMouseEnter={e => { if (newComment.trim() && !submitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = newComment.trim() && !submitting ? 'var(--gold)' : 'rgba(212,168,67,0.25)'; }}
                style={{
                  background: newComment.trim() && !submitting ? 'var(--gold)' : 'rgba(212,168,67,0.25)',
                  color: '#05040A', border: 'none', borderRadius: 6, padding: '9px 22px',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                  cursor: newComment.trim() && !submitting ? 'pointer' : 'default', transition: 'all 0.18s var(--ease)',
                }}
              >
                {submitting ? 'Posting…' : 'Post reply'}
              </button>
            </div>
          </div>
        ) : (
          <AuthGate />
        )}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2].map(i => <Shimmer key={i} height={70} />)}
          </div>
        )}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {topLevel.map(c => (
              <CommentNode key={c.comment_id} comment={c} depth={0} allComments={comments} />
            ))}
          </div>
        )}
      </div>
    </CommentContext.Provider>
  );
}

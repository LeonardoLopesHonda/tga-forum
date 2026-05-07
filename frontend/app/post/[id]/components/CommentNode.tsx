'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CommentPublic } from '@/lib/api';
import authStore from '@/lib/auth-store';
import Avatar, { deriveUser } from '@/app/components/Avatar';
import { useCommentContext } from './CommentContext';

export default function CommentNode({
  comment, depth, allComments,
}: {
  comment: CommentPublic; depth: number; allComments: CommentPublic[];
}) {
  const { replyingTo, currentUserId, onReply, onSubmitReply, onDelete } = useCommentContext();
  const [replyText, setReplyText] = useState('');

  const user       = { ...deriveUser(comment.user_id), username: comment.username };
  const children   = allComments.filter(c => c.parent_id === comment.comment_id);
  const isReplying = replyingTo === comment.comment_id;
  const isOwn      = currentUserId != null && currentUserId === comment.user_id;
  const indentPx   = Math.min(depth, 4) * 22;

  return (
    <div style={{ marginLeft: indentPx, position: 'relative' }}>
      {depth > 0 && (
        <div style={{ position: 'absolute', left: -14, top: 0, bottom: 0, width: 1, background: 'rgba(212,168,67,0.15)' }} />
      )}

      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Avatar user={user} size={24} />
          <Link href={`/profile/${user.username}`} style={{ fontSize: 13, color: 'var(--cream-2)', fontWeight: 500, textDecoration: 'none' }}>
            {user.username}
          </Link>
          {isOwn && (
            <button
              onClick={() => onDelete(comment.comment_id)}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#c07070'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--cream-4)'; }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 11,
                color: 'var(--cream-4)', marginLeft: 'auto', fontFamily: 'var(--font-body)',
                letterSpacing: '0.04em', transition: 'color 0.15s',
              }}
            >Delete</button>
          )}
        </div>

        <p style={{ fontSize: 15, color: 'var(--cream-2)', lineHeight: 1.68, marginBottom: 8, paddingLeft: 32, fontFamily: 'var(--font-body)' }}>
          {comment.content}
        </p>

        <button
          onClick={() => currentUserId ? onReply(isReplying ? null : comment.comment_id) : authStore.openModal()}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = isReplying ? 'var(--gold)' : 'var(--cream-4)'; }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', paddingLeft: 32, fontSize: 12,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: isReplying ? 'var(--gold)' : 'var(--cream-4)',
            transition: 'color 0.15s', fontFamily: 'var(--font-body)',
          }}
        >
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
            <button
              onClick={() => onReply(null)}
              style={{ background: 'none', border: 'none', color: 'var(--cream-3)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', padding: '6px 0' }}
            >Cancel</button>
            <button
              onClick={() => { onSubmitReply(comment.comment_id, replyText); setReplyText(''); }}
              disabled={!replyText.trim()}
              style={{
                background: replyText.trim() ? 'var(--gold)' : 'rgba(212,168,67,0.3)',
                color: '#05040A', border: 'none', borderRadius: 5, padding: '7px 18px',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                cursor: replyText.trim() ? 'pointer' : 'default', transition: 'all 0.18s',
              }}
            >Reply</button>
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div style={{ marginTop: 4, paddingLeft: 14, borderLeft: '1px solid rgba(212,168,67,0.10)' }}>
          {children.map(child => (
            <CommentNode key={child.comment_id} comment={child} depth={depth + 1} allComments={allComments} />
          ))}
        </div>
      )}
    </div>
  );
}

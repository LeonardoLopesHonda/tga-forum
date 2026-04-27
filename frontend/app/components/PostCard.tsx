'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PostPublic } from '@/lib/api';
import Avatar, { deriveUser } from './Avatar';
import TagChip from './TagChip';

type Props = { post: PostPublic & { tag?: string; time?: string }; commentCount?: number };

export default function PostCard({ post, commentCount }: Props) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const user = deriveUser(post.user_id);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/post/${post.post_id}`)}
      style={{
        background: 'var(--depth-1)',
        border: `1px solid ${hovered ? 'rgba(212,168,67,0.40)' : 'rgba(212,168,67,0.13)'}`,
        borderRadius: 6, padding: '22px 24px',
        boxShadow: hovered ? '0 0 28px rgba(212,168,67,0.09)' : 'none',
        transition: 'border-color 0.22s var(--ease), box-shadow 0.22s var(--ease)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 400, lineHeight: 1.35,
          color: hovered ? 'var(--cream)' : '#E8DFC8',
          transition: 'color 0.18s', flex: 1, margin: 0,
        }}>
          {post.title}
        </h2>
        {post.tag && <TagChip tag={post.tag} />}
      </div>

      <p style={{
        fontSize: 14, color: 'var(--cream-2)', lineHeight: 1.6, marginBottom: 16,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {(post.content || '').replace(/\*\*/g, '').replace(/\n/g, ' ')}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar user={user} size={22} />
        <span style={{ fontSize: 12, color: 'var(--cream-3)' }}>{user.username}</span>
        {commentCount !== undefined && (
          <span style={{ fontSize: 12, color: 'var(--cream-4)' }}>
            {commentCount} {commentCount === 1 ? 'reply' : 'replies'}
          </span>
        )}
        {post.time && <span style={{ fontSize: 12, color: 'var(--cream-4)' }}>{post.time}</span>}
      </div>
    </article>
  );
}

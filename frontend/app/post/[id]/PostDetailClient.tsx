'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as posts from '@/lib/api/posts';
import type { PostPublic } from '@/lib/api/posts';
import { useAuth } from '@/lib/auth-store';
import Avatar, { deriveUser } from '@/app/components/Avatar';
import Shimmer from '@/app/components/Shimmer';
import CommentSection from './components/CommentSection';

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

export default function PostDetailClient({ postId }: { postId: string }) {
  const [post, setPost]       = useState<PostPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const { user }              = useAuth();
  const router                = useRouter();

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(''); setPost(null);
    posts.get(postId)
      .then(data => { if (!cancelled) { setPost(data); setLoading(false); } })
      .catch(()  => { if (!cancelled) { setError('Post not found.'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [postId]);

  const author = post ? { ...deriveUser(post.user_id), username: post.username } : null;
  const isOwn  = user && post && user.user_id === post.user_id;

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
            onClick={async () => { try { await posts.remove(post.post_id); } catch (_) { /* noop */ } router.push('/'); }}
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
        <Link href={`/profile/${author?.username}`} style={{ fontSize: 14, color: 'var(--cream-2)', textDecoration: 'none' }}>{author?.username}</Link>
      </div>

      <div style={{ marginBottom: 56 }}>{renderBody(post.content)}</div>

      <div style={{ height: 1, background: 'rgba(212,168,67,0.08)', marginBottom: 8 }} />

      <CommentSection postId={post.post_id} currentUser={user ?? null} />
    </div>
  );
}

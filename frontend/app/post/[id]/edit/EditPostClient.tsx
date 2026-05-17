'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as posts from '@/lib/api/posts';
import type { PostPublic } from '@/lib/api/posts';
import authStore, { useAuth } from '@/lib/auth-store';
import Shimmer from '@/app/components/Shimmer';
import CreatePostClient from '@/app/create/CreatePostClient';

export default function EditPostClient({ postId }: { postId: string }) {
  const { user, ready } = useAuth();
  const router          = useRouter();
  const [post, setPost] = useState<PostPublic | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/post/${postId}`);
      authStore.openModal();
      return;
    }
    let cancelled = false;
    posts.get(postId)
      .then(data => {
        if (cancelled) return;
        if (data.user_id !== user.user_id) {
          router.replace(`/post/${postId}`);
          return;
        }
        setPost(data);
      })
      .catch(() => { if (!cancelled) setError('Post not found.'); });
    return () => { cancelled = true; };
  }, [ready, user, postId, router]);

  if (!ready || !user) return null;

  if (error) return (
    <div style={{ maxWidth: 600, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--cream-3)', fontSize: 17 }}>{error}</p>
      <button onClick={() => router.push('/')} style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 14 }}>
        ← Back to forum
      </button>
    </div>
  );

  if (!post) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 80px' }}>
      <Shimmer height={32} radius={4} />
      <div style={{ marginTop: 28 }} />
      <Shimmer height={52} radius={4} />
      <div style={{ marginTop: 16 }} />
      <Shimmer height={220} radius={4} />
    </div>
  );

  return (
    <CreatePostClient
      postId={postId}
      initialTitle={post.title}
      initialContent={post.content}
      initialCategoryId={post.category_id}
    />
  );
}

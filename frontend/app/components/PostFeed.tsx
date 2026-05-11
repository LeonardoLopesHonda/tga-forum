'use client';

import { useEffect, useState } from 'react';
import * as postsApi from '@/lib/api/posts';
import type { Cursor, PostPublic } from '@/lib/api/posts';
import toast from '@/lib/toast';
import PostCard from './PostCard';
import Shimmer from './Shimmer';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PostFeed() {
  const [posts, setPosts]             = useState<PostPublic[]>([]);
  const [cursor, setCursor]           = useState<Cursor | null>(null);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    postsApi.list()
      .then(page => {
        if (cancelled) return;
        setPosts(page.items);
        setCursor(page.next_cursor);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setPosts([]);
        setCursor(null);
        setLoading(false);
        toast.error(e instanceof Error ? e.message : 'Could not load posts. The server may be waking up — try again in a moment.');
      });
    return () => { cancelled = true; };
  }, []);

  const handleLoadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await postsApi.list({ cursor });
      setPosts(prev => [...prev, ...page.items]);
      setCursor(page.next_cursor);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not load more posts.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section id="posts" style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--cream)', margin: 0 }}>
          Recent discussions
        </h2>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <Shimmer key={i} height={120} />)}
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 80 }}>
          {posts.length === 0 ? (
            <p style={{ color: 'var(--cream-3)', fontSize: 14, padding: '32px 0' }}>No posts yet. Be the first.</p>
          ) : (
            <>
              {posts.map(post => (
                <PostCard
                  key={post.post_id}
                  post={{ ...post, time: post.created_at ? timeAgo(post.created_at) : undefined }}
                />
              ))}
              {cursor && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    marginTop: 18, alignSelf: 'center',
                    background: 'transparent', color: 'var(--cream-2)',
                    border: '1px solid rgba(212,168,67,0.25)', borderRadius: 6,
                    padding: '10px 22px', fontFamily: 'var(--font-body)', fontSize: 13,
                    letterSpacing: '0.04em', cursor: loadingMore ? 'default' : 'pointer',
                    opacity: loadingMore ? 0.5 : 1, transition: 'all 0.18s var(--ease)',
                  }}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

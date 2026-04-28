'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api';
import type { PostPublic } from '@/lib/api';
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
  const [posts, setPosts]     = useState<PostPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getPosts()
      .then(data => { if (!cancelled) { setPosts(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setPosts([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

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
          {posts.length === 0
            ? <p style={{ color: 'var(--cream-3)', fontSize: 14, padding: '32px 0' }}>No posts yet. Be the first.</p>
            : posts.map(post => <PostCard key={post.post_id} post={{ ...post, time: post.created_at ? timeAgo(post.created_at) : undefined }} />)
          }
        </div>
      )}
    </section>
  );
}

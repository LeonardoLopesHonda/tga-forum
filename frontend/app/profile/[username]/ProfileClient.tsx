'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api';
import type { ProfilePublic } from '@/lib/api';
import authStore, { type AuthUser } from '@/lib/auth-store';
import Avatar, { deriveUser } from '@/app/components/Avatar';
import PostCard from '@/app/components/PostCard';
import Shimmer from '@/app/components/Shimmer';

const BIO_MAX = 160;

export default function ProfileClient({ username }: { username: string }) {
  const [profile, setProfile]   = useState<ProfilePublic | null>(null);
  const [auth, setAuth]         = useState<{ user: AuthUser | null }>({ user: null });
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    authStore.init();
    setAuth({ user: authStore.user });
    const unsub = authStore.subscribe((user) => setAuth({ user }));
    return unsub;
  }, []);

  useEffect(() => {
    api.getProfile(username)
      .then(setProfile)
      .catch((e: Error & { status?: number }) => {
        if (e.status === 404) setNotFound(true);
      });
  }, [username]);

  const isOwner = auth.user?.username === username;

  function startEdit() {
    setDraft(profile?.bio ?? '');
    setEditing(true);
    setError(null);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function saveEdit() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateBio(username, draft);
      setProfile({ ...profile, bio: updated.bio });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (notFound) {
    return (
      <div style={{ maxWidth: 680, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--cream-3)', fontSize: 15 }}>User not found.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 680, margin: '80px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Shimmer height={100} />
        <Shimmer height={80} />
        <Shimmer height={80} />
      </div>
    );
  }

  const avatarUser = { ...deriveUser(profile.user_id), username: profile.username };

  return (
    <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--depth-1)',
        border: '1px solid rgba(212,168,67,0.13)',
        borderRadius: 8,
        padding: '28px 28px 24px',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Avatar user={avatarUser} size={52} />
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400,
            color: 'var(--cream)', margin: 0,
          }}>
            {profile.username}
          </h1>
        </div>

        {/* Bio */}
        {editing ? (
          <div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value.slice(0, BIO_MAX))}
              autoFocus
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--depth-2)', border: '1px solid rgba(212,168,67,0.30)',
                borderRadius: 6, padding: '10px 12px',
                color: 'var(--cream-2)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'var(--font-body)', resize: 'vertical',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: draft.length >= BIO_MAX ? '#c07070' : 'var(--cream-4)' }}>
                {draft.length}/{BIO_MAX}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {error && <span style={{ fontSize: 12, color: '#c07070', alignSelf: 'center' }}>{error}</span>}
                <button
                  onClick={cancelEdit}
                  style={{
                    background: 'transparent', border: '1px solid rgba(212,168,67,0.20)',
                    borderRadius: 6, padding: '6px 16px', color: 'var(--cream-3)',
                    fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  style={{
                    background: 'var(--gold)', border: 'none', borderRadius: 6,
                    padding: '6px 16px', color: '#05040A',
                    fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 600,
                    cursor: saving ? 'default' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <p style={{
              fontSize: 14, color: profile.bio ? 'var(--cream-2)' : 'var(--cream-4)',
              lineHeight: 1.65, margin: 0, fontStyle: profile.bio ? 'normal' : 'italic',
            }}>
              {profile.bio ?? (isOwner ? 'Add a bio…' : 'No bio yet.')}
            </p>
            {isOwner && (
              <button
                onClick={startEdit}
                style={{
                  background: 'transparent', border: '1px solid rgba(212,168,67,0.20)',
                  borderRadius: 6, padding: '5px 14px', color: 'var(--cream-3)',
                  fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer',
                  flexShrink: 0, transition: 'border-color 0.18s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.50)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,168,67,0.20)'; }}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Posts */}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 400,
        color: 'var(--cream-3)', marginBottom: 16,
        borderBottom: '1px solid rgba(212,168,67,0.10)', paddingBottom: 10,
      }}>
        Posts
      </h2>

      {profile.posts.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--cream-4)', fontStyle: 'italic' }}>No posts yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {profile.posts.map(post => (
            <PostCard key={post.post_id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

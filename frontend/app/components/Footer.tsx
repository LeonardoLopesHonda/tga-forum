'use client';

import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();
  return (
    <footer style={{
      borderTop: '1px solid rgba(212,168,67,0.07)', padding: '36px clamp(20px,5vw,48px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
    }}>
      <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--cream-3)' }}>
        TGA
      </button>
      <p style={{ fontSize: 11, color: 'var(--cream-4)', letterSpacing: '0.06em' }}>Connect · Explore · Engineer</p>
    </footer>
  );
}

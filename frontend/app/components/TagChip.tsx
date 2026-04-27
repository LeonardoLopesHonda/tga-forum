'use client';

const TC: Record<string, { bg: string; border: string; text: string }> = {
  Engineering: { bg: 'rgba(212,168,67,0.10)', border: 'rgba(212,168,67,0.25)', text: '#D4A843' },
  Explore:     { bg: 'rgba(160,144,112,0.10)', border: 'rgba(160,144,112,0.22)', text: '#A09070' },
  Connect:     { bg: 'rgba(180,130,80,0.10)', border: 'rgba(180,130,80,0.22)', text: '#C09060' },
};

export default function TagChip({ tag }: { tag?: string }) {
  if (!tag) return null;
  const c = TC[tag] || TC['Explore'];
  return (
    <span style={{
      fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 500,
      padding: '3px 9px', borderRadius: 3, flexShrink: 0,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontFamily: 'var(--font-body)',
    }}>
      {tag}
    </span>
  );
}

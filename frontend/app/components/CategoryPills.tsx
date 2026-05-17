'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as categoriesApi from '@/lib/api/categories';
import type { Category } from '@/lib/api/categories';

export default function CategoryPills() {
  const [cats, setCats] = useState<Category[]>([]);
  const router  = useRouter();
  const params  = useSearchParams();
  const active  = params.get('category');

  useEffect(() => {
    categoriesApi.list().then(setCats).catch(() => setCats([]));
  }, []);

  const select = (slug: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set('category', slug);
    else      next.delete('category');
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Pill
          label="All"
          active={active === null}
          gradient={null}
          onClick={() => select(null)}
        />
        {cats.map(c => (
          <Pill
            key={c.category_id}
            label={c.name}
            active={active === c.slug}
            gradient={categoriesApi.gradient(c)}
            onClick={() => select(c.slug)}
          />
        ))}
      </div>
    </div>
  );
}

type PillProps = {
  label:    string;
  active:   boolean;
  gradient: string | null;
  onClick:  () => void;
};

function Pill({ label, active, gradient, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active && gradient ? gradient : (active ? 'rgba(212,168,67,0.15)' : 'transparent'),
        border: `1px solid ${active ? 'rgba(212,168,67,0.50)' : 'rgba(212,168,67,0.18)'}`,
        borderRadius: 999, padding: '6px 14px',
        fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.04em',
        color: active ? 'var(--cream)' : 'var(--cream-3)',
        cursor: 'pointer', transition: 'all 0.18s var(--ease)',
      }}
    >
      {label}
    </button>
  );
}

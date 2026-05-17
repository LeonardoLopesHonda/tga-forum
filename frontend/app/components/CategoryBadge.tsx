'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import * as categoriesApi from '@/lib/api/categories';
import type { Category } from '@/lib/api/categories';

type Props = {
  categoryId: number | null;
  size?:      'sm' | 'md';
};

export default function CategoryBadge({ categoryId, size = 'sm' }: Props) {
  const [cat, setCat] = useState<Category | null>(null);

  useEffect(() => {
    if (categoryId === null) { setCat(null); return; }
    let cancelled = false;
    categoriesApi.list().then(cats => {
      if (cancelled) return;
      setCat(cats.find(c => c.category_id === categoryId) ?? null);
    });
    return () => { cancelled = true; };
  }, [categoryId]);

  if (!cat) return null;

  const padding = size === 'md' ? '5px 14px' : '3px 10px';
  const fontSize = size === 'md' ? 12 : 11;

  return (
    <Link
      href={`/?category=${encodeURIComponent(cat.slug)}`}
      onClick={e => e.stopPropagation()}
      style={{
        background: categoriesApi.gradient(cat),
        borderRadius: 999, padding, fontFamily: 'var(--font-body)', fontSize,
        letterSpacing: '0.04em', color: 'var(--cream)', textDecoration: 'none',
        fontWeight: 500, display: 'inline-block', lineHeight: 1.4,
      }}
    >
      {cat.name}
    </Link>
  );
}

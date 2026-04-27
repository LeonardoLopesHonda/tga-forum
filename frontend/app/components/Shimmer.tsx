'use client';

export default function Shimmer({ height = 80, radius = 6 }: { height?: number; radius?: number }) {
  return (
    <div style={{
      height, borderRadius: radius,
      background: 'linear-gradient(90deg, #0D0B12 25%, #1C1930 50%, #0D0B12 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite linear',
      border: '1px solid rgba(212,168,67,0.08)',
    }} />
  );
}

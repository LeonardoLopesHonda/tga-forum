'use client';

const PALETTE: [string, string][] = [
  ['#5C420C', '#D4A843'], ['#1C1930', '#9A7420'], ['#3D2C06', '#EDD07A'],
  ['#131020', '#B8912E'], ['#252240', '#D4A843'], ['#5C420C', '#F7E7B4'],
];

export function deriveUser(userId: number) {
  const idx = Math.abs(Math.trunc(userId) || 0) % PALETTE.length;
  const [c1, c2] = PALETTE[idx];
  return { initials: `U${userId}`, color: [c1, c2] as [string, string], username: `user_${userId}` };
}

type AvatarUser = { initials?: string; color?: [string, string]; username?: string };

export default function Avatar({ user, size = 28 }: { user: AvatarUser | null; size?: number }) {
  if (!user) return null;
  const [c1, c2] = user.color || ['#3D2C06', '#D4A843'];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg,${c1},${c2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700, color: '#05040A',
        fontFamily: 'var(--font-body)',
      }}
    >
      {user.initials || (user.username || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

'use client';

const PALETTE: [string, string][] = [
  ['#5C420C', '#D4A843'], ['#1C1930', '#9A7420'], ['#3D2C06', '#EDD07A'],
  ['#131020', '#B8912E'], ['#252240', '#D4A843'], ['#5C420C', '#F7E7B4'],
];

function hashId(id: string | number): number {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function deriveUser(userId: string | number) {
  const idx = hashId(userId) % PALETTE.length;
  const [c1, c2] = PALETTE[idx];
  return { color: [c1, c2] as [string, string] };
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
      {user.initials || (user.username ? user.username.slice(0, 2).toUpperCase() : '?')}
    </div>
  );
}

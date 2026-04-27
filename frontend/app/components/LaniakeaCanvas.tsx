'use client';

import { useEffect, useRef } from 'react';

export default function LaniakeaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let W = canvas.offsetWidth, H = canvas.offsetHeight;

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const N = 180;
    type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; gold: boolean; trail: { x: number; y: number }[] };
    const pts: Particle[] = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * Math.min(W, H) * 0.55;
      return {
        x: W / 2 + Math.cos(a) * r,
        y: H / 2 + Math.sin(a) * r * 0.5,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.55 + 0.1,
        gold: Math.random() > 0.48,
        trail: [],
      };
    });

    const draw = () => {
      const cx = W / 2, cy = H / 2;
      ctx.fillStyle = 'rgba(5,4,10,0.18)';
      ctx.fillRect(0, 0, W, H);

      pts.forEach(p => {
        const dx = cx - p.x, dy = cy - p.y;
        const d  = Math.sqrt(dx * dx + dy * dy) + 1;
        p.vx += (dx / d) * 0.013;
        p.vy += (dy / d) * 0.007;
        p.vx *= 0.984; p.vy *= 0.984;
        p.x  += p.vx;  p.y  += p.vy;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) p.trail.shift();

        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          p.trail.forEach(t => ctx.lineTo(t.x, t.y));
          ctx.strokeStyle = p.gold
            ? `rgba(212,168,67,${p.alpha * 0.32})`
            : `rgba(245,237,216,${p.alpha * 0.1})`;
          ctx.lineWidth = p.size * 0.55;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,168,67,${p.alpha})`
          : `rgba(245,237,216,${p.alpha * 0.45})`;
        ctx.fill();

        if (p.x < -60) p.x = W + 60;
        if (p.x > W + 60) p.x = -60;
        if (p.y < -60) p.y = H + 60;
        if (p.y > H + 60) p.y = -60;
      });

      const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 100);
      grd.addColorStop(0, 'rgba(212,168,67,0.055)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

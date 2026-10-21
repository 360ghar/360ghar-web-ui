/** Score out of 100 as a ring. Pure markup: Astro renders it without hydration. */
import { scoreBand } from './format';

const TONE = { good: 'var(--color-leaf-700)', average: 'var(--color-haldi-700)', poor: 'var(--color-chili-700)' };

export function ScoreRing({ score, size = 128, label }: { score: number; size?: number; label: string }) {
  const stroke = Math.round(size / 12);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const value = Math.round(pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="block flex-none">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-ink-100)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={TONE[scoreBand(pct)]}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dy="-0.18em" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display)" fontWeight={800} fontSize={size * 0.3} fill="var(--color-ink-950)">
        {value}
      </text>
    </svg>
  );
}

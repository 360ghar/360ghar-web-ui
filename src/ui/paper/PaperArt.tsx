import { useId } from 'react';
import { paperArtModel } from '@/lib/paper/artModel';
import type { Layer } from '@/lib/paper/shapes';
import { compactPath } from './compact';

type Props = {
  layers: Layer[];
  width: number;
  height: number;
  /** Background fill. `null` leaves it transparent. */
  bg?: string | null;
  /** Seed for a hand-cut background edge. */
  cutEdge?: string;
  shadow?: [dx: number, dy: number, blur: number];
  /** Draw this art's own filters instead of the page's shared ones (PaperDefs). */
  ownFilters?: boolean;
  /** "meet" (default) shows the whole scene; "slice" fills the box like a cover photo (give the box a height). */
  fit?: 'meet' | 'slice';
  label?: string;
  className?: string;
};

/** React twin of PaperArt.astro: paper layers as one static SVG, with the shared shadow filters by default. */
export function PaperArt({ layers, width, height, bg, cutEdge, shadow, ownFilters = false, fit = 'meet', label, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const art = paperArtModel({ layers, width, height, bg, cutEdge, shadow, ownFilters, uid });
  const edge = art.edge && compactPath(art.edge);
  return (
    <svg
      className={className}
      style={{ display: 'block', width: '100%', height: fit === 'slice' ? '100%' : 'auto' }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={fit === 'slice' ? 'xMidYMax slice' : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {art.filters.length > 0 || edge ? (
        <defs>
          {art.filters.map((f) => (
            <filter key={f.id} id={f.id} x="-5%" y="-10%" width="115%" height="130%">
              <feDropShadow dx={f.dx} dy={f.dy} stdDeviation={f.blur} floodColor={f.color} />
            </filter>
          ))}
          {edge ? (
            <clipPath id={art.edgeId}>
              <path d={edge} />
            </clipPath>
          ) : null}
        </defs>
      ) : null}
      <g clipPath={edge ? `url(#${art.edgeId})` : undefined}>
        {art.bg ? edge ? <path d={edge} fill={art.bg} /> : <rect width={width} height={height} fill={art.bg} /> : null}
        {art.groups.map((g) => (
          <g key={g.id} fill={g.fill} filter={g.filter ? `url(#${g.filter})` : undefined}>
            {g.cut.map((d, i) => (
              <path key={`c${i}`} fillRule="evenodd" d={compactPath(d)} />
            ))}
            {g.solid.map((d, i) => (
              <path key={`s${i}`} d={compactPath(d)} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

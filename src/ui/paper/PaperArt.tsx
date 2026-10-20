import { useId } from 'react';
import { sharedShadowId } from '@/lib/paper/defs';
import { makeTools, type Layer } from '@/lib/paper/shapes';
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
export function PaperArt({ layers, width, height, bg = 'var(--color-kesar-100)', cutEdge, shadow = [2, 3, 1.1], ownFilters = false, fit = 'meet', label, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const [dx, dy, blur] = shadow;
  const edge = cutEdge ? compactPath(makeTools(`edge-${cutEdge}`, 0.9).rect(1.2, 1.2, width - 2.4, height - 2.4)) : null;
  const filterOf = (l: Layer) => (l.shadow === 'transparent' ? null : ((ownFilters ? null : sharedShadowId(l.shadow, shadow)) ?? `${uid}-${l.id}`));
  const own = layers.filter((l) => filterOf(l) === `${uid}-${l.id}`);
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
      {own.length > 0 || edge ? (
        <defs>
          {own.map((l) => (
            <filter key={l.id} id={`${uid}-${l.id}`} x="-5%" y="-10%" width="115%" height="130%">
              <feDropShadow dx={dx} dy={dy} stdDeviation={blur} floodColor={l.shadow} />
            </filter>
          ))}
          {edge ? (
            <clipPath id={`${uid}-edge`}>
              <path d={edge} />
            </clipPath>
          ) : null}
        </defs>
      ) : null}
      <g clipPath={edge ? `url(#${uid}-edge)` : undefined}>
        {bg ? edge ? <path d={edge} fill={bg} /> : <rect width={width} height={height} fill={bg} /> : null}
        {layers.map((l) => {
          const f = filterOf(l);
          return (
            <g key={l.id} fill={l.fill} filter={f ? `url(#${f})` : undefined}>
              {l.cut.map((d, i) => (
                <path key={`c${i}`} fillRule="evenodd" d={compactPath(d)} />
              ))}
              {l.solid.map((d, i) => (
                <path key={`s${i}`} d={compactPath(d)} />
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

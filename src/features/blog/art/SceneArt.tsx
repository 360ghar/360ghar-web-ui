/**
 * Renders a paper-cut scene from ./scenes as static SVG. Pure markup: it
 * works in Astro (no hydration) and inside islands. `fit="cover"` fills a
 * box of any ratio (cropped from the top, so the ground stays). `fit="strip"`
 * is for a scene drawn with `wide: true`: it fills a box from about 1.7:1 to
 * 4:1 with the whole subject and its full height, and more street on the
 * sides as the box gets wider.
 */
import type { CSSProperties } from 'react';
import { SHADOW_SIZES, sharedShadowId } from '@/lib/paper/defs';
import { compactPath } from '@/ui/paper/compact';
import { ART_H, ART_W, type Art } from './scenes';
import './art.css';

type Props = {
  art: Art;
  className?: string;
  label?: string;
  fit?: 'cover' | 'strip';
  /** Draw every filter in this SVG instead of pointing at the page's shared ones (for a standalone file). */
  ownFilters?: boolean;
};

export function SceneArt({ art, className, label, fit = 'cover', ownFilters = false }: Props) {
  // Filter ids come from the scene, not useId: separate server-rendered roots would repeat useId values.
  const uid = art.id;
  const last = Math.max(1, art.layers.length - 1);
  // A layer whose tint matches a shared paper shadow (PaperDefs in the base layout) points at it; the rest draw their own.
  const ids = art.layers.map((l) => (ownFilters ? null : sharedShadowId(l.shadow, SHADOW_SIZES.l)));
  const own = art.layers.filter((_, i) => !ids[i]);
  return (
    <svg
      className={className ? `scene-art ${className}` : 'scene-art'}
      viewBox={fit === 'strip' ? `${art.x0} 24 ${art.x1 - art.x0} ${ART_H - 24}` : `0 0 ${ART_W} ${ART_H}`}
      preserveAspectRatio="xMidYMax slice"
      focusable="false"
      data-scene={art.scene}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {own.length > 0 && (
        <defs>
          {own.map((l) => (
            <filter key={l.id} id={`${uid}-${l.id}`} x="-5%" y="-10%" width="115%" height="130%">
              <feDropShadow dx="3" dy="4" stdDeviation="1.4" floodColor={l.shadow} />
            </filter>
          ))}
        </defs>
      )}
      <rect x={art.x0 - 12} y={-12} width={art.x1 - art.x0 + 24} height={ART_H + 24} fill={art.bg} />
      {art.layers.map((l, i) => (
        <g key={l.id} fill={l.fill} filter={`url(#${ids[i] ?? `${uid}-${l.id}`})`} style={{ '--d': (i / last).toFixed(2) } as CSSProperties}>
          {l.cut.map((d, j) => (
            <path key={`c${j}`} fillRule="evenodd" d={compactPath(d)} />
          ))}
          {l.solid.map((d, j) => (
            <path key={`s${j}`} d={compactPath(d)} />
          ))}
        </g>
      ))}
    </svg>
  );
}

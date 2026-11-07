import type { Layer } from '@/lib/paper/shapes';
import { HOUSE_H, HOUSE_W, houseLayers, vignette, type AccountVignetteName } from '@/lib/paper/accountVignettes';
import { vignetteLayers, VIGNETTE_H, VIGNETTE_W } from '@/lib/paper/vignettes';
import { PaperArt } from './PaperArt';
import { PaperVignette } from './PaperVignette';

/** An account scene (320 x 200) with a hand-cut edge. */
export function AccountVignette({ name, className }: { name: AccountVignetteName; className?: string }) {
  const s = vignette(name);
  return <PaperArt layers={s.layers} width={s.w} height={s.h} bg="var(--color-kesar-50)" cutEdge={`acct-${name}`} className={className} />;
}

/**
 * The post-property house: one more piece is placed at each step. Pieces not
 * placed yet show as a flat template. `data-fresh` names the piece placed at
 * this step, so the page CSS can let it settle in.
 */
export function HouseProgress({ placed, className }: { placed: number; className?: string }) {
  const pieces = houseLayers(placed);
  const layers: Layer[] = pieces.map((l) => (l.placed ? l : { ...l, fill: 'var(--color-kesar-100)', shadow: 'transparent' }));
  const fresh = pieces.findIndex((l) => l.step === placed);
  return (
    <div className={className} data-fresh={fresh >= 0 ? fresh : undefined}>
      <PaperArt layers={layers} width={HOUSE_W} height={HOUSE_H} bg="var(--color-kesar-50)" cutEdge="post-house" />
    </div>
  );
}

/**
 * The slot of a listing photo that does not exist yet: the paper 360° camera,
 * cropped to the photo's box (the page CSS fills the box with the art).
 */
export function NoPhoto({ seed, className = '' }: { seed: string; className?: string }) {
  return (
    <span className={`acct-nophoto ${className}`} aria-hidden="true">
      <PaperVignette theme="camera" seed={seed} frame="square" />
    </span>
  );
}

const cache = new Map<string, string>();

/**
 * The same camera vignette as an image URL, for components that take a photo
 * URL only (the listing card in the post-property preview). Colours are read
 * from the page tokens, because an SVG image cannot see CSS variables.
 */
export function noPhotoUrl(seed = '1'): string {
  const hit = cache.get(seed);
  if (hit) return hit;
  const css = getComputedStyle(document.documentElement);
  const col = (v: string) => v.replace(/var\((--[\w-]+)\)/g, (_, n: string) => css.getPropertyValue(n).trim() || '#ffe2cc');
  const layers = vignetteLayers('camera', seed);
  const defs = layers
    .filter((l) => l.shadow !== 'transparent')
    .map((l) => `<filter id="f${l.id}" x="-5%" y="-10%" width="115%" height="130%"><feDropShadow dx="1.4" dy="2" stdDeviation="0.7" flood-color="${l.shadow}"/></filter>`)
    .join('');
  const body = layers
    .map(
      (l) =>
        `<g fill="${col(l.fill)}"${l.shadow !== 'transparent' ? ` filter="url(#f${l.id})"` : ''}>${l.cut.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join('')}${l.solid.map((d) => `<path d="${d}"/>`).join('')}</g>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIGNETTE_W} ${VIGNETTE_H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs><rect width="${VIGNETTE_W}" height="${VIGNETTE_H}" fill="${col('var(--color-kesar-100)')}"/>${body}</svg>`;
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  cache.set(seed, url);
  return url;
}

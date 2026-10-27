/**
 * The diorama layers as standalone SVG files (served from /diorama/<id>.svg by
 * src/pages/diorama/[layer].svg.ts). As files the browser caches them, so the
 * ~70 KB of paths are not in every page's HTML. A file cannot read the page's
 * CSS variables, so the `var(--…)` colours are resolved here from global.css.
 */
import { createHash } from 'node:crypto';
import css from '@/styles/global.css?raw';
import { SHADOW_SIZES, SHARED_SHADOWS, sharedShadowId } from '@/lib/paper/defs';
import { compactPath } from '@/ui/paper/compact';
import { gurugramLayers, H, W } from './gurugram';

const VARS = new Map([...css.matchAll(/(--[\w-]+):\s*([^;{}]+);/g)].reverse().map((m) => [m[1]!, m[2]!.trim()]));

function resolve(value: string): string {
  return value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
    const v = VARS.get(name);
    if (!v) throw new Error(`Diorama: ${name} is not set in global.css`);
    return resolve(v);
  });
}

// Paths are written in short relative form. The blocks (most of the bytes) are rounded to whole
// units, less than half a pixel at 1600 px, and each goes in one path: their buildings never overlap, so one
// even-odd path cuts the same windows.
const WHOLE = new Set(['blocks']);

function layerSvg(l: ReturnType<typeof gurugramLayers>[number]): string {
  const cut = WHOLE.has(l.id) ? [compactPath(l.cut.join(''), 0)] : l.cut.map((d) => compactPath(d));
  const solid = l.solid.map((d) => compactPath(d));
  let filter = '';
  if (l.shadow !== 'transparent') {
    // Same filter as before: the shared paper filter (PaperDefs) when the raw value matches one of its tints, else the layer's own.
    const shared = SHARED_SHADOWS.find((s) => s.id === sharedShadowId(l.shadow, SHADOW_SIZES.l));
    const [dx, dy, blur] = shared ? shared.shadow : [3, 4, 1.6];
    const box = shared ? 'x="-5%" y="-10%" width="115%" height="130%"' : 'x="-5%" y="-10%" width="112%" height="125%"';
    const color = shared ? shared.color : resolve(l.shadow);
    filter = `<defs><filter id="s" ${box}><feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" flood-color="${color}"/></filter></defs>`;
  }
  const rim = l.rim ? ` stroke="${resolve('var(--dio-rim)')}" stroke-width="1.2"` : '';
  const paths = cut.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join('') + solid.map((d) => `<path d="${d}"/>`).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">${filter}` +
    `<g fill="${resolve(l.fill)}"${filter ? ' filter="url(#s)"' : ''}${rim} stroke-linejoin="round">${paths}</g></svg>`
  );
}

/** Built once per server start: the layers never change at run time. */
export const DIORAMA_LAYERS = gurugramLayers().map((l) => {
  const svg = layerSvg(l);
  return { id: l.id, depth: l.depth, svg, src: `/diorama/${l.id}.svg?v=${createHash('sha1').update(svg).digest('hex').slice(0, 8)}` };
});

/**
 * Paper art as cached SVG files, for drawings the first screen does not show:
 * blog card scenes, the home vignettes, the header menu vignettes and the two
 * skylines. The page sends one short <img> instead of the inline SVG. Each
 * file is self-contained (ui/paper/standalone): its own filters, plain colours.
 *
 *   /art/scene/<scene>.svg             blog card scene (the seed is the scene name)
 *   /art/home/<name>[-bare].svg        home vignette on kesar-50, or with no background
 *   /art/vignette/<theme>-<seed>.svg   PaperVignette with a cut frame (the pairs the site uses)
 *   /art/skyline/<footer|menu>.svg     the footer skyline and the phone menu street
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SceneArt } from '@/features/blog/art/SceneArt';
import { ART_H, ART_W, paperArt, SCENE_NAMES } from '@/features/blog/art/scenes';
import { COPY } from '@/features/home/copy';
import { SIZE, TOP, vignetteLayers, type VignetteName } from '@/features/home/vignettes/vignettes';
import { DATA_HUB, TOOLS } from '@/features/layout/nav';
import { skylineLayers } from '@/features/layout/skyline';
import { VIGNETTE_H, VIGNETTE_W, type VignetteTheme } from '@/lib/paper/vignettes';
import { compactPath } from '@/ui/paper/compact';
import { PaperArt } from '@/ui/paper/PaperArt';
import { PaperVignette } from '@/ui/paper/PaperVignette';
import { svgFile } from '@/ui/paper/standalone';

export const prerender = true;

const html = (el: ReactElement) => renderToStaticMarkup(el);
const FILES = new Map<string, () => string>();

for (const s of SCENE_NAMES) {
  FILES.set(`scene/${s}`, () => svgFile(html(createElement(SceneArt, { art: paperArt(s, s), ownFilters: true })), `0 0 ${ART_W} ${ART_H}`, 'xMidYMax slice'));
}

for (const n of Object.keys(SIZE) as VignetteName[]) {
  const [width, height] = SIZE[n];
  const top = TOP[n] ?? 0;
  for (const bare of [false, true]) {
    const bg = bare ? null : 'var(--color-kesar-50)';
    FILES.set(`home/${n}${bare ? '-bare' : ''}`, () => svgFile(html(createElement(PaperArt, { layers: vignetteLayers(n), width, height: height + top, bg, ownFilters: true })), `0 ${top} ${width} ${height}`));
  }
}

// The header menus (seed "menu") and the home tool groups (seed "home-<index>").
const pairs: [VignetteTheme, string][] = [
  ...[DATA_HUB, TOOLS].flatMap((g) => (g.theme ? [[g.theme, 'menu'] as [VignetteTheme, string]] : [])),
  ...Object.values(COPY).flatMap((c) => c.toolsets.map((g, i) => [g.art, `home-${i}`] as [VignetteTheme, string])),
];
for (const [theme, seed] of pairs) {
  FILES.set(`vignette/${theme}-${seed}`, () => svgFile(html(createElement(PaperVignette, { theme, seed, ownFilters: true })), `0 0 ${VIGNETTE_W} ${VIGNETTE_H}`));
}

type Sheet = [fill: string, filter: string];
const skyline = (seed: string, w: number, h: number, windows: boolean, far: Sheet, near: Sheet) => {
  const s = skylineLayers(seed, w, h, windows);
  const path = ([fill, filter]: Sheet, d: string, rule = '') => `<path fill="${fill}"${filter ? ` style="filter:${filter}"` : ''}${rule} d="${compactPath(d)}"/>`;
  return svgFile(`<svg>${path(far, s.far, ' fill-rule="evenodd"')}${path(near, s.near)}</svg>`, `0 0 ${w} ${h}`, 'xMidYMax slice');
};
FILES.set('skyline/footer', () =>
  skyline('footer', 1600, 120, true, ['var(--color-mist-300)', ''], ['var(--color-mist-200)', 'drop-shadow(-1px -2px 1.5px rgb(20 45 38 / 0.14))']),
);
FILES.set('skyline/menu', () => skyline('menu', 600, 90, false, ['var(--color-mist-100)', ''], ['var(--color-mist-200)', 'drop-shadow(-1px -2px 1px rgb(20 45 38 / 0.14))']));

export const getStaticPaths = (() =>
  [...FILES.keys()].map((key) => {
    const [kind, name] = key.split('/') as [string, string];
    return { params: { kind, name } };
  })) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const make = FILES.get(`${params.kind}/${params.name}`);
  if (!make) return new Response('Not found', { status: 404 });
  return new Response(make(), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};

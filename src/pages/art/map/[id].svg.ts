/**
 * The street plan under the "Show the map" button of a listing page, as a
 * cached SVG file: /art/map/<listing id>.svg, shown with a lazy <img> (the
 * section is below the first screen). The plan is seeded by the listing id
 * (features/property/scenes), and new listings arrive every day, so the file
 * is drawn on request, then kept by the browser and the CDN: the same id
 * always draws the same plan, and a deploy clears the CDN.
 */
import type { APIRoute } from 'astro';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MAP_H, MAP_W, mapPin, mapScene } from '@/features/property/scenes';
import { PaperArt } from '@/ui/paper/PaperArt';
import { svgFile } from '@/ui/paper/standalone';

export const prerender = false;

export const mapFile = (id: number) =>
  svgFile(renderToStaticMarkup(createElement(PaperArt, { layers: [...mapScene(id), mapPin()], width: MAP_W, height: MAP_H, bg: 'var(--color-kesar-50)', ownFilters: true })), `0 0 ${MAP_W} ${MAP_H}`);

export const GET: APIRoute = ({ params }) => {
  if (!/^[1-9]\d{0,8}$/.test(params.id ?? '')) return new Response('Not found', { status: 404 });
  return new Response(mapFile(Number(params.id)), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=31536000',
    },
  });
};

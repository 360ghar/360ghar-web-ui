/**
 * CDN caching for on-demand pages. Browsers always revalidate; the edge keeps
 * the page for `ttl` seconds and serves it stale while it refreshes. Each CDN
 * gets its own directive header (Netlify strips Netlify-CDN-Cache-Control;
 * Cloudflare Workers Cache reads Cloudflare-CDN-Cache-Control and strips it),
 * so the browser-facing Cache-Control is identical on both hosts.
 * Pages that hit an API error use a short TTL so a broken render does not stick.
 */
import type { AstroGlobal } from 'astro';

const TTL = { minute: 60, short: 300, medium: 600, hour: 3600, day: 86400 } as const;
export type CacheTier = keyof typeof TTL;

export function cachePage(astro: Pick<AstroGlobal, 'response'>, tier: CacheTier, opts: { error?: boolean } = {}) {
  const ttl = opts.error ? 60 : TTL[tier];
  const swr = opts.error ? 60 : 86400;
  astro.response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  astro.response.headers.set('Netlify-CDN-Cache-Control', `public, durable, s-maxage=${ttl}, stale-while-revalidate=${swr}`);
  // Cloudflare (cache/concepts/cache-control): s-maxage implies proxy-revalidate,
  // which disables stale serving — so the stale-while-revalidate window needs
  // max-age, not s-maxage. This header is edge-only (stripped before browsers).
  astro.response.headers.set('Cloudflare-CDN-Cache-Control', `public, max-age=${ttl}, stale-while-revalidate=${swr}`);
}

/**
 * Status and cache headers for one render. `notFound` gives 404 and `error` gives
 * 503 (404 wins). `error` also picks the short error TTL, whatever the status.
 */
export function respond(astro: Pick<AstroGlobal, 'response'>, tier: CacheTier, opts: { notFound?: boolean; error?: boolean } = {}) {
  if (opts.notFound) astro.response.status = 404;
  else if (opts.error) astro.response.status = 503;
  cachePage(astro, tier, { error: Boolean(opts.error) });
}

export function noStore(astro: Pick<AstroGlobal, 'response'>) {
  astro.response.headers.set('Cache-Control', 'private, no-store');
}

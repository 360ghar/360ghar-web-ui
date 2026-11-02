import { describe, expect, it } from 'vitest';
import { cachePage, noStore, respond, type CacheTier } from './cache';

const res = () => {
  // Astro's response allows `status` assignment; a bare Response does not.
  const page = new Response();
  Object.defineProperty(page, 'status', { writable: true, value: 200 });
  return page;
};

describe('cachePage', () => {
  it('caches the homepage tier for an hour at the edge, stale for a day while revalidating', () => {
    const page = res();
    cachePage({ response: page }, 'hour');
    expect(page.headers.get('cache-control')).toBe('public, max-age=0, must-revalidate');
    expect(page.headers.get('netlify-cdn-cache-control')).toBe('public, durable, s-maxage=3600, stale-while-revalidate=86400');
    expect(page.headers.get('cloudflare-cdn-cache-control')).toBe('public, max-age=3600, stale-while-revalidate=86400');
  });

  it('keeps every other tier at its current TTL on both CDNs', () => {
    const tiers: [CacheTier, number][] = [['minute', 60], ['short', 300], ['medium', 600], ['day', 86400]];
    for (const [tier, ttl] of tiers) {
      const page = res();
      cachePage({ response: page }, tier);
      expect(page.headers.get('netlify-cdn-cache-control'), tier).toContain(`s-maxage=${ttl}, stale-while-revalidate=86400`);
      // Cloudflare edge tier: max-age (not s-maxage), whose proxy-revalidate
      // semantics would disable the stale-while-revalidate window.
      expect(page.headers.get('cloudflare-cdn-cache-control'), tier).toContain(`max-age=${ttl}, stale-while-revalidate=86400`);
    }
  });

  it('short-caches an error render instead of the tier TTL', () => {
    const page = res();
    cachePage({ response: page }, 'hour', { error: true });
    expect(page.headers.get('netlify-cdn-cache-control')).toBe('public, durable, s-maxage=60, stale-while-revalidate=60');
    expect(page.headers.get('cloudflare-cdn-cache-control')).toBe('public, max-age=60, stale-while-revalidate=60');
  });
});

describe('respond', () => {
  it('sets the 404 status with the tier cache headers', () => {
    const page = res();
    respond({ response: page }, 'hour', { notFound: true });
    expect(page.status).toBe(404);
    expect(page.headers.get('cloudflare-cdn-cache-control')).toContain('max-age=3600');
  });

  it('uses the error TTL on a 503', () => {
    const page = res();
    respond({ response: page }, 'day', { error: true });
    expect(page.status).toBe(503);
    expect(page.headers.get('netlify-cdn-cache-control')).toContain('s-maxage=60');
  });
});

describe('noStore', () => {
  it('stays private on the standard header only, so both CDNs bypass', () => {
    const page = res();
    noStore({ response: page });
    expect(page.headers.get('cache-control')).toBe('private, no-store');
    expect(page.headers.has('netlify-cdn-cache-control')).toBe(false);
    expect(page.headers.has('cloudflare-cdn-cache-control')).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxyWellKnown } from './well-known';

afterEach(() => vi.unstubAllGlobals());

describe('proxyWellKnown', () => {
  it('passes the upstream status and body through with open CORS and edge cache headers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response('{"key":"value"}', { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } })),
    );
    const res = await proxyWellKnown('assetlinks.json');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('{"key":"value"}');
    expect(res.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600');
    expect(res.headers.get('Cloudflare-CDN-Cache-Control')).toBe('public, max-age=3600');
    expect(fetch).toHaveBeenCalledWith('https://api.360ghar.com/.well-known/assetlinks.json');
  });

  it('answers 502 instead of throwing when the upstream is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    const res = await proxyWellKnown('apple-app-site-association');
    expect(res.status).toBe(502);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('does not cache an upstream error status', async () => {
    for (const status of [404, 500, 503]) {
      vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status })));
      const res = await proxyWellKnown('assetlinks.json');
      expect(res.status, `status ${status}`).toBe(status);
      expect(res.headers.get('Cache-Control'), `status ${status}`).toBe('no-store');
      expect(res.headers.has('Cloudflare-CDN-Cache-Control'), `status ${status}`).toBe(false);
    }
  });
});

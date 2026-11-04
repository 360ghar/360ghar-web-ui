import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxyPostHog } from './proxy';

afterEach(() => vi.unstubAllGlobals());

function capture() {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response('ok', { status: 200 });
  });
  return calls;
}

describe('proxyPostHog', () => {
  it('sends assets to the assets host unchanged', async () => {
    const calls = capture();
    await proxyPostHog(new Request('https://360ghar.com/rel/static/array.js'), '/rel/static/array.js', '');
    expect(calls[0]!.url).toBe('https://us-assets.i.posthog.com/static/array.js');
  });

  it('puts the trailing slash back on API paths and keeps the query', async () => {
    const calls = capture();
    const req = new Request('https://360ghar.com/rel/e?ip=0', { method: 'POST', body: 'x', headers: { cookie: 'a=b', 'cf-connecting-ip': '1.2.3.4', authorization: 'Bearer secret' } });
    await proxyPostHog(req, '/rel/e', '?ip=0');
    const { url, init } = calls[0]!;
    expect(url).toBe('https://us.i.posthog.com/e/?ip=0');
    const h = init.headers as Headers;
    expect(h.get('cookie')).toBeNull();
    expect(h.get('authorization')).toBeNull();
    expect(h.get('x-forwarded-for')).toBe('1.2.3.4');
  });

  it('keeps the project token header', async () => {
    const calls = capture();
    await proxyPostHog(new Request('https://360ghar.com/rel/flags', { method: 'POST', body: '{}', headers: { authorization: 'Bearer phc_x' } }), '/rel/flags', '');
    expect((calls[0]!.init.headers as Headers).get('authorization')).toBe('Bearer phc_x');
  });
});

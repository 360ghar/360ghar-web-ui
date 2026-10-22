import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import { api, attempt, call, multipart, postJson, timeoutMs } from './client';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
/** A list response: every list route sends the five CursorPage keys. */
const page = <T,>(items: T[]) => ({ items, next_cursor: null, has_more: false, limit: 20, total: null });

afterEach(() => vi.unstubAllGlobals());

describe('api client', () => {
  it('returns data on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ok(page([{ id: 1, title: 'Gym' }]))));
    const data = await call(api.GET('/api/v1/amenities'));
    expect(data.items).toHaveLength(1);
    expect(data.has_more).toBe(false);
  });

  it('retries a GET on 503, then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('busy', { status: 503 }))
      .mockResolvedValueOnce(ok(page([])));
    vi.stubGlobal('fetch', fetchMock);
    await call(api.GET('/api/v1/amenities'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('waits for a short Retry-After before it retries a GET', async () => {
    vi.useFakeTimers();
    try {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response('busy', { status: 503, headers: { 'retry-after': '2' } }))
        .mockResolvedValueOnce(ok(page([])));
      vi.stubGlobal('fetch', fetchMock);
      const done = call(api.GET('/api/v1/amenities'));
      await vi.advanceTimersByTimeAsync(1_900);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(200);
      await done;
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not retry when Retry-After is longer than a retry can wait, and keeps the value on the error', async () => {
    const body = { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } };
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status: 429, headers: { 'content-type': 'application/json', 'retry-after': '60' } }));
    vi.stubGlobal('fetch', fetchMock);
    const r = await attempt(api.GET('/api/v1/amenities'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(r.error).toMatchObject({ status: 429, code: 'RATE_LIMIT_EXCEEDED', kind: 'rate_limited', retryAfter: 60 });
  });

  it('throws a network ApiError when the backend is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))));
    const r = await attempt(api.GET('/api/v1/amenities'));
    expect(r.data).toBeNull();
    expect(r.error).toBeInstanceOf(ApiError);
    expect(r.error?.kind).toBe('network');
  });

  it('serialises arrays as repeated keys', async () => {
    const fetchMock = vi.fn(async (_req: Request) => ok({ items: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await call(api.GET('/api/v1/properties', { params: { query: { property_type: ['apartment', 'villa'], limit: 12 } } }));
    const url = new URL(fetchMock.mock.calls[0]![0].url);
    expect(url.searchParams.getAll('property_type')).toEqual(['apartment', 'villa']);
    expect(url.pathname).toBe('/api/v1/properties');
  });

  it('does not retry a POST', async () => {
    const fetchMock = vi.fn(async () => new Response('busy', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(call(api.POST('/api/v1/swipes', { body: { property_id: 1, is_liked: true } }))).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sends multipart bodies as FormData, without a JSON content type', async () => {
    const fetchMock = vi.fn(async (_req: Request) => ok({ data: {}, provider_used: 'agnes' }));
    vi.stubGlobal('fetch', fetchMock);
    const form = new FormData();
    form.append('image', new File(['x'], 'plan.png', { type: 'image/png' }));
    await call(api.POST('/api/v1/vastu/analyze', multipart(form)));
    const req = fetchMock.mock.calls[0]![0];
    expect(req.headers.get('content-type')).toMatch(/^multipart\/form-data; boundary=/);
    expect((await req.formData()).get('image')).toBeInstanceOf(File);
  });

  it('reads a blob when asked', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['png']), { status: 200, headers: { 'content-type': 'image/png' } })));
    const blob = await call(api.GET('/api/v1/data-hub/jamabandi/captcha', { parseAs: 'blob' }));
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(3);
  });

  it('times out after the per-request timeoutMs', async () => {
    vi.stubGlobal('fetch', vi.fn((_req: Request, init?: RequestInit) => new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason)))));
    const r = await attempt(api.GET('/api/v1/amenities', timeoutMs(20)));
    expect(r.error?.kind).toBe('timeout');
  });

  it('adds the bearer token and retries a multipart POST once after a 401', async () => {
    vi.resetModules();
    vi.stubGlobal('window', {});
    vi.stubEnv('PUBLIC_API_BASE', 'https://api.test');
    const client = await import('./client');
    client.setAuthProvider({ token: async () => 'old', refresh: async () => 'fresh' });
    const seen: { auth: string | null; files: number }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (req: Request) => {
        seen.push({ auth: req.headers.get('authorization'), files: (await req.formData()).getAll('files').length });
        return seen.length === 1 ? new Response('{}', { status: 401 }) : ok({ items: [] });
      }),
    );
    const form = new FormData();
    form.append('files', new File(['x'], 'a.png', { type: 'image/png' }));
    await client.call(client.api.POST('/api/v1/upload/batch', client.multipart(form)));
    vi.unstubAllEnvs();
    expect(seen).toEqual([
      { auth: 'Bearer old', files: 1 },
      { auth: 'Bearer fresh', files: 1 },
    ]);
  });

  it('notes a no-store response, which keeps its data out of browser storage', async () => {
    vi.resetModules();
    vi.stubGlobal('window', {});
    vi.stubEnv('PUBLIC_API_BASE', 'https://api.test');
    const client = await import('./client');
    expect(client.sawNoStore()).toBe(false);
    vi.stubGlobal('fetch', vi.fn(async () => ok(page([]))));
    await client.call(client.api.GET('/api/v1/amenities'));
    expect(client.sawNoStore()).toBe(false);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(page([])), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' } })));
    await client.call(client.api.GET('/api/v1/amenities'));
    vi.unstubAllEnvs();
    expect(client.sawNoStore()).toBe(true);
  });
});

describe('postJson', () => {
  it('sends the body as JSON and returns the status and the parsed reply', async () => {
    const fetchMock = vi.fn(async (req: Request) => ok({ got: await req.clone().json() }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await postJson('/api/v1/x', { a: 1 })).toEqual({ status: 200, json: { got: { a: 1 } } });
    expect(fetchMock.mock.calls[0]![0].headers.get('content-type')).toBe('application/json');
  });
  it('gives the status and null json for an error that is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 404 })));
    expect(await postJson('/api/v1/x', {})).toEqual({ status: 404, json: null });
  });
  it('never throws: a network failure is status 0', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline'); }));
    expect(await postJson('/api/v1/x', {})).toEqual({ status: 0, json: null });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
const page = (ids: number[], next: string | null) => ({ items: ids.map((id) => ({ id })), next_cursor: next, has_more: next !== null, limit: 2, total: null });

async function load(status: 'authed' | 'anon' = 'authed') {
  vi.resetModules();
  vi.doMock('@/features/auth/store', () => ({ initAuth: async () => undefined, useAuthStore: { getState: () => ({ status }) } }));
  return import('./store');
}

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => vi.doUnmock('@/features/auth/store'));

describe('loadFavourites', () => {
  it('reads every page of liked homes, following next_cursor', async () => {
    const seen: (string | null)[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (req: Request) => {
        const url = new URL(req.url);
        const cursor = url.searchParams.get('cursor');
        seen.push(cursor);
        expect(url.searchParams.get('is_liked')).toBe('true');
        expect(url.searchParams.get('limit')).toBe('100');
        return json(cursor === null ? page([1, 2], 'a') : cursor === 'a' ? page([3, 4], 'b') : page([5], null));
      }),
    );
    const { loadFavourites, useFavourites } = await load();
    await loadFavourites();
    expect(seen).toEqual([null, 'a', 'b']);
    expect([...useFavourites.getState().liked].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(useFavourites.getState().loaded).toBe(true);
  });

  it('does nothing for a signed-out visitor', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { loadFavourites, useFavourites } = await load('anon');
    await loadFavourites();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useFavourites.getState().liked.size).toBe(0);
  });
});

describe('toggleFavourite', () => {
  it('sets the heart at once and reverts it when the server says no', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: { code: 'X', message: 'no' } }), { status: 500 })));
    const { toggleFavourite, useFavourites } = await load();
    await expect(toggleFavourite(9, true)).rejects.toBeTruthy();
    expect(useFavourites.getState().liked.has(9)).toBe(false);
  });
});

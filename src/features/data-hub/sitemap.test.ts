import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, memoStore } = vi.hoisted(() => ({ get: vi.fn(), memoStore: new Map<string, Promise<unknown>>() }));

vi.mock('@/lib/api/client', () => ({
  api: { GET: get },
  call: async (response: Promise<{ data?: unknown }>) => (await response).data,
}));
/**
 * A faithful stand-in for `lib/memo`: it caches the in-flight promise and drops a
 * rejection so the next call retries. A no-op passthrough would make the cached
 * -failure regression invisible, which is the whole point of the test below.
 */
vi.mock('@/lib/memo', () => ({
  memo: (_key: string, _ttl: number, load: () => Promise<unknown>) => {
    const hit = memoStore.get(_key);
    if (hit) return hit;
    const promise = load();
    memoStore.set(_key, promise);
    promise.catch(() => memoStore.delete(_key));
    return promise;
  },
}));

import { datahubSitemap } from './sitemap';

beforeEach(() => memoStore.clear());

describe('data hub sitemap paths', () => {
  it('lists the ownership lookup, the published HRERA pages, and both detail sets', async () => {
    get.mockReset();
    get.mockResolvedValue({
      data: { items: [{ slug: 'dlf-2', builder_name: 'DLF' }], has_more: false, next_cursor: null, limit: 20, total: 1 },
    });

    const { entries, skipped } = await datahubSitemap();
    const paths = entries.map((entry) => entry.path);

    expect(paths).toContain('/verify-ownership');
    expect(paths).toContain('/rera-projects');
    expect(paths).toContain('/builder-reputation');
    expect(paths).toContain('/builder-reputation/dlf-2');
    // The project detail pages are indexable, so the sitemap enumerates them.
    expect(paths).toContain('/project/dlf-2');
    expect(skipped).toEqual([]);
  });

  it('skips both detail sets instead of failing when the API is down', async () => {
    get.mockReset();
    get.mockRejectedValue(new Error('down'));

    const { entries, skipped } = await datahubSitemap();
    const paths = entries.map((entry) => entry.path);

    expect(paths).toContain('/rera-projects');
    expect(paths.some((path) => path.startsWith('/builder-reputation/'))).toBe(false);
    expect(paths.some((path) => path.startsWith('/project/'))).toBe(false);
    expect(skipped).toEqual(['/builder-reputation/*', '/project/*']);
  });

  it('lists no project page for a row with no slug, which would 404', async () => {
    get.mockReset();
    get.mockResolvedValue({
      data: { items: [{ slug: null, builder_name: 'DLF' }, { slug: 'dlf-privana-west', builder_name: 'DLF' }], has_more: false, next_cursor: null, limit: 20, total: 2 },
    });

    const { entries } = await datahubSitemap();
    const projectPaths = entries.map((entry) => entry.path).filter((path) => path.startsWith('/project/'));

    expect(projectPaths).toEqual(['/project/dlf-privana-west']);
  });

  it('lists a builder detail page for every builder, not only the first page', async () => {
    // The builder index shows page 1 only, and the register holds 97 builders, so a
    // sitemap that read one page left 77 detail pages unlisted.
    get.mockReset();
    const page = (cursor: string | undefined) =>
      cursor
        ? { items: [{ slug: 'builder-21', builder_name: 'B21' }], has_more: false, next_cursor: null, limit: 100, total: 21 }
        : {
            items: Array.from({ length: 20 }, (_, i) => ({ slug: `builder-${i + 1}`, builder_name: `B${i + 1}` })),
            has_more: true,
            next_cursor: 'cursor-2',
            limit: 100,
            total: 21,
          };
    get.mockImplementation((_path: string, opts: { params?: { query?: { cursor?: string } } }) => Promise.resolve({ data: page(opts?.params?.query?.cursor) }));

    const { entries } = await datahubSitemap();
    const builderPaths = entries.map((entry) => entry.path).filter((path) => path.startsWith('/builder-reputation/'));

    expect(builderPaths).toHaveLength(21);
    expect(builderPaths).toContain('/builder-reputation/builder-21');
  });

  it('recovers on the next request after the API was down', async () => {    // The project walk is cached. A failure must not be cached with it, or one
    // request during an outage leaves every project page out of the sitemap for
    // the whole six hours.
    get.mockReset();
    get.mockRejectedValue(new Error('down'));
    const down = await datahubSitemap();
    expect(down.skipped).toContain('/project/*');
    expect(down.entries.some((entry) => entry.path.startsWith('/project/'))).toBe(false);

    get.mockReset();
    get.mockResolvedValue({
      data: { items: [{ slug: 'godrej-zenith', builder_name: 'Godrej' }], has_more: false, next_cursor: null, limit: 20, total: 1 },
    });
    const up = await datahubSitemap();
    expect(up.entries.map((entry) => entry.path)).toContain('/project/godrej-zenith');
    expect(up.skipped).toEqual([]);
  });

  it('leaves out slugs the routes would 404 or hold', async () => {
    get.mockReset();
    get.mockResolvedValue({
      data: { items: [{ slug: 'Bad Slug', builder_name: 'X' }, { slug: 'luxury-apartments-in-sector-62', builder_name: 'Y' }, { slug: 'ok-one', builder_name: 'Z' }], has_more: false, next_cursor: null, limit: 20, total: 3 },
    });
    const paths = (await datahubSitemap()).entries.map((entry) => entry.path);
    expect(paths).not.toContain('/builder-reputation/Bad Slug');
    expect(paths).not.toContain('/project/Bad Slug');
    expect(paths).not.toContain('/project/luxury-apartments-in-sector-62');
    expect(paths).toContain('/project/ok-one');
  });

  it('does not include any held or noindex data pages', async () => {
    get.mockReset();
    get.mockResolvedValue({ data: { items: [], has_more: false, next_cursor: null, limit: 20, total: 0 } });

    const { entries } = await datahubSitemap();
    const paths = entries.map((entry) => entry.path);

    expect(paths).not.toEqual(expect.arrayContaining([
      '/bank-auctions',
      '/auction-sources',
      '/zone-checker',
      '/regulatory-updates',
      '/circle-rates',
      '/stamp-duty-calculator',
      '/tenant-demand-heatmap',
      '/best-sectors-investment-2026',
    ]));
    expect(paths.some((path) => path === '/price-index' || path.startsWith('/price-index/'))).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { API_PAGE_LIMIT, DEFAULT_FETCH_TIMEOUT_MS, buildApiCursorUrl, fetchPaginatedCollection, fetchPaginatedCollectionWithFallbacks } from '../data/lib/paginatedApi.mjs';

const page = (payload) => ({ ok: true, json: async () => payload });

// Ported from the old site's scripts/__tests__/api-pagination.test.mjs.
describe('paginated API helper', () => {
  it('caps the page limit and omits the cursor on the first page', () => {
    expect(buildApiCursorUrl('https://api.360ghar.com/api/v1', '/properties/', null, 1000)).toBe('https://api.360ghar.com/api/v1/properties/?limit=100');
    expect(API_PAGE_LIMIT).toBe(100);
  });

  it('appends the opaque cursor on later pages, and extra query parameters first', () => {
    expect(buildApiCursorUrl('https://api.360ghar.com/api/v1', '/properties/', 'YWJjMTIz', 100)).toBe('https://api.360ghar.com/api/v1/properties/?limit=100&cursor=YWJjMTIz');
    expect(buildApiCursorUrl('https://api.360ghar.com/api/v1', '/properties', null, 50, { city: 'Gurgaon', purpose: 'buy', skip: undefined })).toBe('https://api.360ghar.com/api/v1/properties?city=Gurgaon&purpose=buy&limit=50');
  });

  it('walks cursor pages until has_more is false, with GET only', async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push([url, init.method]);
      const cursor = new URL(url).searchParams.get('cursor');
      return page(cursor ? { items: [{ id: 3 }], next_cursor: null, has_more: false } : { items: [{ id: 1 }, { id: 2 }], next_cursor: 'page-2-cursor', has_more: true });
    };
    const items = await fetchPaginatedCollection({ baseUrl: 'https://api.360ghar.com/api/v1', path: '/properties/', fetchImpl });
    expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(calls.map((c) => c[0])).toEqual(['https://api.360ghar.com/api/v1/properties/?limit=100', 'https://api.360ghar.com/api/v1/properties/?limit=100&cursor=page-2-cursor']);
    expect(calls.every((c) => c[1] === 'GET')).toBe(true);
  });

  it('stops at maxPages even if the API keeps returning a cursor', async () => {
    let n = 0;
    const fetchImpl = async () => page({ items: [{ id: ++n }], next_cursor: `c${n}`, has_more: true });
    const items = await fetchPaginatedCollection({ baseUrl: 'https://api.360ghar.com/api/v1', path: '/x', fetchImpl, maxPages: 3 });
    expect(items).toHaveLength(3);
  });

  it('stops on an empty page', async () => {
    let n = 0;
    const fetchImpl = async () => page(++n === 1 ? { items: [{ id: 1 }], next_cursor: 'c', has_more: true } : { items: [], next_cursor: 'd', has_more: true });
    expect(await fetchPaginatedCollection({ baseUrl: 'https://api.360ghar.com/api/v1', path: '/x', fetchImpl })).toHaveLength(1);
  });

  it('throws on a non-2xx answer', async () => {
    const fetchImpl = async () => ({ ok: false, status: 500 });
    await expect(fetchPaginatedCollection({ baseUrl: 'https://api.360ghar.com/api/v1', path: '/x', fetchImpl })).rejects.toThrow('HTTP 500');
  });

  it('has a long default timeout for slow API responses', () => {
    expect(DEFAULT_FETCH_TIMEOUT_MS).toBe(120000);
  });

  it('retries with a smaller page size after a failure', async () => {
    const calls = [];
    const fetchImpl = async (url) => {
      calls.push(url);
      const limit = Number(new URL(url).searchParams.get('limit'));
      if (limit === 100) return { ok: false, status: 504 };
      const cursor = new URL(url).searchParams.get('cursor');
      return page(cursor ? { items: [{ id: 'blog-3' }], next_cursor: null, has_more: false } : { items: [{ id: 'blog-1' }, { id: 'blog-2' }], next_cursor: 'blog-page-2', has_more: true });
    };
    const items = await fetchPaginatedCollectionWithFallbacks({ baseUrl: 'https://api.360ghar.com/api/v1', path: '/blog/posts', fetchImpl, pageSizes: [100, 50] });
    expect(items.map((i) => i.id)).toEqual(['blog-1', 'blog-2', 'blog-3']);
    expect(calls).toContain('https://api.360ghar.com/api/v1/blog/posts?limit=50&cursor=blog-page-2');
  });
});

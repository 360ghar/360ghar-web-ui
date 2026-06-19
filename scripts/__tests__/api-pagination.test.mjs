import test from 'node:test';
import assert from 'node:assert/strict';

import {
  API_PAGE_LIMIT,
  DEFAULT_FETCH_TIMEOUT_MS,
  buildApiCursorUrl,
  fetchPaginatedCollection,
  fetchPaginatedCollectionWithFallbacks,
} from '../lib/paginatedApi.mjs';

test('buildApiCursorUrl enforces the API page limit cap and omits cursor on the first page', () => {
  const firstPageUrl = buildApiCursorUrl('https://api.360ghar.com/api/v1', '/properties/', null, 1000);

  assert.equal(firstPageUrl, 'https://api.360ghar.com/api/v1/properties/?limit=100');
  assert.equal(API_PAGE_LIMIT, 100);
});

test('buildApiCursorUrl appends the opaque cursor token on subsequent pages', () => {
  const url = buildApiCursorUrl(
    'https://api.360ghar.com/api/v1',
    '/properties/',
    'YWJjMTIz',
    100,
  );

  assert.equal(url, 'https://api.360ghar.com/api/v1/properties/?limit=100&cursor=YWJjMTIz');
});

test('fetchPaginatedCollection walks cursor pages until has_more is false', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);

    const parsed = new URL(url);
    const cursor = parsed.searchParams.get('cursor');

    // Page 1 (no cursor): has more, returns a cursor for page 2.
    // Page 2 (cursor='page-2-cursor'): terminal page (has_more=false, next_cursor=null).
    const payloads = {
      first: {
        items: [{ id: 'property-1' }, { id: 'property-2' }],
        next_cursor: 'page-2-cursor',
        has_more: true,
      },
      'page-2-cursor': {
        items: [{ id: 'property-3' }],
        next_cursor: null,
        has_more: false,
      },
    };

    return {
      ok: true,
      async json() {
        return payloads[cursor ?? 'first'];
      },
    };
  };

  const items = await fetchPaginatedCollection({
    baseUrl: 'https://api.360ghar.com/api/v1',
    path: '/properties/',
    fetchImpl,
  });

  assert.deepEqual(items, [
    { id: 'property-1' },
    { id: 'property-2' },
    { id: 'property-3' },
  ]);
  assert.deepEqual(calls, [
    'https://api.360ghar.com/api/v1/properties/?limit=100',
    'https://api.360ghar.com/api/v1/properties/?limit=100&cursor=page-2-cursor',
  ]);
});

test('default paginated fetch timeout is increased for slow API responses', () => {
  assert.equal(DEFAULT_FETCH_TIMEOUT_MS, 120000);
});

test('fetchPaginatedCollectionWithFallbacks retries with smaller page sizes after a timeout', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);

    const parsed = new URL(url);
    const limit = Number(parsed.searchParams.get('limit'));
    const cursor = parsed.searchParams.get('cursor');

    if (limit === 100) {
      throw new Error('The operation was aborted due to timeout');
    }

    // limit=50 path: page 1 returns a cursor, page 2 is terminal.
    const payloads = {
      first: {
        items: [{ id: 'blog-1' }, { id: 'blog-2' }],
        next_cursor: 'blog-page-2',
        has_more: true,
      },
      'blog-page-2': {
        items: [{ id: 'blog-3' }],
        next_cursor: null,
        has_more: false,
      },
    };

    return {
      ok: true,
      async json() {
        return payloads[cursor ?? 'first'];
      },
    };
  };

  const items = await fetchPaginatedCollectionWithFallbacks({
    baseUrl: 'https://api.360ghar.com/api/v1',
    path: '/blog/posts',
    fetchImpl,
    pageSizes: [100, 50],
  });

  assert.deepEqual(items, [
    { id: 'blog-1' },
    { id: 'blog-2' },
    { id: 'blog-3' },
  ]);
  // First attempt (limit=100) throws before any URL is recorded for that pass;
  // the fallback pass walks two cursor pages at limit=50.
  assert.ok(calls.includes('https://api.360ghar.com/api/v1/blog/posts?limit=50'));
  assert.ok(calls.includes('https://api.360ghar.com/api/v1/blog/posts?limit=50&cursor=blog-page-2'));
});

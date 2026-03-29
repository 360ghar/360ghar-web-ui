import test from 'node:test';
import assert from 'node:assert/strict';

import {
  API_PAGE_LIMIT,
  DEFAULT_FETCH_TIMEOUT_MS,
  buildApiPageUrl,
  fetchPaginatedCollection,
  fetchPaginatedCollectionWithFallbacks,
} from '../lib/paginatedApi.mjs';

test('buildApiPageUrl enforces the API page limit cap', () => {
  const url = buildApiPageUrl('https://api.360ghar.com/api/v1', '/properties/', 3, 1000);

  assert.equal(url, 'https://api.360ghar.com/api/v1/properties/?page=3&limit=100');
  assert.equal(API_PAGE_LIMIT, 100);
});

test('fetchPaginatedCollection aggregates paginated API responses using the capped limit', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);

    const page = Number(new URL(url).searchParams.get('page'));
    const payloads = {
      1: {
        count: 150,
        results: [{ id: 'property-1' }, { id: 'property-2' }],
      },
      2: {
        count: 150,
        results: [{ id: 'property-3' }],
      },
    };

    return {
      ok: true,
      async json() {
        return payloads[page];
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
    'https://api.360ghar.com/api/v1/properties/?page=1&limit=100',
    'https://api.360ghar.com/api/v1/properties/?page=2&limit=100',
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
    const page = Number(parsed.searchParams.get('page'));

    if (limit === 100) {
      throw new Error('The operation was aborted due to timeout');
    }

    const payloads = {
      1: {
        count: 51,
        items: [{ id: 'blog-1' }, { id: 'blog-2' }],
      },
      2: {
        count: 51,
        items: [{ id: 'blog-3' }],
      },
    };

    return {
      ok: true,
      async json() {
        return payloads[page];
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
  assert.equal(calls[0], 'https://api.360ghar.com/api/v1/blog/posts?page=1&limit=100');
  assert.equal(calls[1], 'https://api.360ghar.com/api/v1/blog/posts?page=1&limit=50');
  assert.equal(calls[2], 'https://api.360ghar.com/api/v1/blog/posts?page=2&limit=50');
});

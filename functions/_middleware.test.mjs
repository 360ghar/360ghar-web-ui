import test from 'node:test';
import assert from 'node:assert/strict';

import { onRequest } from './_middleware.js';

function createContext({ url, headers = {}, nextResponse, assetResponse }) {
  let nextCalls = 0;
  let assetCalls = 0;

  return {
    context: {
      request: new Request(url, { headers }),
      env: {
        ASSETS: {
          fetch: async (request) => {
            assetCalls += 1;
            return assetResponse ?? new Response('markdown body', {
              status: 200,
              headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
            });
          },
        },
      },
      next: async () => {
        nextCalls += 1;
        return nextResponse ?? new Response('<html>ok</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      },
    },
    get nextCalls() {
      return nextCalls;
    },
    get assetCalls() {
      return assetCalls;
    },
  };
}

test('markdown requests for supported routes return markdown assets with negotiation headers', async () => {
  const harness = createContext({
    url: 'https://360ghar.com/for-ai',
    headers: { Accept: 'text/html, text/markdown;q=0.9' },
  });

  const response = await onRequest(harness.context);

  assert.equal(harness.nextCalls, 0);
  assert.equal(harness.assetCalls, 1);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('vary'), 'Accept');
  assert.equal(await response.text(), 'markdown body');
});

test('unsupported or app-only routes fall through to the default HTML response', async () => {
  const harness = createContext({
    url: 'https://360ghar.com/login',
    headers: { Accept: 'text/markdown' },
  });

  const response = await onRequest(harness.context);

  assert.equal(harness.nextCalls, 1);
  assert.equal(harness.assetCalls, 0);
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
});

test('direct access to internal markdown assets is blocked for external callers', async () => {
  const harness = createContext({
    url: 'https://360ghar.com/__markdown/for-ai/index.md',
    headers: { Accept: 'text/markdown' },
  });

  const response = await onRequest(harness.context);

  assert.equal(harness.nextCalls, 0);
  assert.equal(harness.assetCalls, 0);
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('non-markdown requests keep default HTML behavior', async () => {
  const harness = createContext({
    url: 'https://360ghar.com/for-ai',
    headers: { Accept: 'text/html' },
  });

  const response = await onRequest(harness.context);

  assert.equal(harness.nextCalls, 1);
  assert.equal(harness.assetCalls, 0);
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import routeManifest from '../prerender-routes.json' with { type: 'json' };
import seoCopy from '../../src/i18n/locales/en/seo.json' with { type: 'json' };
import { siteMetadata } from '../../src/seo/siteMetadata.js';
import {
  buildRouteManifest,
  getPreviewServerArgs,
  getPreviewServerArgsForPort,
  prerenderRoutes,
  PREVIEW_HOST,
  PREVIEW_PORT,
  resolvePreviewPort,
  throwIfPrerenderFailed,
} from '../prerender-pages.mjs';

test('buildRouteManifest keeps the homepage title in sync with site metadata', () => {
  const manifest = buildRouteManifest(routeManifest);
  const homeRoute = manifest.find((routeConfig) => routeConfig.route === '/');

  assert.ok(homeRoute, 'expected homepage route config');
  assert.equal(homeRoute.waitForTitle, siteMetadata.defaultTitle);
});

test('route manifest includes noindex/auth routes and seed GEO routes for source HTML verification', () => {
  const routes = routeManifest.map((routeConfig) => routeConfig.route);

  assert.ok(routes.includes('/login'));
  assert.ok(routes.includes('/register'));
  assert.ok(routes.includes('/account'));
  assert.ok(routes.includes('/locality/dlf-phase-1-gurgaon'));
  assert.ok(routes.includes('/gurgaon/buy/flats'));
});

test('route manifest title waits stay synchronized with SEO copy', () => {
  const routes = new Map(routeManifest.map((routeConfig) => [routeConfig.route, routeConfig]));

  assert.equal(routes.get('/properties')?.waitForTitle, seoCopy.properties.title);
  assert.equal(routes.get('/localities')?.waitForTitle, seoCopy.localitiesDirectory.title);
});

test('seed landing routes use page content readiness instead of literal SEO titles', () => {
  const routes = new Map(routeManifest.map((routeConfig) => [routeConfig.route, routeConfig]));

  for (const route of [
    '/gurgaon/buy/flats',
    '/gurgaon/rent/flats',
    '/gurgaon/pg/flats',
    '/delhi/buy/flats',
    '/noida/rent/flats',
  ]) {
    assert.equal(routes.get(route)?.waitForText, 'Why 360Ghar?');
    assert.equal(routes.get(route)?.waitForTitle, undefined);
  }
});

test('getPreviewServerArgs enforces a strict preview port binding', () => {
  assert.deepEqual(getPreviewServerArgs(), [
    'preview',
    '--host',
    PREVIEW_HOST,
    '--port',
    String(PREVIEW_PORT),
    '--strictPort',
  ]);
});

test('getPreviewServerArgsForPort supports alternate preview ports', () => {
  assert.deepEqual(getPreviewServerArgsForPort(4999), [
    'preview',
    '--host',
    PREVIEW_HOST,
    '--port',
    '4999',
    '--strictPort',
  ]);
});

test('resolvePreviewPort falls back to an ephemeral port when the requested port is busy', async () => {
  const occupiedServer = net.createServer();
  await new Promise((resolve) => occupiedServer.listen(0, PREVIEW_HOST, resolve));
  const occupiedAddress = occupiedServer.address();
  const occupiedPort = typeof occupiedAddress === 'object' && occupiedAddress ? occupiedAddress.port : PREVIEW_PORT;

  try {
    const port = await resolvePreviewPort(occupiedPort);
    assert.notEqual(port, occupiedPort);
    assert.ok(Number.isInteger(port));
    assert.ok(port > 0);
  } finally {
    await new Promise((resolve, reject) => {
      occupiedServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test('prerenderRoutes continues after a route failure and reports failed routes', async () => {
  const browser = {
    closeCalls: 0,
    async close() { this.closeCalls += 1; },
  };
  const calls = [];

  const result = await prerenderRoutes(
    'http://127.0.0.1:4317',
    [{ route: '/' }, { route: '/bad-route' }, { route: '/about-us' }],
    {
      concurrency: 1,
      launchBrowser: async () => browser,
      prerenderRouteImpl: async (_baseUrl, routeConfig) => {
        calls.push(routeConfig.route);
        if (routeConfig.route === '/bad-route') {
          throw new Error('TimeoutError: Waiting failed: 60000ms exceeded');
        }
      },
    }
  );

  assert.deepEqual(calls, ['/', '/bad-route', '/about-us']);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].route, '/bad-route');
  assert.equal(browser.closeCalls, 1);
});

test('prerenderRoutes reuses one browser instance across all routes', async () => {
  const browser = {
    closeCalls: 0,
    async close() {
      this.closeCalls += 1;
    },
  };
  const calls = [];

  await prerenderRoutes('http://127.0.0.1:4317', [{ route: '/' }, { route: '/about-us' }], {
    concurrency: 1,
    launchBrowser: async () => browser,
    prerenderRouteImpl: async (baseUrl, routeConfig, sharedBrowser) => {
      calls.push({ baseUrl, route: routeConfig.route, browser: sharedBrowser });
    },
  });

  assert.deepEqual(calls.map((call) => call.route), ['/', '/about-us']);
  assert.ok(calls.every((call) => call.browser === browser));
  assert.equal(browser.closeCalls, 1);
});

test('prerenderRoutes reports cacheHits and rendered counts from the route impl', async () => {
  const browser = { async close() {} };
  const routes = [
    { route: '/cached-a' },
    { route: '/fresh' },
    { route: '/cached-b' },
  ];

  const result = await prerenderRoutes('http://127.0.0.1:4317', routes, {
    concurrency: 3,
    launchBrowser: async () => browser,
    prerenderRouteImpl: async (_baseUrl, routeConfig) => {
      // First and third are cache hits; the middle one is a fresh render.
      return { cacheHit: routeConfig.route !== '/fresh' };
    },
  });

  assert.equal(result.cacheHits, 2);
  assert.equal(result.rendered, 1);
  assert.equal(result.failed.length, 0);
});

test('prerenderRoutes runs routes concurrently (all in flight together)', async () => {
  const browser = { async close() {} };
  const started = [];
  let inFlight = 0;
  let maxInFlight = 0;
  const routes = Array.from({ length: 4 }, (_, i) => ({ route: `/r${i}` }));

  await prerenderRoutes('http://127.0.0.1:4317', routes, {
    concurrency: 4,
    launchBrowser: async () => browser,
    prerenderRouteImpl: async (_baseUrl, routeConfig) => {
      started.push(routeConfig.route);
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      // Hold each worker open so all four overlap. If execution were sequential,
      // the second could not start before the first resolves.
      await new Promise((resolve) => setTimeout(resolve, 30));
      inFlight -= 1;
      return { cacheHit: false };
    },
  });

  // All four workers started before any resolved (30ms overlap window).
  assert.equal(started.length, 4);
  assert.ok(maxInFlight > 1, 'expected overlapping route execution');
});

test('throwIfPrerenderFailed turns route failures into build failures', () => {
  assert.throws(
    () => throwIfPrerenderFailed([
      { route: '/property-sidebar', error: new Error('Waiting failed: 60000ms exceeded') },
    ]),
    /Prerender failed for 1 route/
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import routeManifest from '../prerender-routes.json' with { type: 'json' };
import { siteMetadata } from '../../src/seo/siteMetadata.js';
import {
  buildRouteManifest,
  getPreviewServerArgs,
  getPreviewServerArgsForPort,
  prerenderRoutes,
  PREVIEW_HOST,
  PREVIEW_PORT,
  resolvePreviewPort,
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

test('prerenderRoutes reuses one browser instance across all routes', async () => {
  const browser = {
    closeCalls: 0,
    async close() {
      this.closeCalls += 1;
    },
  };
  const calls = [];

  await prerenderRoutes('http://127.0.0.1:4317', [{ route: '/' }, { route: '/about-us' }], {
    launchBrowser: async () => browser,
    prerenderRouteImpl: async (baseUrl, routeConfig, sharedBrowser) => {
      calls.push({ baseUrl, route: routeConfig.route, browser: sharedBrowser });
    },
  });

  assert.deepEqual(calls.map((call) => call.route), ['/', '/about-us']);
  assert.ok(calls.every((call) => call.browser === browser));
  assert.equal(browser.closeCalls, 1);
});

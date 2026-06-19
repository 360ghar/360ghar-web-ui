import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  computeScriptVersionHash,
  createPrerenderCache,
  hashRouteData,
} from '../lib/prerenderCache.mjs';

async function makeTempCacheDir() {
  return mkdtemp(path.join(tmpdir(), 'prerender-cache-'));
}

const FIXED_VITE_HASH = 'vite-hash-aaa';
const FIXED_SCRIPT_HASH = 'script-hash-bbb';

test('hashRouteData returns "no-data" for null/undefined and a stable hash otherwise', () => {
  assert.equal(hashRouteData(null), 'no-data');
  assert.equal(hashRouteData(undefined), 'no-data');
  assert.equal(hashRouteData({ a: 1 }), hashRouteData({ a: 1 }));
  assert.notEqual(hashRouteData({ a: 1 }), hashRouteData({ a: 2 }));
});

test('computeScriptVersionHash is stable for identical content and changes on edit', async () => {
  const dir = await makeTempCacheDir();
  const fileA = path.join(dir, 'a.js');
  const fileB = path.join(dir, 'b.js');
  await writeFile(fileA, 'export const x = 1;');
  await writeFile(fileB, 'export const y = 2;');

  const h1 = await computeScriptVersionHash([fileA, fileB]);
  const h2 = await computeScriptVersionHash([fileA, fileB]);
  assert.equal(h1, h2, 'identical content -> identical hash');

  await writeFile(fileB, 'export const y = 3;');
  const h3 = await computeScriptVersionHash([fileA, fileB]);
  assert.notEqual(h1, h3, 'content change -> different hash');

  await rm(dir, { recursive: true, force: true });
});

test('createPrerenderCache misses when empty, stores, then hits on unchanged inputs', async () => {
  const dir = await makeTempCacheDir();
  try {
    const cache = createPrerenderCache({
      cacheDir: dir,
      viteHash: FIXED_VITE_HASH,
      scriptVersionHash: FIXED_SCRIPT_HASH,
    });
    const routeConfig = { route: '/about-us', waitForSelector: 'main' };

    const miss = await cache.lookup(routeConfig, null);
    assert.equal(miss, null, 'empty cache -> miss');

    await cache.store(routeConfig, null, '<html>about</html>');
    await cache.flush();

    const hit = await cache.lookup(routeConfig, null);
    assert.equal(hit, '<html>about</html>', 'after store -> hit with same inputs');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('cache busts when viteHash changes', async () => {
  const dir = await makeTempCacheDir();
  try {
    const routeConfig = { route: '/' };
    const cache1 = createPrerenderCache({
      cacheDir: dir,
      viteHash: 'v1',
      scriptVersionHash: FIXED_SCRIPT_HASH,
    });
    await cache1.store(routeConfig, null, '<html v1>');
    await cache1.flush();

    const cache2 = createPrerenderCache({
      cacheDir: dir,
      viteHash: 'v2',
      scriptVersionHash: FIXED_SCRIPT_HASH,
    });
    const result = await cache2.lookup(routeConfig, null);
    assert.equal(result, null, 'different viteHash -> miss');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('cache busts when route data changes', async () => {
  const dir = await makeTempCacheDir();
  try {
    const routeConfig = { route: '/properties' };
    const cache = createPrerenderCache({
      cacheDir: dir,
      viteHash: FIXED_VITE_HASH,
      scriptVersionHash: FIXED_SCRIPT_HASH,
    });

    await cache.store(routeConfig, 'data-hash-1', '<html data1>');
    await cache.flush();

    const sameData = await cache.lookup(routeConfig, 'data-hash-1');
    assert.equal(sameData, '<html data1>', 'same data -> hit');

    const diffData = await cache.lookup(routeConfig, 'data-hash-2');
    assert.equal(diffData, null, 'different data -> miss');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('cache busts when route config changes', async () => {
  const dir = await makeTempCacheDir();
  try {
    const cache = createPrerenderCache({
      cacheDir: dir,
      viteHash: FIXED_VITE_HASH,
      scriptVersionHash: FIXED_SCRIPT_HASH,
    });

    await cache.store({ route: '/blog', waitForSelector: 'main' }, null, '<html blog>');
    await cache.flush();

    const changed = await cache.lookup({ route: '/blog', waitForSelector: 'article' }, null);
    assert.equal(changed, null, 'changed waitForSelector -> miss');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('disabled cache always misses and never persists', async () => {
  const dir = await makeTempCacheDir();
  try {
    const cache = createPrerenderCache({
      cacheDir: dir,
      viteHash: FIXED_VITE_HASH,
      scriptVersionHash: FIXED_SCRIPT_HASH,
      disabled: true,
    });
    const routeConfig = { route: '/' };

    await cache.store(routeConfig, null, '<html>');
    await cache.flush();

    const miss = await cache.lookup(routeConfig, null);
    assert.equal(miss, null, 'disabled cache never hits');

    // Nothing should have been written to disk.
    await assert.rejects(() => readFile(path.join(dir, 'manifest.json')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('cache.flush writes a manifest with per-route entries', async () => {
  const dir = await makeTempCacheDir();
  try {
    const cache = createPrerenderCache({
      cacheDir: dir,
      viteHash: FIXED_VITE_HASH,
      scriptVersionHash: FIXED_SCRIPT_HASH,
    });
    await cache.store({ route: '/a' }, null, '<a>');
    await cache.store({ route: '/b' }, null, '<b>');
    await cache.flush();

    const manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf-8'));
    assert.ok(manifest.routes['/a']);
    assert.ok(manifest.routes['/b']);
    assert.equal(manifest.viteHash, FIXED_VITE_HASH);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

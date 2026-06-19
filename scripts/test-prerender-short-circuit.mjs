// Unit test for the prerender short-circuit gating logic.
// Usage: node scripts/test-prerender-short-circuit.mjs
import assert from 'node:assert/strict';
import {
  getPrerenderDataSource,
  isPrerendering,
  shouldShortCircuitDataFetch,
} from '../src/utils/prerender.js';

const setPrerender = (flag) => {
  if (flag) {
    globalThis.window = { __PRERENDER_INJECTED: { isPrerendering: true } };
  } else {
    globalThis.window = {};
  }
};

// Scenario 1: prerender flag off
setPrerender(false);
assert.equal(isPrerendering(), false, 'isPrerendering should be false without flag');
assert.equal(shouldShortCircuitDataFetch(), false, 'shouldShortCircuitDataFetch should be false without flag');

// getPrerenderDataSource defaults to 'empty' when the build-time define is
// absent (this script runs in plain Node, not Vite).
assert.equal(getPrerenderDataSource(), 'empty', 'getPrerenderDataSource defaults to empty');

// Scenario 2: prerender flag on (simulates Puppeteer capture of a local build)
setPrerender(true);
assert.equal(isPrerendering(), true, 'isPrerendering should be true with flag');
assert.equal(shouldShortCircuitDataFetch(), true, 'shouldShortCircuitDataFetch should be true with flag + local build');

console.log('PASS: isPrerendering and shouldShortCircuitDataFetch gate correctly.');

// Scenario 3: Build-time define check (this file is run in plain Node, not
// via Vite, so __PRERENDER_NO_FETCH__ will not be defined here). In a real
// Vite build, the define replaces the identifier with `true` (local / Netlify
// preview) or `false` (Netlify production). The bundle contains the
// replacement; the helper handles the undefined case defensively (returns
// true) so even a missing define keeps the short-circuit active.
setPrerender(true);
delete globalThis.__PRERENDER_NO_FETCH__;
const fallbackValue = shouldShortCircuitDataFetch();
assert.equal(fallbackValue, true, 'should fall back to short-circuiting when __PRERENDER_NO_FETCH__ is undefined');

console.log('PASS: helper falls back to short-circuiting when build-time define is missing.');

const buildTimeFlag = (() => {
  try {
    return Boolean(globalThis.__PRERENDER_NO_FETCH__);
  } catch {
    return null;
  }
})();
console.log(`INFO: build-time __PRERENDER_NO_FETCH__ in this Node = ${buildTimeFlag} (would be true|false in a Vite-bundled context).`);

console.log('\nAll prerender short-circuit gating tests passed.');

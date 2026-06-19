/**
 * Centralized helpers for detecting the Puppeteer-driven prerender phase.
 *
 * Two signals combine to decide whether to short-circuit data fetches:
 *
 *  1. `isPrerendering()` — runtime window flag set by
 *     `scripts/prerender-pages.mjs` via `page.evaluateOnNewDocument`. True
 *     ONLY while Puppeteer is rendering a route for capture. Never true for
 *     real users.
 *
 *  2. `__PRERENDER_NO_FETCH__` — build-time boolean injected by Vite's
 *     `define` (see `vite.config.js`). True for local builds and Netlify
 *     preview/branch/dev builds; false for Netlify production builds, where
 *     we want the prerendered HTML to contain real fetched data.
 *
 * `shouldShortCircuitDataFetch()` returns true only when BOTH conditions
 * hold: a real human never sees this combination. `isPrerendering()` is
 * exposed separately for places that want to short-circuit unconditionally
 * during prerender (e.g. PostHog, geolocation) regardless of build context.
 */

/* global __PRERENDER_NO_FETCH__ */

const hasWindow = () => typeof window !== 'undefined';

export const isPrerendering = () =>
  hasWindow() && Boolean(window.__PRERENDER_INJECTED?.isPrerendering);

export const shouldShortCircuitDataFetch = () => {
  if (!isPrerendering()) return false;
  // `__PRERENDER_NO_FETCH__` is replaced at build time by Vite's `define`.
  // Default to `true` so any environment that omits the define (e.g. a
  // developer running `vite` without the production config) still skips
  // network calls during the headless prerender.
  try {
    return Boolean(__PRERENDER_NO_FETCH__);
  } catch {
    return true;
  }
};

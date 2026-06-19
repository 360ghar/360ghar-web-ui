/**
 * Centralized helpers for detecting the Puppeteer-driven prerender phase.
 *
 * Three signals combine to decide how data fetches behave during prerender:
 *
 *  1. `isPrerendering()` — runtime window flag set by
 *     `scripts/prerender-pages.mjs` via `page.evaluateOnNewDocument`. True
 *     ONLY while Puppeteer is rendering a route for capture. Never true for
 *     real users.
 *
 *  2. `__PRERENDER_NO_FETCH__` — build-time boolean injected by Vite's
 *     `define` (see `vite.config.js`). True for local builds and Netlify
 *     preview/branch/dev builds; false for Netlify production builds.
 *     Used by `shouldShortCircuitDataFetch()` (supabase client gating).
 *
 *  3. `__PRERENDER_DATA_SOURCE__` — build-time string injected by Vite's
 *     `define`. Controls HOW axios data fetches are served during prerender:
 *       - `'empty'` (non-production default) -> resolve with empty payloads
 *       - `'bulk'`  (Netlify production)     -> resolve from /prerender-data.json,
 *                                               fall through to live for unknown keys
 *       - `'live'`                          -> forward to the real network
 *
 * The HTTP adapter (`src/services/http.js`) gates on `isPrerendering()` +
 * `getPrerenderDataSource()`. The Supabase client gates on
 * `shouldShortCircuitDataFetch()` (isPrerendering AND __PRERENDER_NO_FETCH__).
 * `isPrerendering()` is also exposed for places that want to short-circuit
 * unconditionally during prerender (e.g. PostHog, geolocation, auth init).
 */

/* global __PRERENDER_NO_FETCH__, __PRERENDER_DATA_SOURCE__ */

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

/**
 * Which data source the prerender bulk adapter should consult. Returns
 * 'empty' (default), 'bulk', or 'live'. Only meaningful while prerendering;
 * for real users the adapter is never entered so this value is inert.
 */
export const getPrerenderDataSource = () => {
  try {
    const source = String(__PRERENDER_DATA_SOURCE__ || '').toLowerCase();
    if (source === 'bulk' || source === 'live') return source;
  } catch {
    // define missing -> default below
  }
  return 'empty';
};

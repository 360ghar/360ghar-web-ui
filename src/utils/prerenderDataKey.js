/**
 * Deterministic request-key helper shared between:
 *   - `scripts/fetch-prerender-data.mjs` (build-time bulk bundle producer)
 *   - `src/services/http.js` (runtime bulk adapter during Puppeteer capture)
 *
 * Both sides MUST derive identical keys for the same logical request so the
 * prerender bulk-data bundle hits. The key is normalized to be insensitive
 * to query-param order and method casing so producers/consumers cannot drift
 * on accidental reordering.
 *
 * Pure JS, no imports — safe for both the Vite bundle and Node .mjs scripts.
 */

const normalizePath = (rawPath) => {
  let p = String(rawPath || '');
  // Drop hash fragment
  const hashIdx = p.indexOf('#');
  if (hashIdx !== -1) p = p.slice(0, hashIdx);
  // Collapse duplicate slashes
  p = p.replace(/\/{2,}/g, '/');
  // Normalize trailing slash (except root)
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  // Ensure leading slash for canonical form
  if (!p.startsWith('/')) p = '/' + p;
  return p || '/';
};

const sortSearchParams = (search) => {
  if (!search) return '';
  const cleaned = search.startsWith('?') ? search.slice(1) : search;
  if (!cleaned) return '';
  const params = new URLSearchParams(cleaned);
  const keys = [...new Set([...params.keys()])].sort();
  const parts = [];
  for (const key of keys) {
    // getAll preserves insertion order; sort for determinism.
    const values = params.getAll(key).map(String).sort();
    if (values.length === 0) {
      parts.push(`${encodeURIComponent(key)}=`);
      continue;
    }
    for (const value of values) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
};

/**
 * Build a stable request key from an axios-style request descriptor.
 *
 * Accepts the relative path the SPA passes to `publicApi.get(...)` (with or
 * without query string) plus optional baseURL, which is stripped so keys are
 * stable whether or not a baseURL is configured.
 *
 * @param {object} opts
 * @param {string} [opts.method='get']
 * @param {string} [opts.url='']      Relative request path (may include ?query).
 * @param {string} [opts.baseURL='']  Optional axios baseURL to strip.
 * @returns {string} e.g. "get /properties?city=gurgaon&limit=12"
 */
export function buildRequestKey({ method = 'get', url = '', baseURL = '' } = {}) {
  const normalizedMethod = String(method || 'get').toLowerCase();
  let rawUrl = String(url || '');
  const base = String(baseURL || '');
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  if (normalizedBase && (rawUrl === normalizedBase || rawUrl.startsWith(normalizedBase + '/'))) {
    rawUrl = rawUrl.slice(normalizedBase.length);
  }
  // If the url is absolute, keep only the path+search (origin-agnostic).
  if (/^https?:\/\//i.test(rawUrl)) {
    try {
      rawUrl = new URL(rawUrl).pathname + (new URL(rawUrl).search || '');
    } catch {
      // leave as-is on malformed URL
    }
  }
  const queryIdx = rawUrl.indexOf('?');
  const path = queryIdx === -1 ? rawUrl : rawUrl.slice(0, queryIdx);
  const search = queryIdx === -1 ? '' : rawUrl.slice(queryIdx);
  return `${normalizedMethod} ${normalizePath(path)}${sortSearchParams(search)}`;
}

export default buildRequestKey;

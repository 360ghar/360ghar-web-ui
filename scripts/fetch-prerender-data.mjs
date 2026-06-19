#!/usr/bin/env node
/**
 * Bulk-data pre-fetch for production prerender.
 *
 * Before Puppeteer captures the 244 prerendered routes, this script fetches the
 * high-value API payloads ONCE and writes them to `dist/prerender-data.json`.
 * During capture, the SPA's axios adapter (see src/services/http.js) reads from
 * this bundle instead of firing live calls per route, so the backend sees a
 * handful of requests instead of thousands.
 *
 * Request keys are produced by the SAME `buildRequestKey` the adapter uses, and
 * the property-search queries are produced by the SPA's OWN
 * `buildPropertySearchParams` + taxonomy normalization, so the bundle hits.
 *
 * Any endpoint not pre-fetched (or any fetch failure) degrades gracefully: the
 * adapter returns an empty payload for unknown keys, and this script never
 * fails the build on a network error — it just writes what it could gather.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePropertySearchFilters } from '../src/utils/propertyTaxonomy.js';
import { buildRequestKey } from '../src/utils/prerenderDataKey.js';
const routeManifest = JSON.parse(readFileSync(new URL('./prerender-routes.json', import.meta.url), 'utf-8'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(DIST_DIR, 'prerender-data.json');

const API_BASE = `${process.env.VITE_API_SERVER || 'https://api.360ghar.com'}/api/v1`;
const FETCH_TIMEOUT_MS = Number(process.env.PRERENDER_DATA_TIMEOUT_MS) || 20000;

const DISABLED = process.env.PRERENDER_DATA_DISABLED === '1';

const PURPOSE_BY_INTENT = { buy: 'buy', rent: 'rent', pg: 'rent' };
const VALID_INTENTS = ['buy', 'rent', 'pg'];

/**
 * Build a property-search query string that produces the SAME request key as
 * the SPA's `propertyAPIService.searchProperties` -> `buildPropertySearchParams`.
 *
 * We import `normalizePropertySearchFilters` from the SPA's own taxonomy module
 * (Node-safe) so normalization cannot drift. Param ORDER does not matter because
 * `buildRequestKey` sorts query params; we only need the same SET of (key,value)
 * pairs. The field mapping mirrors `buildPropertySearchParams` exactly.
 */
function buildPropertySearchUrl(rawFilters, limit = 12) {
  const params = new URLSearchParams();
  params.set('limit', String(limit));

  // cleanPropertyFilters: normalize, then drop null/undefined/''/empty-array.
  const normalized = normalizePropertySearchFilters(rawFilters);
  const cleaned = {};
  for (const [key, value] of Object.entries(normalized)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) cleaned[key] = value;
      continue;
    }
    cleaned[key] = value;
  }

  const setIfPresent = (key, value) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  };
  const appendArray = (key, values) => {
    values.forEach((value) => params.append(key, String(value)));
  };

  setIfPresent('purpose', cleaned.purpose);
  const propertyTypes = cleaned.property_type;
  if (Array.isArray(propertyTypes)) appendArray('property_type', propertyTypes);
  else setIfPresent('property_type', propertyTypes);
  setIfPresent('bedrooms_min', cleaned.bedrooms_min);
  setIfPresent('bedrooms_max', cleaned.bedrooms_max);
  setIfPresent('city', cleaned.city);
  setIfPresent('locality', cleaned.locality);
  setIfPresent('sort_by', cleaned.sort_by);

  return `/properties/?${params.toString()}`;
}

function buildRouteRequestKeys() {
  // High-confidence endpoints the SPA fires verbatim during prerender.
  const specs = [
    { url: '/properties/recommendations/?limit=6' },
    { url: '/properties/recommendations/?limit=12' },
  ];

  // Default properties-page search (PropertyPageSection default filters:
  // only sort_by=newest survives cleanPropertyFilters).
  specs.push({ url: buildPropertySearchUrl({ sort_by: 'newest' }) });

  // Seed landing routes -> derived property searches.
  // Routes like /:city/:intent/:type[/:bhk]. intent=pg maps to purpose=rent
  // AND adds 'pg' to property_type via normalizePropertySearchFilters, matching
  // the SPA's behavior exactly.
  for (const { route } of routeManifest) {
    const clean = String(route).replace(/^\/hi\//, '/').replace(/^\/hi$/, '/');
    const match = clean.match(/^\/([^/]+)\/(buy|rent|pg)\/([^/]+)(?:\/([^/]+))?$/);
    if (!match) continue;
    const [, citySlug, intent, typeSlug, facet] = match;

    const filters = {
      city: citySlug.replace(/-/g, ' '),
      purpose: PURPOSE_BY_INTENT[intent] || intent,
      property_type: [typeSlug.replace(/-/g, ' ')],
      intent: intent === 'pg' ? 'pg' : undefined,
      sort_by: 'newest',
    };

    // BHK facet -> bedrooms
    const bhkMatch = facet && facet.match(/^(\d+)-bhk$/);
    if (bhkMatch) {
      filters.bedrooms_min = Number(bhkMatch[1]);
      filters.bedrooms_max = Number(bhkMatch[1]);
    }

    specs.push({ url: buildPropertySearchUrl(filters) });
  }

  // Locality routes -> locality-scoped search.
  for (const { route } of routeManifest) {
    const clean = String(route).replace(/^\/hi\//, '/').replace(/^\/hi$/, '/');
    const locMatch = clean.match(/^\/locality\/([^/]+)(?:\/(buy|rent|pg))?$/);
    if (!locMatch) continue;
    const [, localitySlug, intent] = locMatch;
    const filters = {
      locality: localitySlug.replace(/-/g, ' '),
      sort_by: 'newest',
    };
    if (intent && VALID_INTENTS.includes(intent)) {
      filters.purpose = PURPOSE_BY_INTENT[intent] || intent;
      if (intent === 'pg') filters.intent = 'pg';
    }
    specs.push({ url: buildPropertySearchUrl(filters) });
  }

  // Dedupe by request key.
  const byKey = new Map();
  for (const spec of specs) {
    const key = buildRequestKey({ method: 'get', url: spec.url });
    if (!byKey.has(key)) byKey.set(key, spec);
  }
  return byKey;
}

async function fetchEntry(spec) {
  // Resolve the relative path against the API base.
  const relative = spec.url.startsWith('/') ? spec.url.slice(1) : spec.url;
  const url = `${API_BASE.replace(/\/$/, '')}/${relative}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return { ok: false, status: response.status };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error?.name === 'AbortError' ? 'timeout' : (error?.message || 'fetch-error') };
  } finally {
    clearTimeout(timer);
  }
}

// Blog endpoint param combos the SPA fires during prerender (derived from
// BlogClassic.jsx POSTS_PER_PAGE=10, BlogClassicSection, SidebarRecentPost,
// and home-page Blog components). Unknown blog keys fall through to live
// in the adapter, so this is an optimization, not a correctness requirement.
const BLOG_SPECS = [
  { url: '/blog/posts?limit=10' },
  { url: '/blog/posts?limit=4' },
  { url: '/blog/posts?limit=6&page=1' },
  { url: '/blog/posts?limit=3&page=1' },
];

async function main() {
  if (DISABLED) {
    console.log('[prerender-data] PRERENDER_DATA_DISABLED=1 -> writing empty bundle');
    await mkdir(DIST_DIR, { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify({ meta: { disabled: true }, entries: {} }), 'utf-8');
    return;
  }

  if (!existsSync(DIST_DIR)) {
    console.warn('[prerender-data] dist/ not found -> skipping (run vite build first)');
    return;
  }

  console.log('[prerender-data] building request set...');
  const byKey = await buildRouteRequestKeys();

  // Add blog endpoint specs (keyed by request key, same as property specs).
  for (const spec of BLOG_SPECS) {
    const key = buildRequestKey({ method: 'get', url: spec.url });
    if (!byKey.has(key)) byKey.set(key, spec);
  }

  console.log(`[prerender-data] ${byKey.size} unique request(s) to pre-fetch`);

  const entries = {};
  let fetched = 0;
  let failed = 0;

  // All endpoints (property + recommendations + blog), keyed by request key.
  for (const [key, spec] of byKey) {
    const result = await fetchEntry(spec);
    if (result.ok) {
      entries[key] = result.data;
      fetched += 1;
    } else {
      failed += 1;
      console.warn(`[prerender-data] miss ${key} (${result.status || result.error})`);
    }
  }

  await mkdir(DIST_DIR, { recursive: true });
  const entryCount = Object.keys(entries).length;
  const bundle = {
    meta: {
      generatedAt: new Date().toISOString(),
      apiBase: API_BASE,
      source: 'fetch-prerender-data.mjs',
    },
    entries,
  };
  await writeFile(OUT_FILE, JSON.stringify(bundle), 'utf-8');
  console.log(`[prerender-data] wrote ${entryCount} entr${entryCount === 1 ? 'y' : 'ies'} to ${path.relative(ROOT, OUT_FILE)} (${fetched} fetched, ${failed} missed)`);
}

// Never fail the build over the bulk bundle — the adapter falls back to empty
// payloads for any missed key, so a network failure here is non-fatal.
main().catch((error) => {
  console.error('[prerender-data] FATAL (non-blocking):', error?.message || error);
  process.exitCode = 0;
});

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import nodePath from 'node:path';
import crypto from 'node:crypto';

export const API_PAGE_LIMIT = 100;
export const DEFAULT_FETCH_TIMEOUT_MS = 120000;

// Hard safety cap on the number of cursor pages we'll walk per collection.
// Prevents an unbounded loop if the backend ever returns a non-null
// next_cursor while also reporting has_more=true indefinitely.
const MAX_CURSOR_PAGES = 10000;

// --- Build-time on-disk cache (best-effort, opt-out via BUILD_CACHE_DISABLED) ---
// NOTE: Netlify build containers are ephemeral, so this only persists for
// local/persistent-CI builds. The real build-egress fix is the backend Redis
// cache (P0-1/P0-2) + a CDN in front of the API (P1-2), which absorb the live
// fetches regardless. This cache just avoids re-crawling the API on repeated
// local builds.
const BUILD_CACHE_DIR = nodePath.resolve(process.cwd(), '.build-cache');
const BUILD_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h — matches backend search cache TTL

function buildCacheKey(baseUrl, requestPath) {
  const raw = `${normalizeBaseUrl(baseUrl)}::${requestPath}`;
  return crypto.createHash('sha1').update(raw).digest('hex').slice(0, 24);
}

export function buildCachePath(baseUrl, requestPath) {
  return nodePath.join(BUILD_CACHE_DIR, `${buildCacheKey(baseUrl, requestPath)}.json`);
}

async function readBuildCache(cachePath, ttlMs = BUILD_CACHE_TTL_MS) {
  if (process.env.BUILD_CACHE_DISABLED === '1') return null;
  try {
    const st = await stat(cachePath);
    if (Date.now() - st.mtimeMs > ttlMs) return null;
    return JSON.parse(await readFile(cachePath, 'utf8'));
  } catch {
    return null;
  }
}

async function writeBuildCache(cachePath, data) {
  try {
    await mkdir(nodePath.dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify(data), 'utf8');
  } catch {
    // Best-effort — a cache write failure must never break the build.
  }
}

export async function fetchPaginatedCollectionCached(options) {
  const cachePath = buildCachePath(options.baseUrl, options.path);
  const cached = await readBuildCache(cachePath);
  if (cached) {
    return cached;
  }
  const items = await fetchPaginatedCollectionParallel(options);
  await writeBuildCache(cachePath, items);
  return items;
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

/**
 * Build a cursor-paginated API URL.
 *
 * `cursor` is an opaque base64 token returned by a prior `next_cursor`. Pass
 * null/undefined/empty on the first page (the `cursor` param is omitted so
 * the backend serves the first page).
 */
export function buildApiCursorUrl(baseUrl, path, cursor = null, pageSize = API_PAGE_LIMIT) {
  const url = new URL(String(path || '').replace(/^\/+/, ''), normalizeBaseUrl(baseUrl));
  url.searchParams.set('limit', String(Math.min(pageSize, API_PAGE_LIMIT)));
  if (cursor) {
    url.searchParams.set('cursor', String(cursor));
  }
  return url.toString();
}

export function defaultExtractItems(data) {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data)) return data;
  return [];
}

export function defaultExtractNextCursor(data) {
  return data?.next_cursor ?? data?.nextCursor ?? null;
}

export function defaultExtractHasMore(data) {
  if (typeof data?.has_more === 'boolean') return data.has_more;
  if (typeof data?.hasMore === 'boolean') return data.hasMore;
  // Legacy fallback: if the API reports total_pages/page, treat has_more as
  // "not on the last page". This keeps the crawler terminating for backends
  // that haven't fully migrated yet.
  if (Number.isInteger(data?.total_pages) && Number.isInteger(data?.page)) {
    return data.page < data.total_pages;
  }
  return false;
}

async function fetchSinglePage({ baseUrl, path, cursor, pageSize, timeoutMs, fetchImpl }) {
  const url = buildApiCursorUrl(baseUrl, path, cursor, pageSize);
  let response;
  let lastFetchErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await fetchImpl(url, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      lastFetchErr = null;
      break;
    } catch (err) {
      lastFetchErr = err;
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
      }
    }
  }
  if (lastFetchErr) throw lastFetchErr;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.json();
}

/**
 * Walk a cursor-paginated collection to exhaustion.
 *
 * Termination: the loop stops when the backend reports `has_more === false`,
 * when `next_cursor` is null/empty, when a page returns no items, or when the
 * MAX_CURSOR_PAGES safety cap is reached. Cursor tokens are treated as opaque
 * — they are never decoded or arithmetic'd on.
 */
export async function fetchPaginatedCollection({
  baseUrl,
  path,
  fetchImpl = fetch,
  pageSize = API_PAGE_LIMIT,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  extractItems = defaultExtractItems,
  extractNextCursor = defaultExtractNextCursor,
  extractHasMore = defaultExtractHasMore,
}) {
  const allItems = [];
  const cappedPageSize = Math.min(pageSize, API_PAGE_LIMIT);
  let cursor = null;

  for (let pageNum = 0; pageNum < MAX_CURSOR_PAGES; pageNum++) {
    const data = await fetchSinglePage({ baseUrl, path, cursor, pageSize: cappedPageSize, timeoutMs, fetchImpl });
    const items = extractItems(data);
    allItems.push(...items);

    const nextCursor = extractNextCursor(data);
    const hasMore = extractHasMore(data);

    // Terminal page: no cursor, backend says no more, or empty page.
    if (!hasMore || !nextCursor || items.length === 0) {
      break;
    }

    cursor = nextCursor;
  }

  return allItems;
}

/**
 * Cursor pagination is inherently sequential (each page's cursor depends on
 * the previous response), so the "parallel" variant simply delegates to the
 * sequential cursor walk. The name is preserved for backwards compatibility
 * with existing call sites (generate-rss.mjs, etc.).
 */
export async function fetchPaginatedCollectionParallel(options) {
  return fetchPaginatedCollection(options);
}

export async function fetchPaginatedCollectionWithFallbacksParallel({
  pageSizes = [API_PAGE_LIMIT],
  ...options
}) {
  let lastError = null;

  for (const pageSize of pageSizes) {
    try {
      return await fetchPaginatedCollectionParallel({
        ...options,
        pageSize,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function fetchPaginatedCollectionWithFallbacks({
  pageSizes = [API_PAGE_LIMIT],
  ...options
}) {
  let lastError = null;

  for (const pageSize of pageSizes) {
    try {
      return await fetchPaginatedCollection({
        ...options,
        pageSize,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

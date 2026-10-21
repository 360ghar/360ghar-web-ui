/**
 * Cursor-paginated GET helper for the data scripts. Port of the old site's
 * scripts/lib/paginatedApi.mjs, with two changes: `maxPages` (a small cap for
 * samples and tests) and a cache directory that lives in node_modules/.cache.
 * GET only.
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import nodePath from 'node:path';

export const API_PAGE_LIMIT = 100;
export const DEFAULT_FETCH_TIMEOUT_MS = 120000;

/** Hard cap on pages per collection, in case the API keeps returning a cursor. */
const MAX_CURSOR_PAGES = 10000;

/** Response cache. Set DATA_CACHE_DIR to move it, DATA_CACHE_DISABLED=1 to switch it off. */
export const cacheDir = () => nodePath.resolve(process.env.DATA_CACHE_DIR || nodePath.join(process.cwd(), 'node_modules', '.cache', '360ghar-data'));
export const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const normalizeBaseUrl = (baseUrl) => (baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

export const cacheKey = (...parts) => crypto.createHash('sha1').update(parts.join('::')).digest('hex').slice(0, 24);

export async function readCache(key, ttlMs = CACHE_TTL_MS) {
  if (process.env.DATA_CACHE_DISABLED === '1') return null;
  try {
    const file = nodePath.join(cacheDir(), `${key}.json`);
    if (Date.now() - (await stat(file)).mtimeMs > ttlMs) return null;
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

export async function writeCache(key, data) {
  try {
    await mkdir(cacheDir(), { recursive: true });
    await writeFile(nodePath.join(cacheDir(), `${key}.json`), JSON.stringify(data), 'utf8');
  } catch {
    // A cache write must never break a run.
  }
}

/** `limit` is capped at 100. `cursor` is opaque: pass null on the first page. */
export function buildApiCursorUrl(baseUrl, path, cursor = null, pageSize = API_PAGE_LIMIT, extra = {}) {
  const url = new URL(String(path || '').replace(/^\/+/, ''), normalizeBaseUrl(baseUrl));
  for (const [k, v] of Object.entries(extra)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  url.searchParams.set('limit', String(Math.min(pageSize, API_PAGE_LIMIT)));
  if (cursor) url.searchParams.set('cursor', String(cursor));
  return url.toString();
}

export const defaultExtractItems = (data) => (Array.isArray(data?.items) ? data.items : Array.isArray(data?.results) ? data.results : Array.isArray(data?.properties) ? data.properties : Array.isArray(data) ? data : []);
export const defaultExtractNextCursor = (data) => data?.next_cursor ?? data?.nextCursor ?? null;
export function defaultExtractHasMore(data) {
  if (typeof data?.has_more === 'boolean') return data.has_more;
  if (typeof data?.hasMore === 'boolean') return data.hasMore;
  if (Number.isInteger(data?.total_pages) && Number.isInteger(data?.page)) return data.page < data.total_pages;
  return false;
}

async function fetchSinglePage({ url, timeoutMs, fetchImpl }) {
  let response;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await fetchImpl(url, { method: 'GET', headers: { 'user-agent': '360ghar-data-scripts/1.0' }, signal: AbortSignal.timeout(timeoutMs) });
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
  if (lastError) throw lastError;
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.json();
}

/**
 * Walks a cursor-paginated collection. Stops when the API says `has_more` is
 * false, when there is no cursor, when a page is empty, or after `maxPages`.
 */
export async function fetchPaginatedCollection({
  baseUrl,
  path,
  query = {},
  fetchImpl = fetch,
  pageSize = API_PAGE_LIMIT,
  maxPages = MAX_CURSOR_PAGES,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  extractItems = defaultExtractItems,
  extractNextCursor = defaultExtractNextCursor,
  extractHasMore = defaultExtractHasMore,
}) {
  const all = [];
  const size = Math.min(pageSize, API_PAGE_LIMIT);
  let cursor = null;
  for (let page = 0; page < Math.min(maxPages, MAX_CURSOR_PAGES); page++) {
    const data = await fetchSinglePage({ url: buildApiCursorUrl(baseUrl, path, cursor, size, query), timeoutMs, fetchImpl });
    const items = extractItems(data);
    all.push(...items);
    const next = extractNextCursor(data);
    if (!extractHasMore(data) || !next || items.length === 0) break;
    cursor = next;
  }
  return all;
}

/** Like `fetchPaginatedCollection`, but tries each page size in turn if a walk fails (timeouts). */
export async function fetchPaginatedCollectionWithFallbacks({ pageSizes = [API_PAGE_LIMIT], ...options }) {
  let lastError = null;
  for (const pageSize of pageSizes) {
    try {
      return await fetchPaginatedCollection({ ...options, pageSize });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/** `fetchPaginatedCollection` behind the 12 h disk cache. */
export async function fetchPaginatedCollectionCached(options) {
  const key = cacheKey(normalizeBaseUrl(options.baseUrl), options.path, JSON.stringify(options.query ?? {}), options.maxPages ?? '');
  const hit = await readCache(key);
  if (hit) return hit;
  const items = await fetchPaginatedCollection(options);
  await writeCache(key, items);
  return items;
}

export const API_PAGE_LIMIT = 100;
export const DEFAULT_FETCH_TIMEOUT_MS = 120000;

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function buildApiPageUrl(baseUrl, path, page = 1, pageSize = API_PAGE_LIMIT) {
  const url = new URL(String(path || '').replace(/^\/+/, ''), normalizeBaseUrl(baseUrl));
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(Math.min(pageSize, API_PAGE_LIMIT)));
  return url.toString();
}

export function extractTotalPages(data, pageSize = API_PAGE_LIMIT) {
  if (Number.isInteger(data?.total_pages) && data.total_pages > 0) {
    return data.total_pages;
  }

  if (Number.isInteger(data?.totalPages) && data.totalPages > 0) {
    return data.totalPages;
  }

  if (Number.isInteger(data?.count) && data.count >= 0) {
    return Math.max(1, Math.ceil(data.count / Math.min(pageSize, API_PAGE_LIMIT)));
  }

  return null;
}

export function defaultExtractItems(data) {
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data)) return data;
  return [];
}

export async function fetchPaginatedCollection({
  baseUrl,
  path,
  fetchImpl = fetch,
  pageSize = API_PAGE_LIMIT,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  extractItems = defaultExtractItems,
}) {
  const allItems = [];
  const cappedPageSize = Math.min(pageSize, API_PAGE_LIMIT);
  let page = 1;

  while (true) {
    const url = buildApiPageUrl(baseUrl, path, page, cappedPageSize);
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

    const data = await response.json();
    const items = extractItems(data);
    allItems.push(...items);

    const totalPages = extractTotalPages(data, cappedPageSize);
    const reachedLastPage = totalPages
      ? page >= totalPages
      : items.length < cappedPageSize;

    if (reachedLastPage || items.length === 0) {
      break;
    }

    page += 1;
  }

  return allItems;
}

async function fetchSinglePage({ baseUrl, path, page, pageSize, timeoutMs, fetchImpl }) {
  const url = buildApiPageUrl(baseUrl, path, page, pageSize);
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

async function runInBatches(tasks, concurrency) {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    results.push(...await Promise.all(batch));
  }
  return results;
}

export async function fetchPaginatedCollectionParallel({
  baseUrl,
  path,
  fetchImpl = fetch,
  pageSize = API_PAGE_LIMIT,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  extractItems = defaultExtractItems,
  concurrency = 5,
}) {
  const cappedPageSize = Math.min(pageSize, API_PAGE_LIMIT);

  // Step 1: Fetch page 1 to discover total pages
  const firstData = await fetchSinglePage({ baseUrl, path, page: 1, pageSize: cappedPageSize, timeoutMs, fetchImpl });
  const firstItems = extractItems(firstData);
  const totalPages = extractTotalPages(firstData, cappedPageSize);

  // No more pages if first page is partial, or only 1 page reported
  if (firstItems.length < cappedPageSize) return firstItems;
  if (totalPages !== null && totalPages <= 1) return firstItems;

  // If API doesn't report total pages, fall back to sequential fetching
  if (totalPages === null) {
    return fetchPaginatedCollection({
      baseUrl, path, fetchImpl, pageSize, timeoutMs, extractItems,
    });
  }

  // Step 2: Fetch remaining pages in parallel batches
  const pageTasks = [];
  for (let page = 2; page <= totalPages; page++) {
    pageTasks.push(async () => {
      const data = await fetchSinglePage({ baseUrl, path, page, pageSize: cappedPageSize, timeoutMs, fetchImpl });
      return extractItems(data);
    });
  }

  const remainingItems = await runInBatches(pageTasks, concurrency);

  // Step 3: Merge in page order
  return [...firstItems, ...remainingItems.flat()];
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

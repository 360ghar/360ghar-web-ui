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
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(timeoutMs),
    });

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

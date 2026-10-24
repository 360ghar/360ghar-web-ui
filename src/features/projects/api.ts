/**
 * Project intelligence API: fetchers for `/api/v1/data-hub` (projects, developers,
 * micro-markets, market pulse, the map, and the watchlist).
 *
 * The same fetchers run on the server (page 1, wrapped in `safe`) and in islands,
 * so both render the same data. `safe` and `Loaded` follow `data-hub/api.ts`, and a
 * `Loaded` from here passes straight to `stateOf`/`settle` in `data-hub/route.ts`.
 *
 * Every call goes through the typed client, so a path, a query name or a body is
 * checked against `src/lib/api/schema.d.ts` at build time.
 *
 * The list fetchers — `projectsPage`/`allProjects`, `developersPage`,
 * `microMarkets` — have no page yet: the project and the builder lists are still
 * the older data hub routes. They are this module's surface for those three list
 * routes. Every other fetcher here is called by a page or an island.
 */
import { api, call } from '@/lib/api/client';
import { ApiError, networkError } from '@/lib/api/errors';
import type { operations } from '@/lib/api/schema';
import type {
  DeveloperDetail,
  DeveloperPage,
  MapBounds,
  MarketPulse,
  MicroMarket,
  MicroMarketDetail,
  ProjectDetail,
  ProjectMapPoint,
  ProjectPage,
  ProjectSummary,
  WatchlistItem,
} from './types';

export type {
  BankAccount,
  DeveloperDetail,
  DeveloperScore,
  DeveloperSummary,
  Facility,
  LandUsage,
  MapBounds,
  MarketPulse,
  MicroMarket,
  MicroMarketDetail,
  Noc,
  PricePoint,
  ProjectCost,
  ProjectDetail,
  ProjectDocument,
  ProjectFaqItem,
  ProjectFaqList,
  ProjectMapPoint,
  ProjectPage,
  ProjectPerson,
  ProjectProfile,
  ProjectProvenance,
  ProjectSource,
  ProjectSummary,
  QuarterlyExpenditure,
  Specification,
  StatutoryApproval,
  UnitConfig,
  WatchlistItem,
} from './types';

export type Loaded<T> = { data: T; error: null } | { data: null; error: ApiError };

/** Server helper: runs a fetcher and never throws. */
export async function safe<T>(fn: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    return { data: null, error: error instanceof ApiError ? error : networkError(error) };
  }
}

/** Rows a list asks for per page. The backend caps a page at 100. */
export const PAGE = { projects: 20, developers: 20 } as const;

type ProjectsQuery = NonNullable<operations['list_projects_api_v1_data_hub_projects_get']['parameters']['query']>;
type DevelopersQuery = NonNullable<operations['list_developers_api_v1_data_hub_developers_get']['parameters']['query']>;

/** `include_total` is only worth asking for on the first page; later pages carry it from there. */
const first = (cursor: string | null) => (cursor ? { cursor } : { include_total: true });

/** Filters the project list accepts. They are the route's own query keys, so an unknown name cannot be sent. */
export type ProjectFilters = Pick<ProjectsQuery, 'q' | 'stage' | 'developer_slug'>;
/** Filters the developer list accepts. The route has no `is_listed` filter. */
export type DeveloperFilters = Pick<DevelopersQuery, 'q' | 'order_by'>;

export async function projectsPage(f: ProjectFilters, cursor: string | null, limit: number = PAGE.projects): Promise<ProjectPage> {
  return call(api.GET('/api/v1/data-hub/projects', { params: { query: { ...f, limit, ...first(cursor) } } }));
}

/**
 * Every project, page by page, for a caller that needs the whole set rather than
 * page 1 — today the sitemap, which lists the project detail pages. Those pages
 * are indexable and no other enumerator exists: the backend has no export route,
 * so the list API is paged.
 *
 * The ceiling is deliberate and generous: 200 pages of 100 rows is 20,000
 * projects, above the ~14,000 the NCR registers hold. A register that outgrows
 * it needs a backend export, not a longer walk.
 */
export async function allProjects(limit: number = PAGE.projects, maxPages = 50): Promise<ProjectSummary[]> {
  const out: ProjectSummary[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < maxPages; i += 1) {
    const page = await projectsPage({}, cursor, limit);
    out.push(...page.items);
    if (!page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return out;
}

export function project(slug: string): Promise<ProjectDetail> {
  return call(api.GET('/api/v1/data-hub/projects/{slug}', { params: { path: { slug } } }));
}

export async function developersPage(f: DeveloperFilters, cursor: string | null): Promise<DeveloperPage> {
  return call(api.GET('/api/v1/data-hub/developers', { params: { query: { ...f, limit: PAGE.developers, ...first(cursor) } } }));
}

export function developer(slug: string): Promise<DeveloperDetail> {
  return call(api.GET('/api/v1/data-hub/developers/{slug}', { params: { path: { slug } } }));
}

export function microMarkets(city?: string): Promise<MicroMarket[]> {
  return call(api.GET('/api/v1/data-hub/micro-markets', { params: { query: { city: city ?? null } } }));
}

export function microMarket(city: string, slug: string): Promise<MicroMarketDetail> {
  return call(api.GET('/api/v1/data-hub/micro-markets/{city}/{slug}', { params: { path: { city, slug } } }));
}

/**
 * One reading per city, the latest for each. The route is not paginated: it answers
 * with a bare array and takes no `limit` or `cursor`.
 */
export function marketPulse(city: string | null = null): Promise<MarketPulse[]> {
  return call(api.GET('/api/v1/data-hub/market-pulse', { params: { query: { city } } }));
}

/** Every city's latest reading, for the page. */
export function allMarketPulse(): Promise<MarketPulse[]> {
  return marketPulse(null);
}

/** The points inside a bounding box, for the discovery overlay. The route caps the count itself. */
export function mapProjects(bounds: MapBounds): Promise<ProjectMapPoint[]> {
  return call(api.GET('/api/v1/data-hub/map/projects', { params: { query: bounds } }));
}

/**
 * The window the discovery page loads with: Gurugram and its growth corridors.
 * It is the first box, not the only one: when the visitor zooms, the overlay
 * sends its own box back through `mapProjects`.
 */
export const DEFAULT_BOUNDS: MapBounds = { min_lat: 28.28, min_lng: 76.82, max_lat: 28.56, max_lng: 77.2 };

export function addToWatchlist(body: { project_id: number; notes?: string | null }): Promise<WatchlistItem> {
  return call(api.POST('/api/v1/data-hub/watchlist', { body }));
}

/** The signed-in account's watchlist. One bare array: the route is not paginated. */
export function watchlist(): Promise<WatchlistItem[]> {
  return call(api.GET('/api/v1/data-hub/watchlist'));
}

/** The route answers 204, so the typed client returns `undefined`, which `void` accepts. */
export function removeFromWatchlist(projectId: number): Promise<void> {
  return call(api.DELETE('/api/v1/data-hub/watchlist/{project_id}', { params: { path: { project_id: projectId } } }));
}

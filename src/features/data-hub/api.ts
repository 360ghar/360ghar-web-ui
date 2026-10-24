/**
 * Data hub API: types and fetchers. The same fetchers run on the server (page 1,
 * wrapped in `safe`) and in islands (inside TanStack Query), so both render the
 * same data. Field names are the wire names (aliases), see docs/backend-gaps.md X7-X13.
 */
import { api, call } from '@/lib/api/client';
import { ApiError, networkError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';
import { collectPages } from '@/lib/api/pages';
import type { AuctionFilters, BuilderFilters, CircleFilters, GazetteFilters, ReraFilters, ZoneFilters } from './params';
import { exactSector } from './format';

type S = components['schemas'];
export type CircleRate = S['CircleRateResponse'];
export type ReraProject = S['ReraProjectResponse'];
export type BankAuction = S['BankAuctionResponse'];
export type Zone = S['ZoningDataResponse'];
export type Colony = S['ColonyApprovalResponse'];
export type Gazette = S['GazetteNotificationResponse'];
export type Builder = S['BuilderReputationResponse'];
export type Complaint = S['ReraComplaintResponse'];
export type StampDuty = S['StampDutyCalculationResponse'];
export type Jamabandi = S['JamabandiLookupResponse'];
export type BuyerType = S['StampDutyCalculationRequest']['buyer_type'];

export type CourtAuction = S['CourtAuctionResponse'];
export type AuctionKind = S['AuctionKind'];
export type AuctionSource = S['AuctionSourceInfo'];
/** A list row or a detail: the backend sends `kind` on both and the two shapes differ. */
export type Auction = BankAuction | CourtAuction;

export type CircleRatePage = S['CursorPage_CircleRateResponse_'];
export type ReraProjectPage = S['CursorPage_ReraProjectResponse_'];
export type ZonePage = S['CursorPage_ZoningDataResponse_'];
export type GazettePage = S['CursorPage_GazetteNotificationResponse_'];
export type BuilderPage = S['CursorPage_BuilderReputationResponse_'];
export type AuctionPage = S['CursorPage_Union_BankAuctionResponse__CourtAuctionResponse__'];

/** Court rows have a case number and no bank. The wire `kind` is the discriminator. */
export const isCourt = (a: Auction): a is CourtAuction => a.kind === 'court';

export type Loaded<T> = { data: T; error: null } | { data: null; error: ApiError };

/** Server helper: runs a fetcher and never throws. */
export async function safe<T>(fn: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    return { data: null, error: error instanceof ApiError ? error : networkError(error) };
  }
}

export const PAGE = { circle: 20, rera: 12, auctions: 12, gazette: 20, builders: 20, zones: 12 } as const;

const first = (cursor: string | null) => (cursor ? { cursor } : { include_total: true });

export async function circleRatesPage(f: CircleFilters, cursor: string | null): Promise<CircleRatePage> {
  if (f.sector) {
    // The backend sector filter is a substring match ("Sector 1" also returns Sector 10, 102, ...),
    // so every page of the matches is read, and the rows of this sector alone are kept.
    const rows = await collectPages((c) =>
      call(api.GET('/api/v1/data-hub/circle-rates', { params: { query: { sector: f.sector, property_type: f.property_type ?? null, limit: 100, ...(c ? { cursor: c } : {}) } } })),
    );
    const items = exactSector(rows, f.sector);
    return { items, has_more: false, next_cursor: null, limit: 100, total: items.length };
  }
  return call(api.GET('/api/v1/data-hub/circle-rates', { params: { query: { property_type: f.property_type ?? null, limit: PAGE.circle, ...first(cursor) } } }));
}

/** Every rate of one property type (61 today; the API allows 100 a page, and the cursor is followed). */
export function circleRatesOfType(property_type: string): Promise<CircleRate[]> {
  return collectPages((cursor) => call(api.GET('/api/v1/data-hub/circle-rates', { params: { query: { property_type, limit: 100, ...(cursor ? { cursor } : {}) } } })));
}

/** Every residential, commercial and plot rate, for the sector charts. */
export async function allCircleRates(): Promise<CircleRate[]> {
  return (await Promise.all(['residential', 'commercial', 'plot'].map(circleRatesOfType))).flat();
}

/**
 * Facet lists (sectors, banks, cities, source categories) are `CursorPage` with the whole
 * list in one page (`has_more` false) and no paging keys, so `items` is all of it.
 */
export async function circleSectors(): Promise<string[]> {
  return (await call(api.GET('/api/v1/data-hub/circle-rates/sectors'))).items;
}

export async function circleRate(slug: string): Promise<CircleRate> {
  return call(api.GET('/api/v1/data-hub/circle-rates/{slug}', { params: { path: { slug } } }));
}

export async function stampDuty(body: { property_value: number; buyer_type: BuyerType }): Promise<StampDuty> {
  return call(api.POST('/api/v1/data-hub/calculator/stamp-duty', { body }));
}

export async function reraPage(f: ReraFilters, cursor: string | null): Promise<ReraProjectPage> {
  return call(api.GET('/api/v1/data-hub/rera-projects', { params: { query: { q: f.q ?? null, status: f.status ?? null, limit: PAGE.rera, ...first(cursor) } } }));
}

/** Every RERA project (30 today), for the status mix. */
export function allRera(): Promise<ReraProject[]> {
  return collectPages((cursor) => call(api.GET('/api/v1/data-hub/rera-projects', { params: { query: { limit: 100, ...(cursor ? { cursor } : {}) } } })));
}

export function verifyRera(n: string): Promise<S['ReraVerifyResult']> {
  return call(api.GET('/api/v1/data-hub/rera-projects/verify/{rera_number}', { params: { path: { rera_number: n } } }));
}

export async function auctionsPage(f: AuctionFilters, cursor: string | null): Promise<AuctionPage> {
  const { type, bank, ...rest } = f;
  return call(
    api.GET('/api/v1/data-hub/auctions', {
      // `bank` with `type=court` is a 422 (FILTER_NOT_SUPPORTED_FOR_KIND), so a court list never sends it.
      params: { query: { ...rest, ...(type ? { type } : {}), ...(bank && type !== 'court' ? { bank } : {}), limit: PAGE.auctions, ...first(cursor) } },
    }),
  );
}

export const auctionBanks = (): Promise<string[]> =>
  call(api.GET('/api/v1/data-hub/auctions/banks')).then((d) => d.items, () => []);

export async function auctionOptions(): Promise<{ banks: string[]; cities: string[] }> {
  const [banks, cities] = await Promise.all([auctionBanks(), call(api.GET('/api/v1/data-hub/auctions/cities')).then((d) => d.items, () => [])]);
  return { banks, cities };
}

/** The detail route needs the kind: bank and court rows have separate id spaces. */
export function auction(id: number, kind: AuctionKind): Promise<Auction> {
  return call(api.GET('/api/v1/data-hub/auctions/{auction_id}', { params: { path: { auction_id: id }, query: { kind } } }));
}

/** Auction portals with live counts, one flat list. Group by `category` to show sections. */
export async function sourceCategories(): Promise<AuctionSource[]> {
  return (await call(api.GET('/api/v1/data-hub/auctions/source-categories'))).items;
}

export async function zonesPage(f: ZoneFilters, cursor: string | null): Promise<ZonePage> {
  return call(api.GET('/api/v1/data-hub/zoning', { params: { query: { sector: f.sector ?? null, limit: PAGE.zones, ...first(cursor) } } }));
}

export async function zone(slug: string): Promise<Zone> {
  return call(api.GET('/api/v1/data-hub/zoning/{slug}', { params: { path: { slug } } }));
}

/** Every colony approval (5 exist today). */
export function colonies(): Promise<Colony[]> {
  return collectPages((cursor) => call(api.GET('/api/v1/data-hub/colony-approvals', { params: { query: { limit: 100, ...(cursor ? { cursor } : {}) } } })));
}

export async function gazettePage(f: GazetteFilters, cursor: string | null): Promise<GazettePage> {
  return call(api.GET('/api/v1/data-hub/gazette', { params: { query: { type: f.type ?? null, limit: PAGE.gazette, ...first(cursor) } } }));
}

export async function buildersPage(f: BuilderFilters, cursor: string | null, limit: number = PAGE.builders): Promise<BuilderPage> {
  return call(api.GET('/api/v1/data-hub/builders', { params: { query: { q: f.q ?? null, order_by: f.order_by ?? null, limit, ...first(cursor) } } }));
}

/**
 * Every builder, page by page, for a caller that needs the whole set rather than page 1 —
 * today the sitemap, which lists one detail page per builder slug. The builder index shows
 * page 1 only (20 rows), and the register holds 97 builders, so reading one page would
 * leave 77 detail pages out of the sitemap.
 */
export function allBuilders(): Promise<Builder[]> {
  return collectPages((cursor) => buildersPage({}, cursor, 100));
}

export async function builder(slug: string): Promise<Builder> {
  return call(api.GET('/api/v1/data-hub/builders/{slug}', { params: { path: { slug } } }));
}

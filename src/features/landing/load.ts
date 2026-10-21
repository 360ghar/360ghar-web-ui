import type { PropertyPage } from '@/lib/api/types';
import type { AstroGlobal } from 'astro';
import { api, attempt } from '@/lib/api/client';
import type { Property, PropertyType } from '@/lib/api/types';
import { respond } from '@/lib/cache';
import { localeFromPath, type Locale } from '@/lib/i18n/locale';
import { BUDGETS, emptyFilters, parseFilters, toApiQuery, type Filters } from '@/features/search/filters';
import { loadFirstPage, loadAmenities, type FirstPage } from '@/features/search/load';
import { landingCopy } from './copy';
import { amenitySlug, budgetsFor, isIndexable, landingFilters, parseBhk, parseLanding, type Facet, type Landing } from './model';

/** A page that has homes, offered when this landing page has none. `href` is not localised. */
export type Related = { href: string; label: string; count: number };

export type LandingResult =
  | {
      ok: true;
      landing: Landing;
      facet?: Facet;
      filters: Filters;
      first: FirstPage;
      indexable: boolean;
      /** Up to 100 homes of this page, for the live numbers and the price chart. Null if the call failed. */
      homes: Property[] | null;
      related: Related[];
    }
  | { ok: false };

type FacetParam = { bhk?: string; budget?: string; amenity?: string } | undefined;

/** Resolves params, loads page 1 and sets status and caching. Never throws. */
export async function loadLanding(astro: AstroGlobal, facetParam: FacetParam): Promise<LandingResult> {
  const { city = '', intent = '', type = '' } = astro.params as Record<string, string>;
  const landing = parseLanding(city.toLowerCase(), intent.toLowerCase(), type.toLowerCase());
  let facet: Facet | undefined;
  if (landing && facetParam?.bhk !== undefined) {
    const n = parseBhk(facetParam.bhk.toLowerCase());
    if (n && landing.intent !== 'pg') facet = { kind: 'bhk', bhk: n };
  } else if (landing && facetParam?.budget !== undefined) {
    const key = facetParam.budget.toLowerCase();
    if (BUDGETS[key] && budgetsFor(landing.intent).includes(key)) facet = { kind: 'budget', key };
  } else if (landing && facetParam?.amenity !== undefined) {
    const slug = facetParam.amenity.toLowerCase();
    const hit = (await loadAmenities()).find((a) => amenitySlug(a.title) === slug);
    if (hit) facet = { kind: 'amenity', slug, title: hit.title };
  }
  const wantsFacet = Boolean(facetParam && Object.values(facetParam).some((v) => v !== undefined));
  if (!landing || (wantsFacet && !facet)) {
    respond(astro, 'hour', { notFound: true });
    return { ok: false };
  }
  // Extra filters from the query string (for example ?furnishing=furnished) apply on top.
  const fromUrl = parseFilters(astro.url.searchParams);
  const base = landingFilters(landing, facet);
  const filters: Filters = { ...fromUrl, ...stripEmpty(base), property_type: base.property_type, amenities: [...new Set([...base.amenities, ...fromUrl.amenities])] };
  // Page 1 for the list, and up to 100 homes for the numbers, in parallel.
  const [first, all] = await Promise.all([loadFirstPage(filters), homesOf(filters, 100)]);
  // The backend total only (the call asks for it). A page length is not a total, so a missing one is unknown, not a count.
  const count = first.page?.total ?? null;
  const related = count === 0 ? await relatedPages(landing, facet, localeFromPath(astro.url.pathname)) : [];
  // The list is the page: a failed load must not be stored by crawlers as an empty page.
  respond(astro, 'hour', { error: Boolean(first.error) });
  return { ok: true, landing, facet, filters, first, indexable: isIndexable(landing, facet, count) && !astro.url.search, homes: all?.items ?? null, related };
}

/** One page of homes with the total, or null if the call failed. */
async function homesOf(filters: Filters, limit: number): Promise<PropertyPage | null> {
  const res = await attempt(api.GET('/api/v1/properties', { params: { query: toApiQuery(filters, { limit, total: true }) } }));
  return res.data;
}

const total = async (filters: Filters) => (await homesOf(filters, 1))?.total ?? 0;

const LANDING_TYPES = ['flats', 'builder-floor', 'independent-house', 'villa', 'plots', 'office-space'];

/**
 * Pages near this one that do have homes, with live counts: the same type for
 * another purpose, the same purpose for another type, short stays of the same
 * type, and every home for this purpose. At most four, biggest first.
 */
async function relatedPages(l: Landing, facet: Facet | undefined, locale: Locale): Promise<Related[]> {
  const hi = locale === 'hi';
  const purpose = l.intent === 'pg' ? 'rent' : l.intent;
  const page = (x: Landing | null) => (x ? { href: x.path, label: landingCopy(x, undefined, locale).h1, filters: landingFilters(x) } : null);
  const candidates = [
    // The same page without its facet.
    facet ? page(l) : null,
    // The same type for the other purposes.
    ...(['buy', 'rent'] as const).filter((i) => i !== l.intent && l.intent !== 'pg').map((i) => page(parseLanding(l.city, i, l.typeSegment))),
    // Other types for the same purpose.
    ...LANDING_TYPES.filter((s) => s !== l.typeSegment && l.intent !== 'pg').map((s) => page(parseLanding(l.city, l.intent, s))),
    // Short stays of the same type, and every home for this purpose.
    {
      href: `/properties?purpose=short_stay&property_type=${l.type}`,
      label: hi ? `${typeName(l.type, locale)}: कम समय के लिए` : `${typeName(l.type, locale)} for short stays`,
      filters: { ...emptyFilters(), purpose: 'short_stay' as const, property_type: [l.type] },
    },
    {
      href: `/properties?purpose=${purpose}`,
      label: hi ? `गुरुग्राम में सभी घर ${purpose === 'buy' ? 'बिक्री के लिए' : 'किराये के लिए'}` : `All homes ${purpose === 'buy' ? 'for sale' : 'for rent'} in Gurugram`,
      filters: { ...emptyFilters(), purpose },
    },
  ].filter((x): x is NonNullable<typeof x> => Boolean(x));
  const counts = await Promise.all(candidates.map((c) => total(c.filters)));
  return candidates
    .map((c, i) => ({ href: c.href, label: c.label, count: counts[i]! }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}

const TYPE_NAME: Partial<Record<PropertyType, [string, string]>> = { apartment: ['Flats', 'फ़्लैट'], builder_floor: ['Builder floors', 'बिल्डर फ़्लोर'], house: ['Houses', 'मकान'], villa: ['Villas', 'विला'], plot: ['Plots', 'प्लॉट'], office: ['Offices', 'ऑफ़िस'], shop: ['Shops', 'दुकानें'], pg: ['PG rooms', 'पीजी'] };
const typeName = (t: PropertyType, locale: Locale) => TYPE_NAME[t]?.[locale === 'hi' ? 1 : 0] ?? t;

function stripEmpty(f: Filters): Partial<Filters> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) if (v !== undefined && !(Array.isArray(v) && v.length === 0)) out[k] = v;
  return out as Partial<Filters>;
}


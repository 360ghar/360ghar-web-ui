/**
 * Programmatic landing pages: /:city, /:city/:intent/:type and the BHK,
 * budget and amenity facets. Index rules are the old site's
 * (src/seo/indexationPolicy.js), plus: a page with no homes is noindex.
 */
import type { PropertyType } from '@/lib/api/types';
import { askPrice } from '@/lib/format';
import { BUDGETS, emptyFilters, type Filters } from '@/features/search/filters';
import { isPlaceholderPrice, robustRange } from '@/features/search/prices';

export const CITIES: Record<string, { name: string; hi: string; lat: number; lng: number }> = {
  gurgaon: { name: 'Gurgaon', hi: 'गुड़गाँव', lat: 28.4595, lng: 77.0266 },
  delhi: { name: 'Delhi', hi: 'दिल्ली', lat: 28.6139, lng: 77.209 },
  noida: { name: 'Noida', hi: 'नोएडा', lat: 28.5355, lng: 77.391 },
  faridabad: { name: 'Faridabad', hi: 'फ़रीदाबाद', lat: 28.4089, lng: 77.3178 },
  ghaziabad: { name: 'Ghaziabad', hi: 'ग़ाज़ियाबाद', lat: 28.6692, lng: 77.4538 },
};

export type Intent = 'buy' | 'rent' | 'pg';
export const INTENTS: Intent[] = ['buy', 'rent', 'pg'];

/** Canonical URL segment -> property type. */
export const TYPE_SEGMENTS: Record<string, PropertyType> = {
  flats: 'apartment',
  'independent-house': 'house',
  'builder-floor': 'builder_floor',
  villa: 'villa',
  plots: 'plot',
  'office-space': 'office',
  shop: 'shop',
};

export const segmentFor = (t: PropertyType): string => Object.entries(TYPE_SEGMENTS).find(([, v]) => v === t)?.[0] ?? 'flats';

export type Landing = {
  city: string;
  cityName: string;
  intent: Intent;
  typeSegment: string;
  type: PropertyType;
  path: string;
};

/** Validates path params. Aliases are redirected earlier (lib/redirects.ts). */
export function parseLanding(city: string, intent: string, type: string): Landing | null {
  const c = CITIES[city];
  if (!c || !INTENTS.includes(intent as Intent)) return null;
  const i = intent as Intent;
  if (i === 'pg') {
    if (type !== 'flats') return null;
    return { city, cityName: c.name, intent: i, typeSegment: 'flats', type: 'pg', path: `/${city}/pg/flats` };
  }
  const t = TYPE_SEGMENTS[type];
  if (!t) return null;
  return { city, cityName: c.name, intent: i, typeSegment: type, type: t, path: `/${city}/${i}/${type}` };
}

export type Facet = { kind: 'bhk'; bhk: number } | { kind: 'budget'; key: string } | { kind: 'amenity'; slug: string; title: string };

export function parseBhk(seg: string): number | null {
  const m = seg.match(/^([1-5])-bhk$/);
  return m ? Number(m[1]) : null;
}

export const amenitySlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Filters for a landing page and its facet. */
export function landingFilters(l: Landing, facet?: Facet): Filters {
  const f: Filters = { ...emptyFilters(), purpose: l.intent === 'pg' ? 'rent' : l.intent, property_type: [l.type], city: l.cityName };
  if (facet?.kind === 'bhk') {
    f.bedrooms_min = facet.bhk;
    if (facet.bhk < 4) f.bedrooms_max = facet.bhk;
  }
  if (facet?.kind === 'budget') f.price_max = BUDGETS[facet.key]!.price_max;
  if (facet?.kind === 'amenity') f.amenities = [facet.title];
  return f;
}

/** Budget facets that fit the intent (PG uses the rent budgets). */
export function budgetsFor(intent: Intent): string[] {
  const want = intent === 'buy' ? 'buy' : 'rent';
  return Object.entries(BUDGETS)
    .filter(([, b]) => b.purpose === want)
    .map(([k]) => k);
}

const INDEXABLE_BUDGETS = new Set(['gurgaon/buy/under-50-lakhs', 'gurgaon/buy/under-80-lakhs', 'gurgaon/buy/under-1-crore', 'gurgaon/rent/under-20k']);

/** Old index rules, per page. `count` of 0 makes any page noindex. */
export function isIndexable(l: Landing, facet: Facet | undefined, count: number | null): boolean {
  if (count === 0) return false;
  if (!facet) return true;
  if (facet.kind === 'amenity') return false;
  if (l.intent === 'pg') return false;
  if (facet.kind === 'bhk') return facet.bhk <= 3;
  return INDEXABLE_BUDGETS.has(`${l.city}/${l.intent}/${facet.key}`);
}

export function budgetLabel(key: string, hi = false): string {
  const map: Record<string, [string, string]> = {
    'under-10k': ['under ₹10,000', '₹10,000 से कम'],
    'under-15k': ['under ₹15,000', '₹15,000 से कम'],
    'under-20k': ['under ₹20,000', '₹20,000 से कम'],
    'under-50-lakhs': ['under ₹50 lakh', '₹50 लाख से कम'],
    'under-80-lakhs': ['under ₹80 lakh', '₹80 लाख से कम'],
    'under-1-crore': ['under ₹1 crore', '₹1 करोड़ से कम'],
  };
  return map[key]?.[hi ? 1 : 0] ?? key;
}

/* ---------- Live numbers and price bands for the landing header and chart ---------- */

type Priced = { purpose: string; base_price: number; monthly_rent?: number | null; daily_rate?: number | null; area_sqft?: number | null; price_per_sqft?: number | null; locality?: string | null };

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

/**
 * Numbers for a landing page, from the homes it lists (real data only). The
 * ₹10 Cr stand-in price is left out of the prices (not of the count), and the
 * range is where most prices sit (25th to 75th percentile), so one extreme
 * listing does not stretch it.
 */
export function landingStats(homes: Priced[]) {
  const priced = homes.filter((p) => !isPlaceholderPrice(p));
  const prices = priced.map(askPrice).filter((v) => v > 0);
  const rates = priced
    .filter((p) => p.purpose === 'buy')
    // The backend computes the price per sq ft, as on the cards.
    .map((p) => p.price_per_sqft ?? 0)
    .filter((v) => v > 0);
  const by = new Map<string, { count: number; prices: number[] }>();
  for (const p of homes) {
    const name = (p.locality ?? '').trim();
    if (!name) continue;
    const row = by.get(name) ?? { count: 0, prices: [] };
    row.count += 1;
    if (!isPlaceholderPrice(p)) row.prices.push(askPrice(p));
    by.set(name, row);
  }
  const localities = [...by]
    .map(([name, r]) => ({ name, count: r.count, prices: r.prices }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return {
    count: homes.length,
    /** Homes left out of the prices (stand-in price). */
    unpriced: homes.length - priced.length,
    range: robustRange(prices),
    median: median(prices),
    medianRate: median(rates),
    localities,
  };
}

const UNIT: Record<string, number> = { k: 1e3, l: 1e5, cr: 1e7 };

/**
 * A band from `landingTypeContext.json` in rupees: "65L-1.2Cr" -> [6.5e6, 1.2e7],
 * "1.5-3.5Cr" -> [1.5e7, 3.5e7], "3.5Cr+" -> [3.5e7, null], "10K-25K/mo" -> [1e4, 2.5e4].
 * A number without a unit takes the unit of the other end. Returns null if unreadable.
 */
export function parseBand(range: string): [number, number | null] | null {
  const m = range
    .toLowerCase()
    .replace(/\/mo(nth)?|\s/g, '')
    .match(/^([\d.]+)(k|l|cr)?(?:-([\d.]+)(k|l|cr)?|(\+))$/);
  if (!m) return null;
  const [, a, ua, b, ub, plus] = m;
  const lo = Number(a) * UNIT[ua ?? ub ?? '']!;
  if (plus) return Number.isFinite(lo) ? [lo, null] : null;
  const hi = Number(b) * UNIT[ub ?? ua ?? '']!;
  return Number.isFinite(lo) && Number.isFinite(hi) && hi > lo ? [lo, hi] : null;
}

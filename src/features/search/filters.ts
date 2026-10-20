/**
 * Search filters: one model for the URL, the API query and the filter UI.
 *
 * - `parseFilters` reads canonical names and every legacy alias the old site
 *   accepted (intent, type, bhk, budget, amenity, min_price, latitude, ...).
 * - Values are clamped to the backend limits (GET /api/v1/properties), so a
 *   hand-edited URL cannot cause a 422.
 * - `toSearchParams` writes canonical names only. `toApiQuery` adds paging.
 */
import { FURNISHING_LEVELS, GENDER_PREFERENCES, MOVE_IN_TIMELINES, PROPERTY_TYPES, SHARING_TYPES } from '@/lib/api/enums';
import type { PropertySearchQuery, PropertyType, SortBy } from '@/lib/api/types';

const COMMERCIAL: PropertyType[] = ['office', 'shop', 'warehouse'];
const SORTS: SortBy[] = ['newest', 'price_low', 'price_high', 'popular', 'distance', 'relevance'];
export const FURNISHING = FURNISHING_LEVELS;
const GENDER = GENDER_PREFERENCES;
const SHARING = SHARING_TYPES;
export const MOVE_IN = MOVE_IN_TIMELINES;

export type Filters = {
  purpose?: 'buy' | 'rent' | 'short_stay';
  property_type: PropertyType[];
  q?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  /** Display name for lat/lng. UI only; never sent to the API. */
  place?: string;
  city?: string;
  locality?: string;
  pincode?: string;
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  bathrooms_min?: number;
  bathrooms_max?: number;
  area_min?: number;
  area_max?: number;
  furnishing: (typeof FURNISHING)[number][];
  amenities: string[];
  features: string[];
  parking_spaces_min?: number;
  floor_number_min?: number;
  floor_number_max?: number;
  age_max?: number;
  has_lift?: boolean;
  gender_preference?: (typeof GENDER)[number];
  sharing_type?: (typeof SHARING)[number];
  move_in?: (typeof MOVE_IN)[number];
  available_from?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  sort_by?: SortBy;
};

export const emptyFilters = (): Filters => ({ property_type: [], furnishing: [], amenities: [], features: [] });

const TYPE_ALIASES: Record<string, PropertyType[]> = {
  apartment: ['apartment'],
  apartments: ['apartment'],
  'apartment flat': ['apartment'],
  'apartment/flat': ['apartment'],
  flat: ['apartment'],
  flats: ['apartment'],
  house: ['house'],
  houses: ['house'],
  'independent house': ['house'],
  villa: ['villa'],
  villas: ['villa'],
  plot: ['plot'],
  plots: ['plot'],
  'plot / land': ['plot'],
  'plot land': ['plot'],
  land: ['plot'],
  'residential land': ['plot'],
  'commercial land': ['plot'],
  room: ['room'],
  rooms: ['room'],
  'builder floor': ['builder_floor'],
  floor: ['builder_floor'],
  pg: ['pg'],
  'paying guest': ['pg'],
  'co living': ['pg'],
  coliving: ['pg'],
  hostel: ['pg'],
  flatmate: ['flatmate'],
  roommate: ['flatmate'],
  office: ['office'],
  'office space': ['office'],
  shop: ['shop'],
  shops: ['shop'],
  showroom: ['shop'],
  'retail shop': ['shop'],
  warehouse: ['warehouse'],
  warehouses: ['warehouse'],
  commercial: COMMERCIAL,
};

export const BUDGETS: Record<string, { price_max: number; purpose: 'buy' | 'rent' }> = {
  'under-10k': { price_max: 10_000, purpose: 'rent' },
  'under-15k': { price_max: 15_000, purpose: 'rent' },
  'under-20k': { price_max: 20_000, purpose: 'rent' },
  'under-50-lakhs': { price_max: 5_000_000, purpose: 'buy' },
  'under-80-lakhs': { price_max: 8_000_000, purpose: 'buy' },
  'under-1-crore': { price_max: 10_000_000, purpose: 'buy' },
};

const token = (v: string) => v.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

function normaliseTypes(values: string[]): PropertyType[] {
  const out = new Set<PropertyType>();
  for (const v of values) {
    for (const part of v.split(',')) {
      const t = token(part);
      if (!t || t === 'all') continue;
      const hit = TYPE_ALIASES[t] ?? (PROPERTY_TYPES.includes(t.replace(/ /g, '_') as PropertyType) ? [t.replace(/ /g, '_') as PropertyType] : []);
      for (const x of hit) out.add(x);
    }
  }
  return [...out];
}

function purposeOf(v: string | null): Filters['purpose'] | 'pg' | undefined {
  if (!v) return undefined;
  const t = token(v);
  if (t === 'sale' || t === 'buy') return 'buy';
  if (t === 'rent') return 'rent';
  if (t === 'short stay') return 'short_stay';
  if (t === 'pg') return 'pg';
  return undefined;
}

function num(v: string | null | undefined, min?: number, max?: number): number | undefined {
  if (v === null || v === undefined || v.trim() === '') return undefined;
  const n = Number(v.replace(/,/g, ''));
  if (!Number.isFinite(n)) return undefined;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

const int = (v: string | null | undefined, min?: number, max?: number) => {
  const n = num(v, min, max);
  return n === undefined ? undefined : Math.round(n);
};

const oneOf = <T extends string>(list: readonly T[], v: string | null | undefined): T | undefined =>
  v && (list as readonly string[]).includes(v) ? (v as T) : undefined;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const date = (v: string | null) => (v && DATE.test(v) ? v : undefined);

/** Reads filters from URL search params (canonical and legacy names). */
export function parseFilters(sp: URLSearchParams): Filters {
  const get = (...names: string[]) => {
    for (const n of names) {
      const v = sp.get(n);
      if (v !== null && v !== '') return v;
    }
    return null;
  };
  const all = (...names: string[]) => names.flatMap((n) => sp.getAll(n)).filter(Boolean);
  const f = emptyFilters();

  const p = purposeOf(get('purpose', 'intent'));
  const types = normaliseTypes(all('property_type', 'property_types', 'type'));
  if (p === 'pg') {
    f.purpose = 'rent';
    if (!types.includes('pg')) types.push('pg');
  } else if (p) f.purpose = p;
  f.property_type = types;

  const q = get('q', 'searchKeyword', 'search');
  if (q) f.q = q.slice(0, 200);
  const lat = num(get('lat', 'latitude'), -90, 90);
  const lng = num(get('lng', 'longitude'), -180, 180);
  if (lat !== undefined && lng !== undefined) {
    f.lat = lat;
    f.lng = lng;
    f.radius = int(get('radius', 'radius_km'), 1, 100) ?? 10;
    const place = get('place');
    if (place) f.place = place.slice(0, 120);
  }
  const city = get('city');
  if (city) f.city = city;
  const locality = get('locality');
  if (locality) f.locality = locality;
  const pincode = get('pincode', 'zip_code');
  if (pincode && /^\d{6}$/.test(pincode)) f.pincode = pincode;

  f.price_min = num(get('price_min', 'min_price'), 0, 1e9);
  f.price_max = num(get('price_max', 'max_price'), 0, 1e9);
  f.bedrooms_min = int(get('bedrooms_min', 'bedrooms'), 0, 20);
  f.bedrooms_max = int(get('bedrooms_max'), 0, 20);
  f.bathrooms_min = int(get('bathrooms_min', 'bathrooms'), 0, 10);
  f.bathrooms_max = int(get('bathrooms_max'), 0, 10);
  f.area_min = num(get('area_min', 'min_area'), 0, 100_000);
  f.area_max = num(get('area_max', 'max_area'), 0, 100_000);

  const bhk = int(get('bhk'), 1, 20);
  if (bhk) {
    f.bedrooms_min = bhk;
    f.bedrooms_max = bhk >= 4 ? undefined : bhk;
  }
  const budget = BUDGETS[(get('budget') ?? '').toLowerCase()];
  if (budget && f.price_max === undefined) f.price_max = budget.price_max;

  f.furnishing = all('furnishing').filter((v): v is Filters['furnishing'][number] => (FURNISHING as readonly string[]).includes(v));
  f.amenities = [...new Set([...all('amenities'), ...all('amenity')])].slice(0, 20);
  f.features = [...new Set(all('features'))].slice(0, 20);
  f.parking_spaces_min = int(get('parking_spaces_min'), 0, 10);
  f.floor_number_min = int(get('floor_number_min'), 0, 100);
  f.floor_number_max = int(get('floor_number_max'), 0, 100);
  f.age_max = int(get('age_max'), 0, 100);
  if (get('has_lift') === 'true') f.has_lift = true;
  f.gender_preference = oneOf(GENDER, get('gender_preference'));
  f.sharing_type = oneOf(SHARING, get('sharing_type'));
  f.move_in = oneOf(MOVE_IN, get('move_in'));
  f.available_from = date(get('available_from'));
  f.check_in = date(get('check_in'));
  f.check_out = date(get('check_out'));
  f.guests = int(get('guests'), 1, 20);

  const sort = get('sort_by', 'sort');
  const legacySort: Record<string, SortBy> = { price_asc: 'price_low', price_desc: 'price_high' };
  f.sort_by = oneOf(SORTS, sort) ?? (sort ? legacySort[sort] : undefined);
  if (f.sort_by === 'distance' && f.lat === undefined) f.sort_by = undefined;

  return clean(f);
}

/** Drops undefined keys so equality checks and URLs stay stable. */
function clean(f: Filters): Filters {
  for (const k of Object.keys(f) as (keyof Filters)[]) if (f[k] === undefined) delete f[k];
  return f;
}

const ORDER: (keyof Filters)[] = [
  'purpose',
  'property_type',
  'q',
  'place',
  'lat',
  'lng',
  'radius',
  'city',
  'locality',
  'pincode',
  'price_min',
  'price_max',
  'bedrooms_min',
  'bedrooms_max',
  'bathrooms_min',
  'bathrooms_max',
  'area_min',
  'area_max',
  'furnishing',
  'amenities',
  'features',
  'parking_spaces_min',
  'floor_number_min',
  'floor_number_max',
  'age_max',
  'has_lift',
  'gender_preference',
  'sharing_type',
  'move_in',
  'available_from',
  'check_in',
  'check_out',
  'guests',
  'sort_by',
];

/** Canonical URL params, in a fixed order (stable URLs cache better). */
export function toSearchParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  for (const k of ORDER) {
    const v = f[k];
    if (v === undefined || v === null || v === '' || v === false) continue;
    if (Array.isArray(v)) for (const x of v) sp.append(k, String(x));
    else sp.set(k, String(v));
  }
  return sp;
}

/**
 * Sets the search centre from "Near me". A real fix keeps v1's 5 km start; the
 * fallback centre (the browser gave no location) is approximate, so it starts
 * wider (10 km, as a typed place does) and carries the caller's honest label.
 * Nothing else changes: not the ranking, not the other filters.
 */
export function withNearMe(f: Filters, at: { lat: number; lng: number }, label: string, approximate = false): Filters {
  return { ...f, lat: at.lat, lng: at.lng, radius: f.radius ?? (approximate ? 10 : 5), place: label, sort_by: 'distance' };
}

/**
 * The `Filters` keys that GET /api/v1/properties declares. The query is built
 * from this list only, because an undeclared key is a 422. `place` is UI only.
 * The type check fails here when a key is not a declared query key.
 */
const API_KEYS = [
  'purpose',
  'property_type',
  'q',
  'lat',
  'lng',
  'radius',
  'city',
  'locality',
  'pincode',
  'price_min',
  'price_max',
  'bedrooms_min',
  'bedrooms_max',
  'bathrooms_min',
  'bathrooms_max',
  'area_min',
  'area_max',
  'furnishing',
  'amenities',
  'features',
  'parking_spaces_min',
  'floor_number_min',
  'floor_number_max',
  'age_max',
  'has_lift',
  'gender_preference',
  'sharing_type',
  'move_in',
  'available_from',
  'check_in',
  'check_out',
  'guests',
  'sort_by',
] as const satisfies readonly (keyof Filters & keyof PropertySearchQuery)[];

/** Query for GET /api/v1/properties: declared keys only, no empty lists. */
export function toApiQuery(f: Filters, page: { limit?: number; cursor?: string | null; total?: boolean } = {}): PropertySearchQuery {
  const picked: Partial<Pick<Filters, (typeof API_KEYS)[number]>> = {};
  for (const k of API_KEYS) {
    const v = f[k];
    if (v === undefined || (Array.isArray(v) && v.length === 0)) continue;
    Object.assign(picked, { [k]: v });
  }
  // The backend takes both stay dates or neither (a lone date is a 422).
  if (!(f.check_in && f.check_out)) {
    delete picked.check_in;
    delete picked.check_out;
  }
  return {
    ...picked,
    sort_by: f.sort_by ?? (f.lat !== undefined ? 'distance' : 'newest'),
    limit: page.limit ?? 12,
    ...(page.cursor ? { cursor: page.cursor } : {}),
    ...(page.total ? { include_total: true } : {}),
  };
}

/** Number of filters the user set (for the "Filters (3)" button). */
export function activeCount(f: Filters): number {
  let n = 0;
  if (f.purpose) n += 1;
  if (f.property_type.length) n += 1;
  if (f.price_min !== undefined || f.price_max !== undefined) n += 1;
  if (f.bedrooms_min !== undefined || f.bedrooms_max !== undefined) n += 1;
  if (f.bathrooms_min !== undefined || f.bathrooms_max !== undefined) n += 1;
  if (f.area_min !== undefined || f.area_max !== undefined) n += 1;
  n += f.furnishing.length ? 1 : 0;
  n += f.amenities.length + f.features.length;
  for (const k of ['parking_spaces_min', 'floor_number_min', 'floor_number_max', 'age_max', 'has_lift', 'gender_preference', 'sharing_type', 'move_in', 'available_from', 'check_in', 'guests', 'city', 'locality', 'pincode'] as const) {
    if (f[k] !== undefined) n += 1;
  }
  return n;
}

const LEGACY_KEYS = [
  'intent',
  'type',
  'property_types',
  'bhk',
  'budget',
  'amenity',
  'min_price',
  'max_price',
  'min_area',
  'max_area',
  'zip_code',
  'latitude',
  'longitude',
  'radius_km',
  'searchKeyword',
  'search',
  'bedrooms',
  'bathrooms',
  'sort',
  'page',
  'offset',
  'cursor',
  'view',
  'limit',
];
const KNOWN = new Set<string>([...ORDER, ...LEGACY_KEYS]);

/**
 * When the URL uses old names, returns the canonical query string (keeping
 * unknown params such as utm_*). Returns null when no redirect is needed.
 */
export function legacySearchRedirect(sp: URLSearchParams, f: Filters): string | null {
  const hasLegacy = LEGACY_KEYS.some((k) => sp.has(k)) || sp.get('sort_by') === 'price_asc' || sp.get('sort_by') === 'price_desc';
  if (!hasLegacy) return null;
  const out = toSearchParams(f);
  for (const [k, v] of sp) if (!KNOWN.has(k)) out.append(k, v);
  return out.toString();
}

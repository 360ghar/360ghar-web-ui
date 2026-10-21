/**
 * List filters in the URL. Each list declares its keys once; `readParams`
 * drops anything unknown or invalid, so a bad link renders the unfiltered list
 * instead of a backend 422 or 500 (for example `?type=bogus` on the gazette).
 * URL keys are the backend query names, so the filters go to the API as they are.
 */
import { AUCTION_KINDS, AUCTION_PROPERTY_TYPES, GAZETTE_TYPES } from '@/lib/api/enums';

type Kind = 'text' | 'number' | 'date' | readonly string[];
type Spec = Record<string, Kind>;
type Out<S extends Spec> = {
  [K in keyof S]?: S[K] extends 'number' ? number : S[K] extends readonly (infer V)[] ? V : string;
};

export const CIRCLE = { sector: 'text', property_type: ['residential', 'commercial', 'plot'] } as const;
export const RERA = { q: 'text', status: ['registered', 'lapsed', 'revoked', 'completed'] } as const;
export const AUCTION = {
  city: 'text',
  type: AUCTION_KINDS,
  bank: 'text',
  property_type: AUCTION_PROPERTY_TYPES,
  min_price: 'number',
  max_price: 'number',
  date_from: 'date',
  date_to: 'date',
} as const;
export const GAZETTE = { type: GAZETTE_TYPES } as const;
export const BUILDER = { q: 'text', order_by: ['score'] } as const;
export const ZONE = { sector: 'text' } as const;

export type CircleFilters = Out<typeof CIRCLE>;
export type ReraFilters = Out<typeof RERA>;
export type AuctionFilters = Out<typeof AUCTION>;
export type GazetteFilters = Out<typeof GAZETTE>;
export type BuilderFilters = Out<typeof BUILDER>;
export type ZoneFilters = Out<typeof ZONE>;

export function readParams<S extends Spec>(sp: URLSearchParams, spec: S): Out<S> {
  const out: Record<string, string | number> = {};
  for (const [key, kind] of Object.entries(spec)) {
    const raw = sp.get(key)?.trim();
    if (!raw) continue;
    if (kind === 'text') out[key] = raw.slice(0, 80);
    else if (kind === 'number') {
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) out[key] = n;
    } else if (kind === 'date') {
      // Date.parse rolls 2026-02-30 over to March, so compare the round trip.
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw) && new Date(`${raw}T00:00:00Z`).toISOString().slice(0, 10) === raw) out[key] = raw;
    } else if ((kind as readonly string[]).includes(raw)) out[key] = raw;
  }
  return out as Out<S>;
}

/** Stable query string: keys in spec order, empty values left out. */
export function writeParams<S extends Spec>(filters: Out<S>, spec: S): string {
  const sp = new URLSearchParams();
  for (const key of Object.keys(spec)) {
    const v = (filters as Record<string, unknown>)[key];
    if (v !== undefined && v !== null && v !== '') sp.set(key, String(v));
  }
  return sp.toString();
}

export const activeFilters = (filters: object) => Object.values(filters).filter((v) => v !== undefined && v !== '').length;

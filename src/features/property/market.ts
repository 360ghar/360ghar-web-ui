/**
 * Where a home's price per sq ft sits among the other homes of the same type
 * for sale in the same locality on 360Ghar. Real listings only; nothing when
 * fewer than three can be compared.
 */
import { isPlaceholderPrice, percentile } from '@/features/search/prices';
import type { Property } from '@/lib/api/types';

type Priced = Pick<Property, 'id' | 'purpose' | 'property_type' | 'locality' | 'base_price' | 'area_sqft' | 'price_per_sqft'>;

export type PriceContext = {
  /** This home's price per sq ft. */
  own: number;
  /** The other homes' prices per sq ft, low to high. */
  values: number[];
  min: number;
  max: number;
  median: number;
  /** This home against the median, in whole percent (negative = below). */
  diffPct: number;
};

// The backend computes the price per sq ft (null without an area).
const perSqft = (p: Priced) => p.price_per_sqft || null;

export function priceContext(p: Priced, peers: readonly Priced[], minPeers = 3): PriceContext | null {
  const own = perSqft(p);
  if (p.purpose !== 'buy' || !p.locality || own === null || isPlaceholderPrice(p)) return null;
  const seen = new Set<number>([p.id]);
  const values: number[] = [];
  for (const o of peers) {
    // The API matches `locality` as a substring ("Sector 8" also finds Sector 85), so compare exactly.
    if (seen.has(o.id) || o.purpose !== 'buy' || o.property_type !== p.property_type || o.locality?.trim().toLowerCase() !== p.locality.trim().toLowerCase()) continue;
    const v = perSqft(o);
    if (v === null || isPlaceholderPrice(o)) continue;
    seen.add(o.id);
    values.push(Math.round(v));
  }
  if (values.length < minPeers) return null;
  values.sort((a, b) => a - b);
  const mid = Math.round(percentile(values, 50)!);
  return { own: Math.round(own), values, min: values[0]!, max: values[values.length - 1]!, median: mid, diffPct: Math.round(((own - mid) / mid) * 100) };
}

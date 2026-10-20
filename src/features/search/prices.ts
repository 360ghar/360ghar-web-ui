/**
 * Price helpers shared by the card, the paper map, landing pages and compare.
 *
 * Some sale listings carry a stand-in price of exactly ₹10 Cr (ids 153-169 on
 * 2026-09-28): at 1,500 sq ft that is over ₹60,000 per sq ft, far above any
 * home here. They stay in the list with their price, but summaries leave them
 * out, so one stand-in does not become "from ₹10 Cr".
 */
type Priced = { purpose: string; base_price: number; area_sqft?: number | null };

const PLACEHOLDER_PRICE = 1e8;
const PLACEHOLDER_RATE = 40_000;

/** True for the stand-in price: exactly ₹10 Cr at more than ₹40,000 per sq ft. */
export function isPlaceholderPrice(p: Priced): boolean {
  return p.purpose === 'buy' && p.base_price === PLACEHOLDER_PRICE && Boolean(p.area_sqft) && p.base_price / p.area_sqft! > PLACEHOLDER_RATE;
}

/** Percentile (0 to 100) with linear interpolation between the nearest ranks. */
export function percentile(xs: number[], q: number): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const i = ((s.length - 1) * q) / 100;
  const lo = Math.floor(i);
  return s[lo]! + (s[Math.min(lo + 1, s.length - 1)]! - s[lo]!) * (i - lo);
}

/** Where most prices sit: the 25th to 75th percentile, or the full range for fewer than 4 prices. */
export function robustRange(xs: number[]): [number, number] | null {
  if (!xs.length) return null;
  if (xs.length < 4) return [Math.min(...xs), Math.max(...xs)];
  return [percentile(xs, 25)!, percentile(xs, 75)!];
}

/** What to show instead of the stand-in price for one home (card, map tag, compare, detail). */
export const PRICE_ON_REQUEST = { en: 'Price on request', hi: 'कीमत पूछने पर' } as const;

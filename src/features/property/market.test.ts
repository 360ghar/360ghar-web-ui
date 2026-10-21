import { describe, expect, it } from 'vitest';
import { isPlaceholderPrice, percentile } from '@/features/search/prices';
import { priceContext } from './market';

let id = 100;
const home = (price: number, area: number, extra: Partial<{ locality: string; property_type: string; purpose: string }> = {}) =>
  ({ id: id++, purpose: 'buy', property_type: 'builder_floor', locality: 'Palam Vihar', base_price: price, area_sqft: area, price_per_sqft: price / area, ...extra }) as never;

describe('price context', () => {
  it('takes the median (50th percentile) of odd and even lists', () => {
    expect(percentile([1, 2, 9], 50)).toBe(2);
    expect(percentile([1, 2, 4, 9], 50)).toBe(3);
  });

  it('spots the ₹10 Cr placeholder price', () => {
    expect(isPlaceholderPrice(home(100_000_000, 1450))).toBe(true);
    // A real ₹10 Cr home of 3,000 sq ft is ₹33,333 per sq ft: not a placeholder.
    expect(isPlaceholderPrice(home(100_000_000, 3000))).toBe(false);
    expect(isPlaceholderPrice(home(18_648_000, 1850))).toBe(false);
  });

  it('compares with the same type in the same locality only', () => {
    const own = home(18_648_000, 1850); // ₹10,080 per sq ft
    const peers = [
      home(15_000_000, 1850), // 8,108
      home(20_000_000, 1850), // 10,811
      home(22_000_000, 1850), // 11,892
      home(24_000_000, 1850), // 12,973
      home(100_000_000, 1920), // placeholder, dropped
      home(9_000_000, 900, { locality: 'Palam Vihar Extension' }), // other locality, dropped
      home(9_000_000, 900, { property_type: 'apartment' }), // other type, dropped
      home(40_000, 1850, { purpose: 'rent' }), // rent, dropped
      own, // itself, dropped
    ];
    const c = priceContext(own, peers)!;
    expect(c.values).toEqual([8108, 10811, 11892, 12973]);
    expect(c).toMatchObject({ own: 10080, min: 8108, max: 12973, median: 11352 });
    // (10080 - 11352) / 11352 = -11.2%
    expect(c.diffPct).toBe(-11);
  });

  it('shows nothing with fewer than three homes, for rentals, or for a placeholder price', () => {
    const own = home(18_648_000, 1850);
    expect(priceContext(own, [home(15_000_000, 1850), home(20_000_000, 1850)])).toBeNull();
    const three = [home(15_000_000, 1850), home(20_000_000, 1850), home(21_000_000, 1850)];
    expect(priceContext(own, three)).not.toBeNull();
    expect(priceContext(home(50_000, 1850, { purpose: 'rent' }), three)).toBeNull();
    expect(priceContext(home(100_000_000, 1450), three)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { isPlaceholderPrice, percentile, robustRange } from './prices';

describe('prices', () => {
  it('spots the ₹10 Cr stand-in price only when the rate is impossible', () => {
    expect(isPlaceholderPrice({ purpose: 'buy', base_price: 1e8, area_sqft: 1560 })).toBe(true);
    expect(isPlaceholderPrice({ purpose: 'buy', base_price: 1e8, area_sqft: 3000 })).toBe(false); // ₹33,333/sq ft: could be real
    expect(isPlaceholderPrice({ purpose: 'buy', base_price: 9.9e7, area_sqft: 1560 })).toBe(false);
    expect(isPlaceholderPrice({ purpose: 'rent', base_price: 1e8, area_sqft: 1560 })).toBe(false);
    expect(isPlaceholderPrice({ purpose: 'buy', base_price: 1e8, area_sqft: null })).toBe(false);
  });

  it('interpolates percentiles', () => {
    expect(percentile([1, 2, 3, 4, 5], 50)).toBe(3);
    expect(percentile([1, 2, 3, 4], 25)).toBe(1.75);
    expect(percentile([7], 90)).toBe(7);
    expect(percentile([], 50)).toBeNull();
  });

  it('gives the middle half, and ignores one extreme price', () => {
    const prices = [1.4e7, 1.8e7, 1.86e7, 1.9e7, 2e7, 2.04e7, 2.3e7, 1e8];
    const [lo, hi] = robustRange(prices)!;
    expect(lo).toBeCloseTo(1.845e7);
    expect(hi).toBeCloseTo(2.105e7);
    expect(robustRange([2e7, 1e7])).toEqual([1e7, 2e7]);
    expect(robustRange([])).toBeNull();
  });
});

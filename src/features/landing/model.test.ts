import { describe, expect, it } from 'vitest';
import { askPrice } from '@/lib/format';
import { amenitySlug, budgetsFor, isIndexable, landingFilters, landingStats, parseBand, parseBhk, parseLanding } from './model';

describe('landing model', () => {
  it('parses canonical landing paths only', () => {
    expect(parseLanding('gurgaon', 'buy', 'flats')?.type).toBe('apartment');
    expect(parseLanding('gurgaon', 'pg', 'flats')?.type).toBe('pg');
    expect(parseLanding('gurgaon', 'pg', 'villa')).toBeNull();
    expect(parseLanding('mumbai', 'buy', 'flats')).toBeNull();
    expect(parseLanding('gurgaon', 'lease', 'flats')).toBeNull();
    expect(parseLanding('gurgaon', 'buy', 'castles')).toBeNull();
  });

  it('builds filters for facets', () => {
    const l = parseLanding('gurgaon', 'rent', 'flats')!;
    expect(landingFilters(l, { kind: 'bhk', bhk: 2 })).toMatchObject({ purpose: 'rent', property_type: ['apartment'], bedrooms_min: 2, bedrooms_max: 2, city: 'Gurgaon' });
    expect(landingFilters(l, { kind: 'bhk', bhk: 4 }).bedrooms_max).toBeUndefined();
    expect(landingFilters(l, { kind: 'budget', key: 'under-20k' }).price_max).toBe(20000);
    expect(landingFilters(parseLanding('gurgaon', 'pg', 'flats')!).purpose).toBe('rent');
  });

  it('keeps the old index rules', () => {
    const buy = parseLanding('gurgaon', 'buy', 'flats')!;
    const pg = parseLanding('gurgaon', 'pg', 'flats')!;
    expect(isIndexable(buy, undefined, 10)).toBe(true);
    expect(isIndexable(buy, undefined, 0)).toBe(false);
    expect(isIndexable(buy, { kind: 'bhk', bhk: 3 }, 5)).toBe(true);
    expect(isIndexable(buy, { kind: 'bhk', bhk: 4 }, 5)).toBe(false);
    expect(isIndexable(pg, { kind: 'bhk', bhk: 1 }, 5)).toBe(false);
    expect(isIndexable(buy, { kind: 'budget', key: 'under-1-crore' }, 5)).toBe(true);
    expect(isIndexable(parseLanding('noida', 'buy', 'flats')!, { kind: 'budget', key: 'under-1-crore' }, 5)).toBe(false);
    expect(isIndexable(buy, { kind: 'amenity', slug: 'gym', title: 'Gym' }, 5)).toBe(false);
  });

  it('gives PG the rent budgets and slugs amenities', () => {
    expect(budgetsFor('pg')).toEqual(['under-10k', 'under-15k', 'under-20k']);
    expect(parseBhk('2-bhk')).toBe(2);
    expect(parseBhk('9-bhk')).toBeNull();
    expect(amenitySlug("Children's Play Area")).toBe('children-s-play-area');
    expect(amenitySlug('24/7 Security')).toBe('24-7-security');
  });
});

describe('landing numbers', () => {
  it('reads the price bands of the context file', () => {
    expect(parseBand('65L-1.2Cr')).toEqual([6.5e6, 1.2e7]);
    expect(parseBand('1.5-3.5Cr')).toEqual([1.5e7, 3.5e7]);
    expect(parseBand('3.5Cr+')).toEqual([3.5e7, null]);
    expect(parseBand('10K-25K/mo')).toEqual([1e4, 2.5e4]);
    expect(parseBand('60K-1.5L/mo')).toEqual([6e4, 1.5e5]);
    expect(parseBand('55K+/mo')).toEqual([5.5e4, null]);
    expect(parseBand('about 2 crore')).toBeNull();
  });

  it('computes live numbers from the listed homes, without the stand-in price', () => {
    const s = landingStats([
      { purpose: 'buy', base_price: 2e7, area_sqft: 2000, price_per_sqft: 10000, locality: 'Palam Vihar' },
      { purpose: 'buy', base_price: 1e7, price_per_sqft: 8000, locality: 'Palam Vihar' }, // the API rate is used as it is
      { purpose: 'buy', base_price: 3e7, area_sqft: 1500, price_per_sqft: 20000, locality: 'Sector 43' },
      { purpose: 'buy', base_price: 1e8, area_sqft: 1500, locality: 'Sector 43' }, // ₹10 Cr stand-in
    ]);
    expect(s).toMatchObject({ count: 4, unpriced: 1, range: [1e7, 3e7], median: 2e7, medianRate: 10000 });
    expect(s.localities[0]).toEqual({ name: 'Palam Vihar', count: 2, prices: [2e7, 1e7] });
    expect(s.localities[1]).toEqual({ name: 'Sector 43', count: 2, prices: [3e7] });
    expect(landingStats([]).median).toBeNull();
    expect(askPrice({ purpose: 'rent', base_price: 1, monthly_rent: 25000 })).toBe(25000);
    // base_price is not a rent or a nightly rate: an empty price field is 0, never base_price.
    expect(askPrice({ purpose: 'rent', base_price: 1, monthly_rent: null })).toBe(0);
    expect(askPrice({ purpose: 'short_stay', base_price: 30000, daily_rate: 1500 })).toBe(1500);
    expect(askPrice({ purpose: 'short_stay', base_price: 30000, daily_rate: null })).toBe(0);
  });
});

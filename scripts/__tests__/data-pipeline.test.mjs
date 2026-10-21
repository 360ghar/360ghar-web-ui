import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRange } from '@/features/data-hub/charts';
import { buildFromRaw, buildLocalitiesIndex } from '../data/build-localities.mjs';
import { formatRange, mergePriceContext, rangesFromListings, robustRange } from '../data/build-price-context.mjs';
import { describeDiff, diffRows } from '../data/lib/diff.mjs';
import { ingest, seedRows } from '../data/ingest-entities.mjs';
import { checkLocalities, checkLocalitiesIndex, checkPriceContext } from '../data/lib/schema.mjs';

const read = (name) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'data', name), 'utf8'));
const fixtures = path.join(process.cwd(), 'scripts', 'data', 'fixtures');

describe('locality pipeline, offline', () => {
  it('rebuilds the current src/data from its own rows without any change', async () => {
    const current = read('localities.json');
    const raw = await ingest({ seed: current });
    const { localities, index, duplicates, unresolved } = buildFromRaw(raw);
    expect(duplicates).toHaveLength(0);
    expect(unresolved).toHaveLength(0);
    expect(diffRows(current, localities, (r) => r.slug).identical).toBe(true);
    expect(localities).toEqual(current);
    expect(index).toEqual(read('localities-index.json'));
    expect(checkLocalities(localities)).toEqual([]);
    expect(checkLocalitiesIndex(index, localities)).toEqual([]);
  });

  it('builds clean, valid rows from the fixture sitemaps', async () => {
    const raw = await ingest({ cities: ['Gurgaon', 'Delhi'], fixtures });
    const { localities, index } = buildFromRaw(raw, { today: '2026-09-29' });
    expect(localities.map((l) => l.slug).sort()).toEqual(['dlf-park-place-park-towers', 'dwarka', 'example-heights', 'godrej-miraya', 'golf-course-road', 'sector-65', 'signature-global-city-92']);
    expect(localities.find((l) => l.slug === 'sector-65')).toMatchObject({ entityType: 'locality', city: 'Gurgaon', lastVerifiedAt: '2026-09-29' });
    expect(localities.find((l) => l.slug === 'example-heights')).toMatchObject({ entityType: 'project', city: 'delhi' });
    expect(checkLocalities(localities)).toEqual([]);
    expect(checkLocalitiesIndex(index, localities)).toEqual([]);
  });

  it('a seed row and a source row for the same place merge into one', async () => {
    const raw = await ingest({ cities: ['Gurgaon'], fixtures, seed: [{ name: 'Golf Course Road', city: 'Gurgaon', entityType: 'locality', lastVerifiedAt: '2026-06-22' }] });
    const { localities } = buildFromRaw(raw);
    const rows = localities.filter((l) => l.slug === 'golf-course-road');
    expect(rows).toHaveLength(1);
    expect(rows[0].lastVerifiedAt).toBe('2026-06-22');
  });

  it('the index is sorted by name and has the six index fields', () => {
    const idx = buildLocalitiesIndex([{ slug: 'b', name: 'B', city: 'Gurgaon', entityType: 'sector', type: 'Sector' }, { slug: 'a', name: 'A', entityType: 'project' }]);
    expect(idx.map((r) => r.slug)).toEqual(['a', 'b']);
    expect(Object.keys(idx[0])).toEqual(['slug', 'name', 'city', 'entityType', 'type', 'lastVerifiedAt']);
  });

  it('seedRows keeps every row of the current file except placeholders', () => {
    expect(seedRows(read('localities.json'))).toHaveLength(3215);
  });
});

describe('diff helper', () => {
  it('counts added, removed and changed rows by field', () => {
    const d = diffRows([{ k: 'a', v: 1 }, { k: 'b', v: 1 }], [{ k: 'b', v: 2 }, { k: 'c', v: 1 }], (r) => r.k);
    expect(d).toMatchObject({ added: ['c'], removed: ['a'], changed: 1, changedFields: { v: 1 }, identical: false });
    expect(describeDiff('x', d)).toContain('added 1, removed 1, changed 1');
    expect(diffRows([{ k: 'a' }], [{ k: 'a' }], (r) => r.k).identical).toBe(true);
    expect(diffRows([{ k: 'a' }, { k: 'b' }], [{ k: 'b' }, { k: 'a' }], (r) => r.k).reordered).toBe(true);
  });
});

describe('price context builder', () => {
  const home = (o) => ({ purpose: 'buy', property_type: 'apartment', base_price: 10_000_000, area_sqft: 1500, ...o });

  it('formats ranges so the data hub charts can read them', () => {
    const cases = [
      [[8_500_000, 35_000_000], false, '85 lakhs - 3.5 crore'],
      [[15_000_000, 60_000_000], false, '1.5 - 6 crore'],
      [[4_000_000, 8_000_000], false, '40 - 80 lakhs'],
      [[15_000, 85_000], true, '15,000 - 85,000/month'],
      [[12_000, 100_000], true, '12,000 - 1 lakh/month'],
      [[150_000, 500_000], true, '1.5 - 5 lakh/month'],
    ];
    for (const [range, rent, text] of cases) {
      expect(formatRange(range, rent)).toBe(text);
      expect(parseRange(text)).toEqual(range);
    }
  });

  it('uses the middle half of prices and skips the 10 Cr stand-in and short stays', () => {
    const items = [
      ...[4, 5, 6, 7, 8, 9, 10].map((c) => home({ base_price: c * 1_000_000 })),
      home({ base_price: 100_000_000, area_sqft: 1500 }),
      home({ purpose: 'short_stay', base_price: 999 }),
      home({ property_type: 'flatmate', base_price: 1 }),
    ];
    const { ranges, samples } = rangesFromListings(items, 'buy');
    expect(samples).toEqual({ apartment: 7 });
    expect(ranges.apartment).toBe('55 - 85 lakhs');
    expect(robustRange([3, 1])).toEqual([1, 3]);
  });

  it('uses the monthly rent for rent listings and writes /month', () => {
    const items = [15, 20, 25, 30].map((k) => home({ purpose: 'rent', base_price: 1, monthly_rent: k * 1000 }));
    expect(rangesFromListings(items, 'rent').ranges.apartment).toBe('19,000 - 26,000/month');
  });

  it('does not take base_price for a rent with no monthly rent', () => {
    const items = [15, 20, 25, 30].map((k) => home({ purpose: 'rent', base_price: k * 1000, monthly_rent: null }));
    const { ranges, samples } = rangesFromListings(items, 'rent');
    expect(samples).toEqual({});
    expect(ranges).toEqual({});
  });

  it('keeps curated values when there are too few listings, and fills the gaps', () => {
    const overrides = read('priceContext.json');
    const few = [home({}), home({}), home({})];
    const { generated, report } = mergePriceContext(overrides, { 'gurgaon/buy': few });
    expect(generated).toEqual(overrides);
    expect(report.changed).toEqual([]);
    const many = Array.from({ length: 6 }, (_, i) => home({ property_type: 'studio', base_price: (2 + i) * 1_000_000 }));
    const merged = mergePriceContext(overrides, { 'gurgaon/buy': many });
    expect(merged.generated.gurgaon.buy.studio).not.toBe(overrides.gurgaon.buy.studio);
    expect(merged.generated.gurgaon.buy.default).toBe(overrides.gurgaon.buy.default);
    expect(merged.generated.gurgaon.pg).toEqual(overrides.gurgaon.pg);
    expect(checkPriceContext(merged.generated, parseRange)).toEqual([]);
    expect(merged.report.changed).toHaveLength(1);
  });
});

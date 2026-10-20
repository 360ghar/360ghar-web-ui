import { describe, expect, it } from 'vitest';
import { auctionPath, builderPath, circlePath, detailEntries, zonePath } from './sitemap';

describe('data hub sitemap paths', () => {
  it('keeps only slugs and ids the detail routes render', () => {
    expect(circlePath('gurugram-sector-45-residential')).toBe('/circle-rate/gurugram-sector-45-residential');
    expect(circlePath('Gurugram-Sector-45')).toBeNull(); // upper case gets a 301
    expect(circlePath('a/b')).toBeNull();
    expect(circlePath(null)).toBeNull();
    expect(zonePath('gurugram-sector-9a-residential')).toBe('/zone-checker/gurugram-sector-9a-residential');
    expect(builderPath('')).toBeNull();
    expect(auctionPath(61)).toBe('/bank-auctions/61');
    expect(auctionPath('61x')).toBeNull();
    expect(auctionPath(undefined)).toBeNull();
    expect(auctionPath(61, 'court')).toBe('/bank-auctions/court/61');
  });

  it('drops invalid and repeated paths', () => {
    const rows = [
      { id: 61, updated_at: '2026-06-22T06:45:31Z' },
      { id: 61, updated_at: null },
      { id: -1, updated_at: null },
      { id: 31, updated_at: null },
    ];
    expect(detailEntries(rows, (r) => auctionPath(r.id), (r) => r.updated_at, 'daily', '0.7')).toEqual([
      { path: '/bank-auctions/61', lastmod: '2026-06-22T06:45:31Z', changefreq: 'daily', priority: '0.7' },
      { path: '/bank-auctions/31', lastmod: null, changefreq: 'daily', priority: '0.7' },
    ]);
  });
});

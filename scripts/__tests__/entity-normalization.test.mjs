import { describe, expect, it } from 'vitest';
import zlib from 'node:zlib';
import { buildCanonicalId, cityLabel, mergeEntityRecords, normalizeName, slugifyEntity } from '../data/lib/entities.mjs';
import { decodeNameFromUrl, detectCity, fixtureName, ingest, isPlaceholderName, isSearchResultName, rowsFromSitemap, seedRows, SOURCE_URLS, sitemapText } from '../data/ingest-entities.mjs';

// Ported from the old site's scripts/__tests__/entity-normalization.test.mjs.
describe('entity normalisation', () => {
  it('normalizeName standardizes whitespace and city token variants', () => {
    expect(normalizeName('  DLF   Phase 1, Gurugram ')).toBe('dlf phase 1 gurgaon');
  });

  it('slugifyEntity strips punctuation and keeps a deterministic slug', () => {
    expect(slugifyEntity('DLF Phase 1')).toBe('dlf-phase-1');
    expect(slugifyEntity('Tulip & Co')).toBe('tulip-and-co');
  });

  it('buildCanonicalId is stable and scoped by city+type+slug', () => {
    expect(buildCanonicalId({ city: 'Gurgaon', entityType: 'Society', slug: 'dlf-camellias' })).toBe('gurgaon::society::dlf-camellias');
  });

  it('mergeEntityRecords merges aliases and source coverage without duplicates', () => {
    const merged = mergeEntityRecords([
      { name: 'DLF Camellias', city: 'Gurgaon', entityType: 'Society', aliases: ['The Camellias'], sourceCoverage: ['hrera'], sourceUrls: ['https://example.com/a'], confidence: 0.7 },
      { name: 'DLF The Camellias', city: 'Gurgaon', entityType: 'Society', aliases: ['DLF Camellias'], sourceCoverage: ['magicbricks'], sourceUrls: ['https://example.com/b'], confidence: 0.9 },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].slug).toBe('dlf-camellias');
    expect([...merged[0].sourceCoverage].sort()).toEqual(['hrera', 'magicbricks']);
    expect(merged[0].aliases).toContain('The Camellias');
    expect(merged[0].aliases).toContain('DLF The Camellias');
    expect(merged[0].confidence).toBe(0.9);
  });

  it('resolves slug collisions across entity types', () => {
    const merged = mergeEntityRecords([
      { name: 'Cyber City', city: 'Gurgaon', entityType: 'Locality', sourceCoverage: ['a'] },
      { name: 'Cyber City', city: 'Gurgaon', entityType: 'Commercial', sourceCoverage: ['b'] },
    ]);
    const slugs = merged.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('gives three entities with one name three slugs', () => {
    const merged = mergeEntityRecords([
      { name: 'Green Park', city: 'Gurgaon', entityType: 'locality', sourceCoverage: ['a'] },
      { name: 'Green Park', city: 'Gurgaon', entityType: 'society', sourceCoverage: ['b'] },
      { name: 'Green Park', city: 'Gurgaon', entityType: 'apartment', sourceCoverage: ['c'] },
    ]);
    const slugs = merged.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(3);
    expect(slugs).toContain('green-park');
    expect(slugs).toContain('green-park-society');
    expect(slugs).toContain('green-park-apartment');
  });
});

describe('merge output (v2 changes)', () => {
  it('uses the city of the row in copy and in the canonical url', () => {
    const [row] = mergeEntityRecords([{ name: 'Dwarka', city: 'Delhi', entityType: 'locality' }], { today: '2026-01-01' });
    expect(row.city).toBe('delhi');
    expect(row.canonicalUrl).toBe('/locality/dwarka-delhi');
    expect(row.seo.title).toBe('Dwarka Delhi | properties | 360Ghar');
    expect(row.seo.keywords).toBe('Dwarka Delhi, Dwarka properties, Dwarka real estate');
    expect(row.description).toContain('Dwarka, Delhi.');
    expect(row.contentBlocks.overview).toContain('in Delhi');
    expect(row.lastVerifiedAt).toBe('2026-01-01');
  });

  it('keeps the old Gurgaon copy exactly', () => {
    const [row] = mergeEntityRecords([{ name: 'Sector 57', entityType: 'sector', lastVerifiedAt: '2026-06-22' }]);
    expect(row.city).toBe('Gurgaon');
    expect(row.seo.title).toBe('Sector 57 Gurgaon | properties | 360Ghar');
    expect(row.seo.keywords).toBe('Sector 57 Gurgaon, Sector 57 Gurugram, Sector 57 properties, Sector 57 real estate');
    expect(row.canonicalUrl).toBe('/locality/sector-57-gurgaon');
    expect(row.type).toBe('Sector');
  });

  it('cityLabel names all five cities', () => {
    expect(['gurugram', 'delhi', 'noida', 'faridabad', 'ghaziabad'].map(cityLabel)).toEqual(['Gurgaon', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad']);
  });
});

describe('ingest', () => {
  it('reads the project name from commonfloor povp urls', () => {
    const url = 'https://www.commonfloor.com/dlf-park-place-park-towers-gurgaon/povp-01y6f0';
    expect(decodeNameFromUrl(url, { source: 'commonfloor' })).toBe('dlf park place park towers');
  });

  it('drops the "projects in" prefix of squareyards pages', () => {
    expect(decodeNameFromUrl('https://www.squareyards.com/projects-in-golf-course-road-gurgaon', { source: 'squareyards' })).toBe('golf course road');
  });

  it('identifies placeholders and search-result names', () => {
    expect(isPlaceholderName('povp 01y6f0')).toBe(true);
    expect(isPlaceholderName('dlf park place')).toBe(false);
    expect(isSearchResultName('2bhk flats for sale in dlf cyber city sector 24 gurgaon prjtl')).toBe(true);
    expect(isSearchResultName('villas projects sector 57 in gurgaon nprid')).toBe(true);
    expect(isSearchResultName('godrej miraya')).toBe(false);
  });

  it('detects the city of a url', () => {
    expect(detectCity('https://x.com/a-gurugram')).toBe('Gurgaon');
    expect(detectCity('https://x.com/a-greater-noida')).toBe('Noida');
    expect(detectCity('https://x.com/a-pune')).toBeNull();
  });

  it('reads sitemap rows for the wanted cities only', () => {
    const xml = '<urlset><url><loc>https://www.commonfloor.com/godrej-miraya-gurgaon/povp-g42vq2</loc></url><url><loc>https://www.commonfloor.com/x-heights-noida/povp-abc123</loc></url><url><loc>https://www.commonfloor.com/povp-abc123</loc></url></urlset>';
    const rows = rowsFromSitemap(xml, { source: 'commonfloor', type: 'project' }, ['Gurgaon']);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'godrej miraya', city: 'Gurgaon', entityType: 'project', sourceCoverage: ['commonfloor'] });
  });

  it('gunzips sitemaps, also when the download was cut off', () => {
    const xml = `<urlset>${'<url><loc>https://www.commonfloor.com/aa-bb-gurgaon/povp-x</loc></url>'.repeat(2000)}</urlset>`;
    const gz = zlib.gzipSync(xml);
    expect(sitemapText(gz)).toBe(xml);
    const cut = sitemapText(gz.subarray(0, Math.floor(gz.length / 2)));
    expect(cut.length).toBeGreaterThan(0);
    expect(cut.length).toBeLessThan(xml.length);
    expect(sitemapText(Buffer.from('<a/>'))).toBe('<a/>');
  });

  it('keeps the verification date of seed rows', () => {
    const [row] = seedRows([{ name: 'Sector 5', city: 'Gurgaon', entityType: 'sector', lastVerifiedAt: '2026-06-22' }, { name: 'povp abc123' }]);
    expect(row).toMatchObject({ sourceCoverage: ['legacy-localities-json'], confidence: 0.6, lastVerifiedAt: '2026-06-22' });
  });

  it('runs offline by default: the seed only, no fetch', async () => {
    const fetchImpl = () => {
      throw new Error('network used');
    };
    const raw = await ingest({ seed: [{ name: 'Sector 5', entityType: 'sector' }], fetchImpl });
    expect(raw).toHaveLength(1);
  });

  it('live mode calls each source once, sequentially, and survives a failing source', async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push(url);
      expect(init.method).toBe('GET');
      if (url.includes('commonfloor')) return { ok: false, status: 403 };
      const body = Buffer.from('<urlset><url><loc>https://www.squareyards.com/projects-in-sector-65-gurgaon</loc></url></urlset>');
      return { ok: true, body: (async function* () { yield body; })() };
    };
    const log = [];
    const raw = await ingest({ live: true, cache: false, delayMs: 0, fetchImpl, log: (l) => log.push(l) });
    // Default sources are the squareyards and commonfloor ones for Gurgaon.
    expect(calls).toHaveLength(SOURCE_URLS.filter((s) => !s.off && (!s.city || s.city === 'Gurgaon')).length);
    expect(raw.filter((r) => r.name === 'sector 65')).toHaveLength(2);
    expect(log.some((l) => l.includes('403'))).toBe(true);
  });

  it('names fixture files like the last part of the url', () => {
    expect(fixtureName({ url: 'https://www.nobroker.in/sitemap/new-projects-gurgaon.xml.gz' })).toBe('new-projects-gurgaon.xml');
  });
});

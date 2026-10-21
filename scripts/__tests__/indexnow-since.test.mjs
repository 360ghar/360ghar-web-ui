import { describe, expect, it } from 'vitest';
import { urlsFromSitemapIndex } from '../lib/indexnow.mjs';

const files = {
  'https://x.test/sitemap.xml': '<sitemapindex><sitemap><loc>https://x.test/a.xml</loc></sitemap></sitemapindex>',
  'https://x.test/a.xml': '<urlset><url><loc>https://x.test/new</loc><lastmod>2026-10-22T01:00:00Z</lastmod></url><url><loc>https://x.test/old</loc><lastmod>2026-01-01</lastmod></url><url><loc>https://x.test/dateonly</loc><lastmod>2026-10-21</lastmod></url><url><loc>https://x.test/none</loc></url></urlset>',
};
const fetchImpl = async (u) => ({ ok: true, text: async () => files[u] });

describe('urlsFromSitemapIndex', () => {
  it('returns every URL without a time filter', async () => {
    expect(await urlsFromSitemapIndex('https://x.test', fetchImpl)).toEqual(['https://x.test/new', 'https://x.test/old', 'https://x.test/dateonly', 'https://x.test/none']);
  });
  it('keeps only URLs changed since the given time', async () => {
    expect(await urlsFromSitemapIndex('https://x.test', fetchImpl, { sinceMs: Date.parse('2026-10-21T20:00:00Z') })).toEqual(['https://x.test/new', 'https://x.test/dateonly']);
  });
});

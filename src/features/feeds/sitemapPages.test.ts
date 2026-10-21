import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const many = Array.from({ length: 50_000 }, (_, i) => ({ path: `/locality/p-${i}` }));
vi.mock('./data', () => ({
  staticEntries: () => [{ path: '/' }],
  landingEntries: async () => [],
  localityEntries: () => many,
  projectEntries: () => [],
  allPosts: async () => {
    throw new Error('backend down');
  },
  allProperties: async () => [],
}));
vi.mock('@/features/data-hub/sitemap', () => ({ datahubEntries: async () => [] }));

const { parseSitemapName, sitemapFileNames, SITEMAPS } = await import('./sitemaps');
const { urlsetPages } = await import('./xml');

describe('sitemap index with paging', () => {
  it('lists extra pages for a long list, one page for the rest, and one for a list that fails', async () => {
    const names = await sitemapFileNames();
    expect(names).toEqual([
      'sitemap-static.xml',
      'sitemap-landing.xml',
      'sitemap-localities.xml',
      'sitemap-localities-2.xml',
      'sitemap-localities-3.xml',
      'sitemap-datahub.xml',
      'sitemap-blog.xml',
      'sitemap-projects.xml',
      'sitemap-properties.xml',
    ]);
  });

  it('serves every listed page and keeps each under the URL limit', async () => {
    const pages = urlsetPages(await SITEMAPS.localities!());
    expect(pages).toHaveLength(3);
    for (const p of pages) expect((p.match(/<url>/g) ?? []).length).toBeLessThanOrEqual(45_000);
    expect(pages.reduce((n, p) => n + (p.match(/<url>/g) ?? []).length, 0)).toBe(100_000);
  });
});

describe('robots.txt and the sitemap index cannot drift apart', () => {
  const robots = readFileSync('public/robots.txt', 'utf8');
  const robotsLines = [...robots.matchAll(/^Sitemap: (\S+)$/gm)].map((m) => m[1]!);
  const file = (url: string) => url.replace('https://360ghar.com/', '');

  it('robots.txt lists the index and one line per sitemap, and nothing else', () => {
    expect(robotsLines).toEqual(['https://360ghar.com/sitemap.xml', ...Object.keys(SITEMAPS).map((n) => `https://360ghar.com/sitemap-${n}.xml`)]);
  });

  it('the index lists exactly the robots.txt sitemaps (page 1 of each) plus their numbered pages 2, 3, ...', async () => {
    const index = await sitemapFileNames();
    const robotsFiles = robotsLines.map(file).filter((f) => f !== 'sitemap.xml');
    const firstPages = index.filter((f) => !/-\d+\.xml$/.test(f));
    expect(firstPages).toEqual(robotsFiles);
    // Every other entry is <robots entry>-N.xml with N counting up from 2 and no gap.
    for (const base of robotsFiles) {
      const stem = base.replace(/\.xml$/, '');
      const pages = index.filter((f) => f.startsWith(`${stem}-`)).map((f) => Number(/-(\d+)\.xml$/.exec(f)![1]));
      expect(pages, base).toEqual(pages.map((_, i) => i + 2));
    }
    expect(index.every((f) => robotsFiles.some((b) => f === b || f.startsWith(`${b.replace(/\.xml$/, '')}-`)))).toBe(true);
  });

  it('every index entry is a name the sitemap route serves', async () => {
    for (const f of await sitemapFileNames()) {
      expect(parseSitemapName(f.replace(/^sitemap-/, '').replace(/\.xml$/, '')), f).not.toBeNull();
    }
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Property } from '@/lib/api/types';
import { parseLanding } from '@/features/landing/model';
import { ALL_LOCALITIES, isThinLocality, localitySlug, resolveLocality } from '@/features/localities/data';
import { resolveRoute } from '@/lib/seo/routes';
import { landingCount, localityEntries, projectEntries, staticEntries } from './data';
import { parseSitemapName, SITEMAPS } from './sitemaps';
import { rss, SITEMAP_MAX_BYTES, SITEMAP_MAX_URLS, urlset, urlsetPages, type SitemapEntry } from './xml';

/** Pages that render noindex (login, account, tools that carry no content, duplicates). None may be in a sitemap. */
const NOINDEX_PATHS = ['/account', '/login', '/register', '/forgot-password', '/reset-password', '/add-phone', '/profile-completion', '/post-property', '/compare', '/delete-account', '/map-location', '/styleguide', '/property-sidebar', '/add-new-listing'];

/** <url> blocks of a urlset as { loc, alternates }. */
function parse(xml: string) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: /<loc>(.*?)<\/loc>/.exec(m[1]!)![1]!,
    alternates: Object.fromEntries([...m[1]!.matchAll(/hreflang="([\w-]+)" href="(.*?)"/g)].map((a) => [a[1]!, a[2]!])),
  }));
}

describe('urlset', () => {
  it('lists the English and Hindi URL with alternates and escapes', () => {
    const xml = urlset([{ path: '/blog?a=1&b=2', lastmod: '2026-06-21T21:37:47Z', priority: '0.7' }, { path: '/' }]);
    expect(xml).toContain('<loc>https://360ghar.com/blog?a=1&amp;b=2</loc>');
    expect(xml).toContain('<loc>https://360ghar.com/hi/blog?a=1&amp;b=2</loc>');
    expect(xml).toContain('<loc>https://360ghar.com/hi</loc>');
    expect(xml).toContain('<lastmod>2026-06-21</lastmod>');
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(4);
  });
});

describe('rss', () => {
  it('escapes text and leaves out a bad date', () => {
    const xml = rss({ title: 'A & B', description: '<d>', self: '/rss.xml', language: 'en-in' }, [{ title: 'T <1>', link: 'https://360ghar.com/x', date: 'nope' }]);
    expect(xml).toContain('<title>A &amp; B</title>');
    expect(xml).toContain('<title>T &lt;1&gt;</title>');
    expect(xml).not.toContain('<pubDate>');
  });
});

describe('landingCount', () => {
  const home = (x: Partial<Property>) => ({ city: 'Gurugram', purpose: 'buy', property_type: 'apartment', bedrooms: 2, base_price: 6_000_000, ...x }) as Property;
  const homes = [home({}), home({ bedrooms: 3, base_price: 12_000_000 }), home({ purpose: 'rent', base_price: 30_000 }), home({ city: 'New Delhi' })];
  it('matches the backend rules for city aliases, purpose, BHK and budget', () => {
    const flats = parseLanding('gurgaon', 'buy', 'flats')!;
    expect(landingCount(homes, flats)).toBe(2);
    expect(landingCount(homes, flats, { kind: 'bhk', bhk: 3 })).toBe(1);
    expect(landingCount(homes, flats, { kind: 'budget', key: 'under-80-lakhs' })).toBe(1);
    expect(landingCount(homes, parseLanding('delhi', 'buy', 'flats')!)).toBe(1);
    expect(landingCount(homes, parseLanding('gurgaon', 'rent', 'villa')!)).toBe(0);
  });
});

describe('sitemaps', () => {
  it('are the same list in public/robots.txt', () => {
    const listed = [...readFileSync('public/robots.txt', 'utf8').matchAll(/^Sitemap: https:\/\/360ghar\.com\/sitemap-(\w+)\.xml$/gm)].map((m) => m[1]);
    expect(listed).toEqual(Object.keys(SITEMAPS));
  });
});

describe('sitemap hreflang', () => {
  const sample: SitemapEntry[] = [{ path: '/' }, { path: '/blog' }, { path: '/locality/dlf-phase-1-gurgaon/buy', lastmod: '2026-01-02' }];
  const urls = parse(urlset(sample));

  it('declares the xhtml namespace and lists every path in English and Hindi', () => {
    expect(urlset(sample)).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(urls.map((u) => u.loc)).toEqual([
      'https://360ghar.com/', 'https://360ghar.com/hi',
      'https://360ghar.com/blog', 'https://360ghar.com/hi/blog',
      'https://360ghar.com/locality/dlf-phase-1-gurgaon/buy', 'https://360ghar.com/hi/locality/dlf-phase-1-gurgaon/buy',
    ]);
  });

  it('gives en, hi and x-default to every URL, and x-default is the English URL', () => {
    for (const u of urls) {
      expect(Object.keys(u.alternates).sort()).toEqual(['en', 'hi', 'x-default']);
      expect(u.alternates['x-default']).toBe(u.alternates.en);
    }
  });

  it('is reciprocal: each alternate is itself a listed URL that lists the same set', () => {
    const byLoc = new Map(urls.map((u) => [u.loc, u]));
    for (const u of urls) {
      for (const href of Object.values(u.alternates)) {
        const other = byLoc.get(href);
        expect(other, `${href} is listed`).toBeDefined();
        expect(other!.alternates).toEqual(u.alternates);
      }
    }
  });

  it('is reciprocal in a real sitemap (localities)', () => {
    const real = parse(urlsetPages(localityEntries())[0]!);
    const byLoc = new Map(real.map((u) => [u.loc, u]));
    for (const u of real) expect(byLoc.get(u.alternates.hi!)?.alternates).toEqual(u.alternates);
  });
});

describe('localities sitemap leaves out thin rows (owner decision 2026-09-29)', () => {
  const entries = localityEntries();
  const paths = new Set(entries.map((e) => e.path));

  it('lists no scraped or seed-invented page, in either the base or the buy and rent form', () => {
    for (const p of paths) {
      const slug = p.split('/')[2]!;
      const l = resolveLocality(slug)!.locality;
      expect(isThinLocality(l), p).toBe(false);
    }
  });

  it('lists every other row, so the counts are exact', () => {
    const listed = ALL_LOCALITIES.filter((l) => !isThinLocality(l));
    expect(listed).toHaveLength(2043);
    for (const l of listed) expect(paths.has(`/locality/${localitySlug(l)}`), l.name).toBe(true);
    // 9,555 paths before; 3,516 of them belonged to the 1,172 thin rows.
    expect(entries.length).toBe(6039);
    expect(entries.length + 3516).toBe(9555);
    expect(new Set(entries.map((e) => e.path.split('/')[2])).size).toBe(listed.length);
  });
});

describe('sitemap URL rules', () => {
  const offline: Record<string, SitemapEntry[]> = { static: staticEntries(), localities: localityEntries(), projects: projectEntries() };

  it('uses canonical paths: lower case, starts with /, no trailing slash, no query, no /hi', () => {
    for (const [name, entries] of Object.entries(offline)) {
      for (const e of entries) {
        expect(e.path, `${name} ${e.path}`).toMatch(/^\/[a-z0-9%\-_./]*$/);
        if (e.path !== '/') expect(e.path.endsWith('/'), e.path).toBe(false);
        expect(e.path.startsWith('/hi/') || e.path === '/hi', e.path).toBe(false);
      }
    }
  });

  it('lists no path twice within a sitemap', () => {
    for (const [name, entries] of Object.entries(offline)) {
      const paths = entries.map((e) => e.path);
      expect(new Set(paths).size, name).toBe(paths.length);
    }
  });

  it('lists no noindex page and no removed duplicate route', () => {
    for (const entries of Object.values(offline)) for (const e of entries) expect(NOINDEX_PATHS, e.path).not.toContain(e.path);
  });

  it('lists only fixed pages that exist and do not set noindex', () => {
    for (const e of staticEntries()) {
      const route = resolveRoute(e.path);
      expect(route, `${e.path} has a route`).not.toBeNull();
      const source = readFileSync(`src/pages/${route!.file}`, 'utf8');
      expect(/\bnoindex\b(?!=\{)/.test(source), `${e.path} (${route!.file}) sets noindex`).toBe(false);
    }
  });
});

describe('sitemap size', () => {
  it('keeps the localities sitemap in one file under 50,000 URLs and 50 MB', () => {
    const pages = urlsetPages(localityEntries());
    for (const xml of pages) {
      expect(parse(xml).length).toBeLessThanOrEqual(50_000);
      expect(Buffer.byteLength(xml)).toBeLessThanOrEqual(50 * 1024 * 1024);
    }
    expect(SITEMAP_MAX_URLS).toBeLessThan(50_000);
    expect(SITEMAP_MAX_BYTES).toBeLessThan(50 * 1024 * 1024);
  });

  it('splits a long list into pages that keep an English URL and its Hindi URL together', () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ path: `/p/${i}` }));
    const pages = urlsetPages(many, 10); // 10 URLs per file = 5 paths
    expect(pages).toHaveLength(3);
    const counts = pages.map((p) => parse(p).length);
    expect(counts).toEqual([10, 10, 2]);
    for (const p of pages) {
      const locs = parse(p).map((u) => u.loc);
      for (const l of locs.filter((x) => !x.includes('/hi/'))) expect(locs).toContain(l.replace('/p/', '/hi/p/'));
    }
  });

  it('splits by bytes too', () => {
    const pages = urlsetPages([{ path: '/a' }, { path: '/b' }, { path: '/c' }], 1000, 1200);
    expect(pages.length).toBeGreaterThan(1);
    for (const p of pages) expect(Buffer.byteLength(p)).toBeLessThanOrEqual(1200 + 100);
  });

  it('returns one empty urlset for no entries', () => {
    expect(urlsetPages([])).toHaveLength(1);
  });
});

describe('sitemap names', () => {
  it('parses page names: the plain name is page 1, -2 and up are more pages, -1 is not a page', () => {
    expect(parseSitemapName('localities')).toEqual({ name: 'localities', page: 1 });
    expect(parseSitemapName('properties-3')).toEqual({ name: 'properties', page: 3 });
    expect(parseSitemapName('properties-1')).toBeNull();
    expect(parseSitemapName('nope')).toBeNull();
    expect(parseSitemapName('nope-2')).toBeNull();
    expect(parseSitemapName('constructor')).toBeNull();
    expect(parseSitemapName(undefined)).toBeNull();
  });

  it('are in robots.txt with their index: the base names match and the index itself is listed', () => {
    const robots = readFileSync('public/robots.txt', 'utf8');
    expect(robots).toContain('Sitemap: https://360ghar.com/sitemap.xml');
    for (const n of Object.keys(SITEMAPS)) expect(robots).toContain(`Sitemap: https://360ghar.com/sitemap-${n}.xml`);
  });
});

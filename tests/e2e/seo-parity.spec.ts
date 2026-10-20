/**
 * SEO parity: legacy redirects, sitemap shape, site-wide JSON-LD and the AI-discovery files.
 * These tests use HTTP requests only, so they run once (desktop project). Write-only for the agent
 * that added it: the QA phase runs it against the dev server.
 */
import { expect, test } from '@playwright/test';

test.beforeEach(({ browserName: _browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'HTTP-only checks run once');
});

const SITE = 'https://360ghar.com';
/** Sitemaps and files name the production host; the dev server answers on baseURL. */
const local = (url: string) => {
  const u = new URL(url);
  return u.pathname + u.search;
};

test.describe('legacy redirects', () => {
  const cases: [string, string][] = [
    ['/property-sidebar', '/properties'],
    ['/add-new-listing', '/post-property'],
    ['/hi/property-sidebar', '/hi/properties'],
    ['/hi/add-new-listing', '/hi/post-property'],
    ['/property-sidebar?city=gurgaon&bhk=2', '/properties?city=gurgaon&bhk=2'],
    ['/hi/add-new-listing?ref=old', '/hi/post-property?ref=old'],
    ['/gurugram/buy/apartments', '/gurgaon/buy/flats'],
    ['/About-Us', '/about-us'],
  ];
  for (const [from, to] of cases) {
    test(`${from} answers 301 to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(301);
      const location = res.headers().location ?? '';
      expect(local(new URL(location, 'http://x').href)).toBe(to);
    });
  }

  test('the targets answer 200 with no redirect', async ({ request }) => {
    for (const path of ['/properties', '/post-property', '/hi/properties', '/hi/post-property']) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200);
    }
  });

  test('an unknown page answers 404, not a redirect', async ({ request }) => {
    expect((await request.get('/this-page-does-not-exist', { maxRedirects: 0 })).status()).toBe(404);
  });
});

test.describe('sitemaps', () => {
  test('robots.txt lists the index and every sitemap; the index lists the same base names', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    const listed = [...robots.matchAll(/^Sitemap: (\S+)$/gm)].map((m) => m[1]!);
    expect(listed).toContain(`${SITE}/sitemap.xml`);
    const index = await (await request.get('/sitemap.xml')).text();
    expect(index).toContain('<sitemapindex');
    const files = [...index.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]!);
    for (const url of listed.filter((u) => u !== `${SITE}/sitemap.xml`)) expect(files, url).toContain(url);
  });

  test('every sitemap in the index answers 200 with hreflang alternates, canonical paths and no noindex page', async ({ request }) => {
    test.setTimeout(180_000);
    const index = await (await request.get('/sitemap.xml')).text();
    const files = [...index.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]!);
    expect(files.length).toBeGreaterThanOrEqual(7);
    for (const file of files) {
      const res = await request.get(local(file));
      // A list that depends on the API may answer 503 when the backend is down: that is allowed here, but never a 404.
      expect([200, 503], file).toContain(res.status());
      if (res.status() !== 200) continue;
      const xml = await res.text();
      expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
      const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
        loc: /<loc>(.*?)<\/loc>/.exec(m[1]!)![1]!,
        alts: Object.fromEntries([...m[1]!.matchAll(/hreflang="([\w-]+)" href="(.*?)"/g)].map((a) => [a[1]!, a[2]!])),
      }));
      expect(urls.length, file).toBeLessThanOrEqual(50_000);
      expect(Buffer.byteLength(xml), file).toBeLessThanOrEqual(50 * 1024 * 1024);
      const locs = new Set(urls.map((u) => u.loc));
      for (const u of urls.slice(0, 500)) {
        expect(Object.keys(u.alts).sort(), u.loc).toEqual(['en', 'hi', 'x-default']);
        expect(locs.has(u.alts.en!) && locs.has(u.alts.hi!), `${u.loc} alternates are listed`).toBe(true);
        const path = new URL(u.loc).pathname;
        expect(path === '/' || !path.endsWith('/'), `${u.loc} has no trailing slash`).toBe(true);
        expect(path.replace(/^\/hi/, '') || '/', u.loc).not.toMatch(/^\/(account|login|register|post-property|compare|property-sidebar|add-new-listing)$/);
      }
    }
  });

  test('the static sitemap lists /hi/emi-calculator and not the removed routes', async ({ request }) => {
    const xml = await (await request.get('/sitemap-static.xml')).text();
    expect(xml).toContain(`<loc>${SITE}/hi/emi-calculator</loc>`);
    expect(xml).not.toContain('property-sidebar');
    expect(xml).not.toContain('add-new-listing');
  });

  test('a paged name that does not exist answers 404', async ({ request }) => {
    expect((await request.get('/sitemap-static-1.xml')).status()).toBe(404);
    expect((await request.get('/sitemap-static-99.xml')).status()).toBe(404);
    expect((await request.get('/sitemap-nope.xml')).status()).toBe(404);
  });
});

test.describe('site-wide JSON-LD', () => {
  test('the home page carries Organization, WebSite, LocalBusiness, Person and MobileApplication, all valid JSON', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]!.replace(/\\u003c/g, '<')) as { '@type': string | string[]; '@context'?: string });
    const types = blocks.flatMap((b) => (Array.isArray(b['@type']) ? b['@type'] : [b['@type']]));
    for (const t of ['Organization', 'WebSite', 'LocalBusiness', 'Person', 'MobileApplication']) expect(types, t).toContain(t);
    expect(types).not.toContain('KnowledgePanel');
    expect(types, 'Speakable stands only inside WebPage').not.toContain('SpeakableSpecification');
    for (const b of blocks) expect(b['@context']).toBe('https://schema.org');
    const app = blocks.find((b) => b['@type'] === 'MobileApplication') as unknown as { downloadUrl: string };
    expect(app.downloadUrl).toMatch(/^https:\/\/play\.google\.com\/store\/apps\/details\?id=/);
  });
});

test.describe('AI discovery files', () => {
  test('llms.txt, llms-full.txt, llm-feed.json and ai.txt answer 200', async ({ request }) => {
    for (const path of ['/llms.txt', '/llms-full.txt', '/.well-known/ai.txt', '/.well-known/api-catalog']) expect((await request.get(path)).status(), path).toBe(200);
    const feed = await (await request.get('/data/llm-feed.json')).json();
    expect(feed.important_pages.length).toBeGreaterThan(20);
  });

  test('every 360ghar.com URL in llms.txt answers 200 with no redirect', async ({ request }) => {
    test.setTimeout(300_000);
    const text = await (await request.get('/llms.txt')).text();
    const urls = [...new Set([...text.matchAll(/https:\/\/360ghar\.com[^\s)]*/g)].map((m) => m[0]))];
    expect(urls.length).toBeGreaterThan(40);
    const bad: string[] = [];
    for (const url of urls) {
      const res = await request.get(local(url), { maxRedirects: 0 });
      if (res.status() !== 200) bad.push(`${url} -> ${res.status()}`);
    }
    expect(bad).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COMPETITORS } from '@/features/content/compare/competitors';
import { STATIC_PATHS, staticEntries } from '@/features/feeds/data';
import { resolveRoute } from '@/lib/seo/routes';
import { faqPage } from '@/lib/seo/site';
import { BEST_PAGES, CHECKED_ON, PUBLISHER_LINE, bestPage, itemList } from './bestPages';
import { BEST_PATHS } from './paths';

const competitorFor = (href: string) => COMPETITORS.find((c) => href === `/vs/${c.slug}`);

describe('best-X pages', () => {
  it.each(BEST_PAGES.map((page) => [page.path, page] as const))('%s has the exact term in the title and the H1', (path, page) => {
    expect(page.title.startsWith(page.term)).toBe(true);
    expect(page.term).toMatch(/^Best .+ in (India|Gurgaon)$|^Best AI real estate platforms$/);
    // The layout renders the term as the H1 (heading={page.term}).
    expect(readFileSync(new URL('./BestPage.astro', import.meta.url), 'utf8')).toContain('heading={page.term}');
    expect(resolveRoute(path, { fixed: true })?.file).toBe(`${path.slice(1)}.astro`);
  });

  it.each(BEST_PAGES.map((page) => [page.path, page] as const))('%s is rendered from its own record by its route file', (path) => {
    const route = readFileSync(new URL(`../../../pages${path}.astro`, import.meta.url), 'utf8');
    expect(route).toContain(`bestPage('${path}')`);
    expect(route).toContain('<BestPage page={page} />');
  });

  it.each(BEST_PAGES.map((page) => [page.path, page] as const))('%s answers in two sentences', (_path, page) => {
    expect(page.answer.split(/(?<=[.!?])\s+/)).toHaveLength(2);
  });

  it.each(BEST_PAGES.map((page) => [page.path, page] as const))('%s lists 360Ghar', (_path, page) => {
    expect(page.rows.map((row) => row.name)).toContain('360Ghar');
  });

  it('renders the publisher line from the shared constant', () => {
    const layout = readFileSync(new URL('./BestPage.astro', import.meta.url), 'utf8');
    expect(layout).toContain('{PUBLISHER_LINE}');
    expect(layout).toMatch(/import \{[^}]*\bPUBLISHER_LINE\b[^}]*\} from '\.\/bestPages'/);
    expect(PUBLISHER_LINE).toContain('We make 360Ghar, which is on this list.');
  });

  it('links the Hindi hub to the English paths, with a translated heading', () => {
    const hub = readFileSync(new URL('../compare/VsHub.astro', import.meta.url), 'utf8');
    expect(hub).toContain('href={page.path}');
    const hi = JSON.parse(readFileSync(new URL('../../../i18n/locales/hi/compare.json', import.meta.url), 'utf8'));
    const en = JSON.parse(readFileSync(new URL('../../../i18n/locales/en/compare.json', import.meta.url), 'utf8'));
    expect(en.hub.bestLists).toBeTruthy();
    expect(hi.hub.bestLists).toBeTruthy();
    expect(hi.hub.bestLists).not.toBe(en.hub.bestLists);
  });

  it.each(BEST_PAGES.map((page) => [page.path, page] as const))('%s has 5 to 6 FAQs with the same text in FAQPage JSON-LD', (_path, page) => {
    expect(page.faqs.length).toBeGreaterThanOrEqual(5);
    expect(page.faqs.length).toBeLessThanOrEqual(6);
    const ld = faqPage(page.faqs);
    expect(ld.mainEntity.map((q) => q.name)).toEqual(page.faqs.map((f) => f.q));
    expect(ld.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(page.faqs.map((f) => f.a));
  });

  it.each(BEST_PAGES.map((page) => [page.path, page] as const))('%s has ItemList names equal to the table rows', (_path, page) => {
    const list = itemList(page);
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement.map((item) => item.name)).toEqual(page.rows.map((row) => row.name));
    expect(list.itemListElement.map((item) => item.position)).toEqual(page.rows.map((_row, i) => i + 1));
  });

  it.each(BEST_PAGES.map((page) => [page.path, page] as const))('%s cites a source and a check date for every row', (_path, page) => {
    expect(page.criteria.length).toBeGreaterThanOrEqual(3);
    for (const row of page.rows) {
      expect(row.source.url).toMatch(/^https:\/\//);
      expect(row.source.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.summary.length).toBeGreaterThan(0);
    }
    expect(CHECKED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('links each competitor row to its own indexable /vs profile', () => {
    for (const page of BEST_PAGES) {
      for (const row of page.rows) {
        if (!row.href.startsWith('/vs/')) continue;
        const competitor = competitorFor(row.href);
        expect(competitor, row.href).toBeDefined();
        expect(competitor!.noindex, `${row.href} is noindex`).toBe(false);
        expect(row.name).toBe(competitor!.name);
      }
    }
  });

  it('keeps every competitor claim to its profile scope or a homepage checked on CHECKED_ON', () => {
    for (const page of BEST_PAGES) {
      for (const row of page.rows) {
        if (row.href.startsWith('/vs/')) {
          const competitor = competitorFor(row.href)!;
          const fromProfile = row.summary === competitor.comparisonScope;
          const fromHomepage = row.source.url === competitor.website && row.source.checkedOn === CHECKED_ON;
          expect(fromProfile || fromHomepage, `${page.path}: ${row.name}`).toBe(true);
        }
      }
    }
  });

  it('keeps no noindex competitor in any table', () => {
    const noindex = COMPETITORS.filter((c) => c.noindex).map((c) => c.name);
    for (const page of BEST_PAGES) {
      for (const row of page.rows) expect(noindex).not.toContain(row.name);
    }
  });

  it('uses no em dash or en dash in the copy', () => {
    expect(JSON.stringify(BEST_PAGES)).not.toMatch(/[–—]/);
  });
});

describe('best-X route wiring', () => {
  it('lists every page in the sitemap as English only', () => {
    for (const page of BEST_PAGES) {
      expect(STATIC_PATHS).toContain(page.path);
      expect(staticEntries().find((e) => e.path === page.path)).toMatchObject({ enOnly: true });
    }
  });

  it('keeps the shared English-only path list equal to the page records', () => {
    expect(BEST_PAGES.map((page) => page.path)).toEqual([...BEST_PATHS]);
  });

  it('is found by bestPage()', () => {
    expect(bestPage('/best-property-portals-india').term).toBe('Best property portals in India');
    expect(() => bestPage('/best-missing')).toThrow();
  });
});

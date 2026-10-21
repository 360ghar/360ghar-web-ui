/**
 * The sitemaps: their names (the keys) are the base list in /sitemap.xml; public/robots.txt repeats it (feeds.test.ts checks).
 * A sitemap that outgrows one file (45,000 URLs or 45 MB) continues in sitemap-<name>-2.xml, -3, and so on; the index lists every page.
 */
import { datahubEntries } from '@/features/data-hub/sitemap';
import { allPosts, allProperties, landingEntries, localityEntries, projectEntries, staticEntries } from './data';
import { urlsetPages, type SitemapEntry } from './xml';

export const SITEMAPS: Record<string, () => Promise<SitemapEntry[]> | SitemapEntry[]> = {
  static: staticEntries,
  landing: landingEntries,
  localities: localityEntries,
  datahub: datahubEntries,
  blog: async () => (await allPosts()).filter((p) => p.slug).map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.updated_at ?? p.published_at ?? p.created_at, changefreq: 'weekly', priority: '0.7' })),
  projects: projectEntries,
  properties: async () => (await allProperties()).map((p) => ({ path: `/property/${p.id}`, lastmod: p.updated_at ?? p.created_at, changefreq: 'weekly', priority: '0.8' })),
};

/** "localities-2" -> { name: 'localities', page: 2 }. Page 1 is the plain name; "-1" is not a valid page. */
export function parseSitemapName(param: string | undefined): { name: string; page: number } | null {
  const m = /^([a-z]+)(?:-(\d+))?$/.exec(param ?? '');
  if (!m || !Object.hasOwn(SITEMAPS, m[1]!)) return null;
  const page = m[2] === undefined ? 1 : Number(m[2]);
  return page >= 2 || m[2] === undefined ? { name: m[1]!, page } : null;
}

/**
 * File names for the index. A list that fails to build, or takes over 8 s (the
 * index must answer inside a function's time limit), is listed as one page.
 * ponytail: the count is exact once the list is cached (30 min to 6 h); a backend count endpoint is the upgrade.
 */
export async function sitemapFileNames(): Promise<string[]> {
  const names = Object.keys(SITEMAPS);
  const counts = await Promise.all(
    names.map(async (n) => {
      try {
        return await Promise.race([Promise.resolve(SITEMAPS[n]!()).then((e) => urlsetPages(e).length), new Promise<number>((r) => setTimeout(() => r(1), 8000))]);
      } catch {
        return 1;
      }
    }),
  );
  return names.flatMap((n, i) => Array.from({ length: counts[i]! }, (_, k) => `sitemap-${n}${k === 0 ? '' : `-${k + 1}`}.xml`));
}

/**
 * Data hub URLs for /sitemap-datahub.xml (English paths; the sitemap adds /hi).
 * Only reviewed, indexable pages belong here. Source-dependent pages stay out
 * until their public records and update evidence pass review.
 *
 * The HRERA project and builder pages are published, so they are listed; their
 * detail pages are enumerated from the API below.
 */
import type { SitemapEntry } from '@/features/feeds/xml';
import { allProjects } from '@/features/projects/api';
import { projectBySlug } from '@/features/projects/catalog';
import { memo } from '@/lib/memo';
import { allBuilders, safe } from './api';
import { validSlug } from './route';

const FIXED: SitemapEntry[] = [
  { path: '/verify-ownership', changefreq: 'monthly', priority: '0.7' },
  { path: '/rera-projects', changefreq: 'daily', priority: '0.8' },
  { path: '/builder-reputation', changefreq: 'weekly', priority: '0.7' },
  { path: '/builder-reputation-score', changefreq: 'monthly', priority: '0.6' },
];

/** Rows per page and the page ceiling for the two detail enumerations (see `allProjects`). */
const SITEMAP_LIMIT = 100;
const SITEMAP_MAX_PAGES = 200;

/**
 * The whole project list, cached: a crawler asks for the sitemap far more often
 * than the register changes, and the walk is many requests.
 *
 * The memo wraps the raw fetch and `safe` sits outside it, so a failure rejects
 * and `memo` drops it. Caching a failure would be worse than not caching at all:
 * one request during a backend outage would leave every project page out of the
 * sitemap for the whole six hours, while the builder list beside it recovered on
 * the next request.
 */
const everyProject = () => safe(() => memo('datahub-sitemap-projects', 6 * 3600_000, () => allProjects(SITEMAP_LIMIT, SITEMAP_MAX_PAGES)));

/**
 * Every builder, cached for the same reason as the projects: the sitemap lists one detail
 * page per slug, and one page of the builder list is 20 rows while the register holds 97.
 */
const everyBuilder = () => safe(() => memo('datahub-sitemap-builders', 6 * 3600_000, () => allBuilders()));

export async function datahubSitemap(): Promise<{ entries: SitemapEntry[]; skipped: string[] }> {
  const entries = FIXED.map((entry) => ({ ...entry }));
  const skipped: string[] = [];

  // Builder detail pages, one per developer slug.
  const builders = await everyBuilder();
  if (builders.error) {
    skipped.push('/builder-reputation/*');
  } else {
    for (const b of builders.data) {
      // The route 404s a slug that fails its own check, so the sitemap must not list it.
      if (!validSlug(b.slug)) continue;
      entries.push({ path: `/builder-reputation/${b.slug}`, changefreq: 'weekly', priority: '0.6' });
    }
  }

  // Project detail pages, one per project slug. A slug-less row has no page to
  // list, and neither has a row whose slug would fail the route's own check.
  const projects = await everyProject();
  if (projects.error) {
    skipped.push('/project/*');
  } else {
    for (const p of projects.data) {
      // A legacy catalog slug renders the noindex hold page, not this project: leave it out.
      if (validSlug(p.slug ?? undefined) && !projectBySlug(p.slug!)) entries.push({ path: `/project/${p.slug}`, lastmod: p.updated_at, changefreq: 'weekly', priority: '0.7' });
    }
  }

  return { entries, skipped };
}

export async function datahubEntries(): Promise<SitemapEntry[]> {
  const { entries, skipped } = await datahubSitemap();
  // A failed list leaves its detail pages out of this response: say so in the server log.
  if (skipped.length) console.warn(`sitemap-datahub: incomplete, skipped ${skipped.join(', ')}`);
  return entries;
}

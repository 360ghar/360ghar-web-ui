import type { AstroGlobal } from 'astro';
import type { Property } from '@/lib/api/types';
import { cachePage, respond } from '@/lib/cache';
import { liveHomes, newestFirst } from '@/features/localities/live';
import { projectBySlug, PROJECTS, type Project } from './catalog';

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

/** Homes that match a project's filter. The locality must match exactly (the API filter is a substring match). */
function matchHomes(match: Project['match'], homes: Property[]): Property[] {
  return homes
    .filter(
      (p) =>
        (!match.purpose || p.purpose === match.purpose) &&
        (!match.property_type?.length || match.property_type.includes(p.property_type)) &&
        (!match.locality || norm(p.locality) === norm(match.locality) || norm(p.sub_locality) === norm(match.locality)),
    )
    .sort(newestFirst);
}

/** Live home count per project slug, or null when the backend is down. */
export async function projectCounts(): Promise<Record<string, number> | null> {
  const all = await liveHomes();
  return all ? Object.fromEntries(PROJECTS.map((p) => [p.slug, matchHomes(p.match, all).length])) : null;
}

/** Data, status and caching for /project/:title. Call from the route file. */
export async function loadProject(Astro: AstroGlobal) {
  const project = projectBySlug(Astro.params.title ?? '');
  let homes: Property[] = [];
  let wider = false;
  let failed = false;
  if (project) {
    const all = await liveHomes();
    failed = !all;
    homes = all ? matchHomes(project.match, all) : [];
    if (all && !homes.length && project.match.locality) {
      // Nothing in that exact place yet: show the same kind of home anywhere in Gurugram, and say so.
      const { locality: _l, ...rest } = project.match;
      homes = matchHomes(rest, all);
      wider = homes.length > 0;
    }
    cachePage(Astro, 'hour', { error: failed });
  } else {
    respond(Astro, 'hour', { notFound: true });
  }
  return { project, homes: homes.slice(0, 8), total: homes.length, wider, failed };
}

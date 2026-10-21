import type { AstroGlobal } from 'astro';
import { api, attempt } from '@/lib/api/client';
import { respond } from '@/lib/cache';
import { withDevTour } from './load';

/** Data, status and caching for /property/:id/virtual-tour. Call from the route file. */
export async function loadTour(Astro: AstroGlobal) {
  const raw = Astro.params.id ?? '';
  const id = /^\d{1,9}$/.test(raw) ? Number(raw) : null;
  const res = id ? await attempt(api.GET('/api/v1/properties/{property_id}', { params: { path: { property_id: id } } })) : null;
  const p = withDevTour(res?.data ?? null, Astro.url);
  const down = Boolean(res?.error && res.error.kind !== 'not_found');
  respond(Astro, 'short', { notFound: !p && !down, error: !p });
  return { id, p };
}

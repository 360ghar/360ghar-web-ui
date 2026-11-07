/**
 * Every live home, read once from the API and cached for 30 minutes. The
 * sitemaps, the RSS feed and the place pages all read this one list.
 */
import { api, call } from '@/lib/api/client';
import { collectPages } from '@/lib/api/pages';
import { memo } from '@/lib/memo';

// The list cursor is keyset on (sort value, id), so a page never repeats or skips a home. The id dedupe stays as a guard.
export const allProperties = () =>
  memo('feed-properties', 30 * 60_000, async () => {
    const homes = await collectPages((cursor) => call(api.GET('/api/v1/properties', { params: { query: { limit: 100, ...(cursor ? { cursor } : {}) } } })));
    return [...new Map(homes.map((p) => [p.id, p])).values()];
  });

import { api } from '@/lib/api/client';
import { CELEBRITY_HOMES } from './data';

/**
 * GET /blog/posts/{slug} for each card at build time. A card links only when
 * the post returns 200. Network errors count as "no post" (no broken links).
 */
export async function publishedCelebritySlugs(): Promise<Set<string>> {
  const found = await Promise.all(
    CELEBRITY_HOMES.map(async (c) => {
      try {
        const { response } = await api.GET('/api/v1/blog/posts/{identifier}', { params: { path: { identifier: c.slug } } });
        return response.ok ? c.slug : null;
      } catch {
        return null;
      }
    }),
  );
  return new Set<string>(found.flatMap((s) => (s ? [s] : [])));
}

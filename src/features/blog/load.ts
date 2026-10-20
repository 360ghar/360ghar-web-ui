import { api, attempt, call } from '@/lib/api/client';
import type { BlogPostPage } from '@/lib/api/types';
import type { ApiError } from '@/lib/api/errors';
import type { BlogPost } from '@/lib/api/types';
import { memo } from '@/lib/memo';
import type { AstroGlobal } from 'astro';
import { cachePage, respond } from '@/lib/cache';
import type { components } from '@/lib/api/schema';

export type BlogCategory = components['schemas']['BlogCategory'];

/** URL params of /blog. The names are the old site's (`category`, `tag`, `q`). */
export type BlogQuery = { q?: string; category?: string; tag?: string };

function parseBlogQuery(sp: URLSearchParams): BlogQuery & { cursor?: string } {
  const get = (k: string) => sp.get(k)?.trim().slice(0, 100) || undefined;
  return { q: get('q'), category: get('category'), tag: get('tag'), cursor: get('cursor') };
}

/** The backend takes lists: `categories`, `tags` (slugs or names). */
const postsRequest = (q: BlogQuery, cursor?: string | null, limit = 12) =>
  api.GET('/api/v1/blog/posts', {
    params: {
      query: {
        q: q.q,
        categories: q.category ? [q.category] : undefined,
        tags: q.tag ? [q.tag] : undefined,
        cursor: cursor ?? undefined,
        limit,
      },
    },
  });

export function fetchPosts(q: BlogQuery, cursor?: string | null, limit = 12): Promise<BlogPostPage> {
  return call(postsRequest(q, cursor, limit));
}

async function loadPosts(q: BlogQuery, cursor?: string, limit = 12): Promise<{ page: BlogPostPage | null; error: ApiError | null }> {
  const r = await attempt(postsRequest(q, cursor, limit));
  return { page: r.data, error: r.error };
}

export async function loadPost(identifier: string) {
  const r = await attempt(api.GET('/api/v1/blog/posts/{identifier}', { params: { path: { identifier } } }));
  return { post: r.data, error: r.error };
}

/** Up to three other posts from the post's first category, then the newest. Never throws. */
export async function loadRelated(post: BlogPost): Promise<BlogPost[]> {
  const cat = post.categories?.[0]?.slug;
  const [same, recent] = await Promise.all([cat ? loadPosts({ category: cat }, undefined, 4) : null, loadPosts({}, undefined, 4)]);
  const seen = new Set([post.id]);
  const out: BlogPost[] = [];
  for (const p of [...(same?.page?.items ?? []), ...(recent.page?.items ?? [])]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length === 3) break;
  }
  return out;
}

/**
 * Data, cache headers and status for /blog. Call from the route file: a
 * child component is too late to set the status or headers.
 */
export async function loadBlogIndex(astro: AstroGlobal) {
  const { cursor, ...query } = parseBlogQuery(astro.url.searchParams);
  // ponytail: category counts come from the newest 50 posts; ask the backend for post counts on /blog/categories when the blog grows.
  const [first, recent] = await Promise.all([
    loadPosts(query, cursor),
    memo('blog-recent-50', 15 * 60_000, async () => (await loadPosts({}, undefined, 50)).page?.items ?? []).catch((): BlogPost[] => []),
  ]);
  cachePage(astro, 'short', { error: Boolean(first.error) });
  if (first.error) astro.response.status = first.error.status && first.error.status < 500 && first.error.kind !== 'network' ? first.error.status : 503;
  return { query, cursor, first, recent };
}

/** Data, redirect and status for /blog/:title. Returns a Response for a redirect. */
export async function loadPostPage(astro: AstroGlobal, localize: (p: string) => string) {
  // Astro params are already decoded; decoding again throws on a literal "%".
  const param = (astro.params.title ?? '').slice(0, 200);
  const { post, error } = param ? await loadPost(param) : { post: null, error: null };
  // A numeric id or another spelling moves to the canonical slug.
  if (post?.slug && post.slug !== param) return astro.redirect(localize(`/blog/${post.slug}`) + astro.url.search, 301);
  const notFound = !post && (!error || error.kind === 'not_found' || error.status === 404);
  if (post) respond(astro, 'hour');
  else if (notFound) respond(astro, 'short', { notFound: true });
  else respond(astro, 'minute', { error: true });
  const related = post ? await loadRelated(post) : [];
  return { post, notFound, related };
}

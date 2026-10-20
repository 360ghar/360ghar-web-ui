/**
 * Blog card. Rendered as static HTML by Astro and inside the list island.
 * Seed placeholder covers are replaced with a paper-cut scene (art/cover.ts).
 */
import type { BlogPost } from '@/lib/api/types';
import { formatDate as dateIn, imageUrl, srcSet } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { coverScene, hasRealCover } from './art/cover';
import { SceneArt } from './art/SceneArt';
import { paperArt, type SceneName } from './art/scenes';

export const postDate = (p: Pick<BlogPost, 'published_at' | 'created_at'>) => p.published_at ?? p.created_at ?? null;

export const formatDate = (iso: string, locale: Locale) =>
  dateIn(iso, locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

type Props = {
  post: BlogPost;
  locale: Locale;
  eager?: boolean;
  heading?: 'h2' | 'h3';
  sizes?: string;
  /** Paper scene for a post without a real cover. Lists pass one from coverScenes() so neighbours differ. */
  scene?: SceneName;
};

export function BlogCardView({ post, locale, eager = false, heading: H = 'h3', sizes = '(min-width: 768px) 30vw, 92vw', scene }: Props) {
  const date = postDate(post);
  const category = post.categories?.[0]?.name;
  const art = scene ?? coverScene(post);
  return (
    <article className="blog-card">
      {/* Offscreen inline art is not painted until it scrolls near; the box keeps its 16:10 size. */}
      <div className="blog-card-img" style={eager && !hasRealCover(post.cover_image_url) ? { contentVisibility: 'auto' } : undefined}>
        {hasRealCover(post.cover_image_url) ? (
          <img
            src={imageUrl(post.cover_image_url, 640)}
            srcSet={srcSet(post.cover_image_url, [320, 480, 640, 960])}
            sizes={sizes}
            alt=""
            width={640}
            height={400}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            {...(eager ? { fetchPriority: 'high' as const } : {})}
          />
        ) : eager ? (
          <SceneArt art={paperArt(art, post.slug)} />
        ) : (
          // Below the first screen the scene is a cached file (src/pages/art), not inline SVG.
          <img className="scene-img" src={`/art/scene/${art}.svg`} data-scene={art} alt="" width={640} height={400} loading="lazy" decoding="async" />
        )}
      </div>
      <div className="grid gap-1.5">
        {date || category ? (
          <p className="text-sm text-ink-600">
            {category ? <span className="font-semibold text-ink-800">{category}</span> : null}
            {category && date ? ' · ' : null}
            {date ? <time dateTime={date}>{formatDate(date, locale)}</time> : null}
          </p>
        ) : null}
        <H className="blog-card-title">
          <a href={localizePath(`/blog/${post.slug}`, locale)}>{post.title}</a>
        </H>
        {post.excerpt ? <p className="line-clamp-2 text-ink-800">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="blog-card" aria-hidden="true">
      <div className="blog-card-img skeleton" />
      <div className="grid gap-2">
        <span className="skeleton h-4 w-32" />
        <span className="skeleton h-6 w-4/5" />
        <span className="skeleton h-4 w-full" />
      </div>
    </div>
  );
}

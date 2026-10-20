/**
 * Blog post grid. Page 1 comes from the server; more pages load on scroll,
 * with a "Load more" link that also works without JavaScript (?cursor=).
 */
import type { BlogPostPage } from '@/lib/api/types';
import type { CSSProperties } from 'react';
import { describeError } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { useBackRestore, useCursorQuery, useSentinel } from '@/lib/infinite';
import { QueryProvider } from '@/lib/query';
import { Delayed } from '@/ui/react/Delayed';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { titleFit } from '@/features/content/shared/fit';
import { coverScenes } from './art/cover';
import { BlogCardSkeleton, BlogCardView } from './BlogCardView';
import { fetchPosts, type BlogQuery } from './load';

type Props = { locale: Locale; query: BlogQuery; initialPage: BlogPostPage };

const T = {
  en: { more: 'Load more posts', loading: 'Loading…', failed: 'More posts did not load.', retry: 'Try again', end: 'You have seen every post.' },
  hi: { more: 'और पोस्ट देखें', loading: 'लोड हो रहा है…', failed: 'और पोस्ट लोड नहीं हुए।', retry: 'फिर कोशिश करें', end: 'आपने सभी पोस्ट देख लिए।' },
};

function List({ locale, query, initialPage }: Props) {
  const t = T[locale];
  const key = ['blog', query];
  const q = useCursorQuery({ key, fetch: (cursor) => fetchPosts(query, cursor), initialPage, staleTime: 5 * 60_000 });
  useBackRestore(key, q.data);
  const sentinel = useSentinel({ ...q, isError: q.isFetchNextPageError });
  const posts = q.data.pages.flatMap((p) => p.items);
  const scenes = coverScenes(posts);
  const next = q.data.pages.at(-1)?.next_cursor;
  const moreHref = () => {
    const sp = new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => Boolean(e[1])));
    if (next) sp.set('cursor', next);
    return `?${sp}`;
  };

  return (
    <>
      <ul className="blog-grid">
        {posts.map((p, i) => (
          <li key={p.id} data-lead={i === 0 || undefined} style={i === 0 && titleFit(p.title) ? ({ '--fit': `${titleFit(p.title)}cqi` } as CSSProperties) : undefined}>
            <BlogCardView post={p} locale={locale} heading="h2" eager={i === 0} sizes={i === 0 ? '(min-width: 64rem) 62vw, 92vw' : undefined} scene={scenes[i]} />
          </li>
        ))}
        {q.isFetchingNextPage ? (
          <Delayed>
            {[0, 1, 2].map((n) => (
              <li key={`s${n}`}>
                <BlogCardSkeleton />
              </li>
            ))}
          </Delayed>
        ) : null}
      </ul>
      <div ref={sentinel} aria-hidden="true" />
      <div className="blog-more" aria-live="polite">
        {q.isFetchNextPageError ? (
          <p className="field-error">
            {t.failed} {describeError(q.error, locale).body}
          </p>
        ) : null}
        {q.hasNextPage ? (
          <a
            className="btn"
            href={moreHref()}
            aria-disabled={q.isFetchingNextPage || undefined}
            onClick={(e) => {
              e.preventDefault();
              if (!q.isFetchingNextPage) void q.fetchNextPage();
            }}
          >
            {q.isFetchingNextPage ? t.loading : q.isFetchNextPageError ? t.retry : t.more}
          </a>
        ) : posts.length > 12 ? (
          <p className="text-ink-600">{t.end}</p>
        ) : null}
      </div>
    </>
  );
}

export default function BlogList(props: Props) {
  return (
    <QueryProvider>
      <IslandBoundary locale={props.locale}>
        <List {...props} />
      </IslandBoundary>
    </QueryProvider>
  );
}

/**
 * Shared machinery for the data hub list islands:
 * - `useCursorList`: useInfiniteQuery over a cursor endpoint. Page 1 comes from
 *   the server render, so hydration shows no change. Filters live in the URL
 *   (replaceState, no reload). On Back, loaded pages and the scroll position
 *   come back (useBackRestore).
 * - `ListBody`: error (with retry), skeleton after 150 ms, empty state, rows,
 *   then the "Load more" button. Two more pages load on scroll; after that the
 *   button is the only way on, so the FAQ and footer stay reachable.
 * - `useSearchFilter` and `CountBar`: the search box and the count line above
 *   the list.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { describeError } from '@/lib/api/errors';
import { useBackRestore, useCursorQuery, useSentinel } from '@/lib/infinite';
import type { ItemOf, PageShape } from '@/lib/api/types';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { Delayed } from '@/ui/react/Delayed';
import { StateBlock } from '@/ui/states/StateBlock';
import { writeParams } from './params';
import { text } from './text';

type Spec = Parameters<typeof writeParams>[1];

export function useCursorList<F extends object, P extends PageShape>(opts: {
  name: string;
  spec: Spec;
  filters: F;
  initialFilters: F;
  initialPage: P | null;
  fetchPage: (f: F, cursor: string | null) => Promise<P>;
  idOf: (item: ItemOf<P>) => string | number;
}) {
  const { name, spec, filters, initialFilters, initialPage, fetchPage, idOf } = opts;
  const key = writeParams(filters as never, spec);
  const isInitial = key === writeParams(initialFilters as never, spec);
  const query = useCursorQuery({
    key: ['data-hub', name, key],
    fetch: (cursor) => fetchPage(filters, cursor),
    initialPage: isInitial ? initialPage : null,
    keepPrevious: true,
    staleTime: 60_000,
  });
  // Back from a detail page: the loaded pages and the scroll position come back.
  useBackRestore(['data-hub', name, key], query.data);

  const firstSync = useRef(true);
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    history.replaceState(history.state, '', key ? `${location.pathname}?${key}` : location.pathname);
  }, [key]);

  // Offset paging without ORDER BY on the backend can repeat a row across pages.
  const seen = new Set<string | number>();
  const items = (query.data?.pages.flatMap((p) => p.items as ItemOf<P>[]) ?? []).filter((x) => {
    const id = idOf(x);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const total = query.data?.pages[0]?.total ?? null;
  return { query, items, total };
}

type Query = ReturnType<typeof useCursorList>['query'];

export function ListBody({
  query,
  count,
  locale,
  skeleton,
  empty,
  children,
}: {
  query: Query;
  count: number;
  locale: Locale;
  skeleton: ReactNode;
  empty: ReactNode;
  children: ReactNode;
}) {
  const t = text(locale);
  const sentinel = useSentinel(query, { maxPages: 3, margin: 400 });
  const pages = query.data?.pages.length ?? 0;

  const err = query.isError ? describeError(query.error, locale) : null;

  return (
    <div className={`dh-body ${query.isPlaceholderData ? 'is-stale' : ''}`} aria-busy={query.isFetching || undefined}>
      {err && !count ? (
        <StateBlock scene={err.kind === 'network' ? 'offline' : 'error'} title={err.title} body={err.body} action={{ label: t.retry, onClick: () => void query.refetch() }} />
      ) : query.isPending ? (
        <Delayed>{skeleton}</Delayed>
      ) : count === 0 ? (
        empty
      ) : (
        children
      )}
      <div ref={sentinel} aria-hidden="true" />
      {count > 0 && query.hasNextPage ? (
        <div className="dh-more">
          <button type="button" className="btn" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
            {query.isFetchingNextPage ? t.loading : t.loadMore}
          </button>
        </div>
      ) : pages > 1 ? (
        <p className="dh-end">{t.end}</p>
      ) : null}
      {err && count ? (
        <p className="field-error mt-3 justify-center" role="alert">
          <Icon name="alert" size={16} />
          {err.title}
        </p>
      ) : null}
    </div>
  );
}

/** Screen-reader note while filtered results load. */
export function Updating({ query, locale }: { query: Query; locale: Locale }) {
  return query.isFetching && !query.isFetchingNextPage ? <span className="visually-hidden">{text(locale).updating}</span> : null;
}

/** The count line above a list: the count, the "Updating" note, then an optional "Clear filters" button. */
export function CountBar({
  query,
  locale,
  label,
  onClear,
  as: Tag = 'p',
  children,
}: {
  query: Query;
  locale: Locale;
  label: string;
  onClear?: () => void;
  as?: 'p' | 'div';
  children?: ReactNode;
}) {
  return (
    <Tag className="dh-count" aria-live="polite">
      <span>
        <strong>{label}</strong>
        <Updating query={query} locale={locale} />
      </span>
      {onClear ? (
        <button type="button" className="btn btn-quiet" onClick={onClear}>
          {text(locale).clear}
        </button>
      ) : null}
      {children}
    </Tag>
  );
}

/** Skeleton rows for a table, same row height as the data. */
export function TableSkeleton({ cols, rows = 8 }: { cols: number; rows?: number }) {
  return (
    <div className="sheet dh-sheet" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-ink-100 last:border-0">
          {Array.from({ length: cols }, (_, j) => (
            <span key={j} className="skeleton h-4 flex-1" style={{ maxWidth: j === 0 ? '9rem' : '6rem' }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function RowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="sheet dh-rows" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="grid gap-2">
          <span className="skeleton h-5 w-3/5" />
          <span className="skeleton h-4 w-2/5" />
          <span className="skeleton h-4 w-4/5" />
        </li>
      ))}
    </ul>
  );
}

/** Debounces a text field into a filter value. */
function useDebounced(value: string, ms: number, onSettle: (v: string) => void) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(() => onSettle(value), ms);
    return () => window.clearTimeout(id);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Filters plus a search box: `q` is what the person types, and it settles into
 * `filters[key]` after `ms`. Pages reset both with `setQ('')` and `setFilters`.
 */
export function useSearchFilter<F extends object>(initial: F, key: keyof F & string, ms = 350) {
  const [filters, setFilters] = useState<F>(initial);
  const [q, setQ] = useState(String(initial[key] ?? ''));
  useDebounced(q, ms, (v) => setFilters((f) => ({ ...f, [key]: v.trim() || undefined })));
  return { filters, setFilters, q, setQ };
}

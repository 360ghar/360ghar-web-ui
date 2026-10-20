/**
 * Helpers for cursor lists built on useInfiniteQuery:
 * - useBackRestore: on Back, puts back the loaded pages and the scroll position;
 * - useSentinel: loads the next page when an element scrolls near the viewport;
 * - useCursorQuery: useInfiniteQuery over a `CursorPage` endpoint.
 */
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
  type DefinedUseInfiniteQueryResult,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { sawNoStore } from '@/lib/api/client';
import type { PageShape } from '@/lib/api/types';

const LIST_PREFIX = '360ghar:list:';
const KEY = (url: string) => `${LIST_PREFIX}${url}`;

/** Bump when the saved shape, or the rows a list holds, change. An entry of another version is ignored. */
const LIST_VERSION = 1;

type Saved<P> = { v: number; at: number; pages: P[]; params: unknown[]; y: number; extra?: unknown };

/**
 * Drops every saved list (sessionStorage, for Back). Called when the session ends or changes:
 * a signed-in list can hold the viewer's `liked` flags and the contact number shown to them.
 */
export function clearSavedLists() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(LIST_PREFIX)) sessionStorage.removeItem(k);
    }
  } catch {
    // Storage blocked: nothing was saved.
  }
}

/**
 * Writes a list for Back. Nothing is written once the page has seen a `no-store` response (a signed-in
 * visitor's): that data is not for browser storage. Returns whether it was written.
 */
export function saveList(url: string, saved: Saved<unknown>, blocked = sawNoStore()): boolean {
  if (blocked) return false;
  try {
    sessionStorage.setItem(KEY(url), JSON.stringify(saved));
    return true;
  } catch {
    // Storage full or blocked: Back still works, it starts at page 1.
    return false;
  }
}

type CursorOpts<P extends PageShape> = {
  key: QueryKey;
  fetch: (cursor: string | null) => Promise<P>;
  staleTime?: number;
  /** Keep the old rows on screen while a new key loads. */
  keepPrevious?: boolean;
};
type CursorData<P extends PageShape> = InfiniteData<P, string | null>;

/** Cursor paging: page 1 can come from the server render (`initialPage`), the next pages from `next_cursor`. */
export function useCursorQuery<P extends PageShape>(o: CursorOpts<P> & { initialPage: P }): DefinedUseInfiniteQueryResult<CursorData<P>, Error>;
export function useCursorQuery<P extends PageShape>(o: CursorOpts<P> & { initialPage?: P | null }): UseInfiniteQueryResult<CursorData<P>, Error>;
export function useCursorQuery<P extends PageShape>({ key, fetch: fetchPage, initialPage, staleTime, keepPrevious }: CursorOpts<P> & { initialPage?: P | null }) {
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.has_more && last.next_cursor ? last.next_cursor : undefined),
    ...(initialPage ? { initialData: { pages: [initialPage], pageParams: [null] } } : {}),
    ...(keepPrevious ? { placeholderData: keepPreviousData } : {}),
    ...(staleTime !== undefined ? { staleTime } : {}),
  });
}

export function useBackRestore<P>(
  queryKey: QueryKey,
  data: InfiniteData<P, unknown> | undefined,
  extra?: { value: unknown; restore: (v: unknown) => void },
) {
  const client = useQueryClient();
  const done = useRef(false);

  // After hydration, so the first render matches the server HTML.
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type !== 'back_forward') return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY(location.pathname + location.search)) ?? 'null') as Saved<P> | null;
      if (!saved || saved.v !== LIST_VERSION || Date.now() - saved.at > 30 * 60_000) return;
      client.setQueryData(queryKey, { pages: saved.pages, pageParams: saved.params });
      if (extra && saved.extra !== undefined) extra.restore(saved.extra);
      window.setTimeout(() => requestAnimationFrame(() => window.scrollTo(0, saved.y)), 0);
    } catch {
      // Nothing saved or storage blocked: the list starts at page 1.
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on pagehide (keeps the back/forward cache usable).
  const value = extra?.value;
  useEffect(() => {
    const save = () => {
      if (!data) return;
      saveList(location.pathname + location.search, { v: LIST_VERSION, at: Date.now(), pages: data.pages.slice(0, 8), params: data.pageParams.slice(0, 8), y: window.scrollY, extra: value });
    };
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, [data, value]);
}

export function useSentinel(
  q: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isError?: boolean;
    fetchNextPage: () => unknown;
    data?: { pages: unknown[] };
  },
  { maxPages, margin = 600 }: { maxPages?: number; margin?: number } = {},
) {
  const ref = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, isError, fetchNextPage } = q;
  const pages = q.data?.pages.length ?? 0;
  useEffect(() => {
    const el = ref.current;
    // After an error, wait for the "Load more" button instead of retrying in a loop.
    // With `maxPages`, stop at that many loaded pages: the button is the only way on.
    if (!el || !hasNextPage || isError || (maxPages !== undefined && pages >= maxPages)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: `${margin}px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage, pages, maxPages, margin]);
  return ref;
}

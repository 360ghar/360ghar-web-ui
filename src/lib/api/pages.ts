import type { ItemOf, PageShape } from './types';

/**
 * Every row of a cursor list: follows `next_cursor` while `has_more`. Use it when
 * a screen needs all rows (a favourites set, a dropdown, a sitemap). One page is
 * at most 100 rows, so a list that is read once must not stop at page 1.
 * ponytail: capped at `maxPages` pages of 100 rows; move to a backend export when a list outgrows it.
 */
export async function collectPages<P extends PageShape>(fetchPage: (cursor: string | null) => Promise<P>, maxPages = 50): Promise<ItemOf<P>[]> {
  const out: ItemOf<P>[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < maxPages; i += 1) {
    const page: P = await fetchPage(cursor);
    out.push(...(page.items as ItemOf<P>[]));
    if (!page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return out;
}

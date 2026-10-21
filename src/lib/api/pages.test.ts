import { describe, expect, it, vi } from 'vitest';
import { collectPages } from './pages';

const page = (items: number[], next: string | null) => ({ items, next_cursor: next, has_more: next !== null, limit: 2, total: null });

describe('collectPages', () => {
  it('follows next_cursor until has_more is false', async () => {
    const fetchPage = vi.fn(async (cursor: string | null) => (cursor === null ? page([1, 2], 'a') : cursor === 'a' ? page([3, 4], 'b') : page([5], null)));
    expect(await collectPages(fetchPage)).toEqual([1, 2, 3, 4, 5]);
    expect(fetchPage.mock.calls.map((c) => c[0])).toEqual([null, 'a', 'b']);
  });

  it('stops at the page cap', async () => {
    const fetchPage = vi.fn(async () => page([1], 'again'));
    expect(await collectPages(fetchPage, 3)).toEqual([1, 1, 1]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });
});

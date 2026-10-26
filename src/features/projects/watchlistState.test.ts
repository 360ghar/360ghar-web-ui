import { beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from 'zustand';

type S = { status: 'anon' | 'authed'; session: { user: { id: string } } | null };
const store = create<S>(() => ({ status: 'anon', session: null }));
const watchlist = vi.fn();

vi.mock('@/features/auth/store', () => ({ initAuth: () => Promise.resolve(), useAuthStore: store }));
vi.mock('./api', () => ({ watchlist: () => watchlist() }));

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('watchlist state', () => {
  beforeEach(() => {
    vi.resetModules();
    watchlist.mockReset();
    store.setState({ status: 'anon', session: null });
  });

  it('loads the new account after a sign-in on a page that already loaded as anon', async () => {
    const m = await import('./watchlistState');
    await m.loadSaved();
    expect(m.savedState(7)).toBe('not-saved');
    watchlist.mockResolvedValue([{ project_id: 7 }]);
    store.setState({ status: 'authed', session: { user: { id: 'b' } } });
    await flush();
    expect(m.savedState(7)).toBe('saved');
  });

  it('ignores a load that answers after the account changed', async () => {
    store.setState({ status: 'authed', session: { user: { id: 'a' } } });
    let answer!: (v: { project_id: number }[]) => void;
    watchlist.mockReturnValueOnce(new Promise((r) => (answer = r)));
    const m = await import('./watchlistState');
    void m.loadSaved();
    await flush();
    watchlist.mockResolvedValue([]);
    store.setState({ status: 'authed', session: { user: { id: 'b' } } });
    await flush();
    answer([{ project_id: 9 }]);
    await flush();
    expect(m.savedState(9)).toBe('not-saved');
  });
});

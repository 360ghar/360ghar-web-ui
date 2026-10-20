/**
 * Favourites (the backend calls them "liked swipes"). One module store for all
 * islands. Toggling is optimistic: the heart changes at once, and reverts with
 * a toast if the server says no.
 */
import { create } from 'zustand';
import { api, call } from '@/lib/api/client';
import { initAuth, useAuthStore } from '@/features/auth/store';
import { collectPages } from '@/lib/api/pages';

type FavState = {
  liked: Set<number>;
  loaded: boolean;
  set: (id: number, on: boolean) => void;
};

export const useFavourites = create<FavState>((set) => ({
  liked: new Set(),
  loaded: false,
  set: (id, on) =>
    set((s) => {
      const next = new Set(s.liked);
      if (on) next.add(id);
      else next.delete(id);
      return { liked: next };
    }),
}));

let loading: Promise<void> | null = null;

/** Loads the signed-in user's liked ids once per page (SSR pages are anonymous and cached). */
export function loadFavourites(): Promise<void> {
  loading ??= (async () => {
    await initAuth();
    if (useAuthStore.getState().status !== 'authed') return;
    try {
      // Every liked home, not only the first 100: follow next_cursor until has_more is false.
      const homes = await collectPages((cursor) => call(api.GET('/api/v1/swipes', { params: { query: { is_liked: true, limit: 100, ...(cursor ? { cursor } : {}) } } })));
      const ids = homes.map((p) => p.id);
      useFavourites.setState((s) => ({ liked: new Set([...s.liked, ...ids]), loaded: true }));
    } catch {
      // Not fatal: hearts show as not liked until the user toggles one.
    }
  })();
  return loading;
}

export async function toggleFavourite(id: number, on: boolean): Promise<void> {
  const { set } = useFavourites.getState();
  set(id, on);
  try {
    await call(api.POST('/api/v1/swipes', { body: { property_id: id, is_liked: on } }));
  } catch (error) {
    set(id, !on);
    throw error;
  }
}

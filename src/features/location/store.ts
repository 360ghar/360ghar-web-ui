/**
 * The visitor's saved location (Zustand + persist, one module store).
 *
 * - Key `360ghar:location-v2`; only lat, lng, accuracy and time are saved.
 * - Fresh for 24 hours. A fresh fix is reused, so "Near me" does not prompt
 *   again. A stale or invalid one is dropped when it is read.
 * - SSR-safe: the store never touches `localStorage` until `locate()` or the
 *   `useLocationMemory` effect runs (`skipHydration`), so the first client
 *   render equals the server HTML.
 * - The location goes nowhere else: search pages already take `lat` and `lng`
 *   in the URL, and that is the only use.
 */
import { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { fromPosition, isFresh, parseFix, reasonFromCode, serializeFix, type FailReason, type Fix } from './logic';

export const STORAGE_KEY = '360ghar:location-v2';

type State = {
  fix: Fix | null;
  status: 'idle' | 'busy' | 'fallback';
  reason: FailReason | null;
  dismissed: boolean;
};

type Actions = {
  /** A fresh saved fix, else the browser's (asks once). Null means "use the fallback centre". */
  locate: () => Promise<Fix | null>;
  /** Forget the saved location. */
  clear: () => void;
  dismiss: () => void;
};

/** `localStorage` looked up on each call (it does not exist on the server) and never allowed to throw. */
const storage = createJSONStorage<{ fix: Fix | null }>(() => ({
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      // Storage full or blocked: the fix lives in memory for this page only.
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      // Same as above.
    }
  },
}));

export const useLocationStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      fix: null,
      status: 'idle',
      reason: null,
      dismissed: false,

      locate: async () => {
        if (!useLocationStore.persist.hasHydrated()) await useLocationStore.persist.rehydrate();
        const saved = get().fix;
        if (isFresh(saved, Date.now())) {
          set({ status: 'idle', reason: null });
          return saved;
        }
        set({ status: 'busy', reason: null, dismissed: false });
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          set({ fix: null, status: 'fallback', reason: 'unsupported' });
          return null;
        }
        return new Promise<Fix | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const fix = fromPosition(pos.coords, Date.now());
              set({ fix, status: 'idle', reason: null });
              resolve(fix);
            },
            (err) => {
              set({ fix: null, status: 'fallback', reason: reasonFromCode(err?.code) });
              resolve(null);
            },
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
          );
        });
      },

      clear: () => set({ fix: null, status: 'idle', reason: null, dismissed: false }),
      dismiss: () => set({ dismissed: true }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage,
      skipHydration: true,
      partialize: (s) => ({ fix: serializeFix(s.fix) }),
      // Validate what came from storage; never trust it.
      merge: (persisted, current) => ({ ...current, fix: parseFix((persisted as { fix?: unknown } | undefined)?.fix, Date.now()) }),
    },
  ),
);

/** Loads the saved fix after mount (the first render stays the same as the server's). */
export function useLocationMemory() {
  useEffect(() => {
    void useLocationStore.persist.rehydrate();
  }, []);
}

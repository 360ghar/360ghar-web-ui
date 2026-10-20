import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { toast } from '@/ui/react/Toaster';

export const COMPARE_MAX = 4;

/** Bump when the saved shape changes. `HomesComparePage.astro` writes the same version. */
export const COMPARE_STORE_VERSION = 1;

/** Saved state of any version or damage -> a valid id list: positive whole numbers, no repeats, at most COMPARE_MAX. */
export function restoreCompare(saved: unknown): { ids: number[] } {
  const ids = (saved as { ids?: unknown } | null | undefined)?.ids;
  const ok = Array.isArray(ids) ? ids.filter((x): x is number => Number.isInteger(x) && x > 0) : [];
  return { ids: [...new Set(ok)].slice(0, COMPARE_MAX) };
}

type CompareState = { ids: number[]; toggle: (id: number) => boolean; clear: () => void };

/** Homes picked for side-by-side comparison. Kept across pages (localStorage). */
const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids;
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id) });
          return true;
        }
        if (ids.length >= COMPARE_MAX) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      clear: () => set({ ids: [] }),
    }),
    {
      name: '360ghar:compare',
      version: COMPARE_STORE_VERSION,
      // Read storage after hydration, so server and first client render match.
      skipHydration: true,
      partialize: (s) => ({ ids: s.ids }),
      migrate: (saved) => restoreCompare(saved),
      // The current version is checked too: a hand-edited or half-written entry must not reach the tray.
      merge: (saved, current) => (saved === undefined ? current : { ...current, ...restoreCompare(saved) }),
    },
  ),
);

/** Use in components: returns the store after loading saved ids once. */
export function useCompareStore() {
  useEffect(() => {
    if (!useCompare.persist.hasHydrated()) void useCompare.persist.rehydrate();
  }, []);
  return useCompare();
}

export const compareHref = (ids: number[], locale: Locale) => `${localizePath('/compare', locale)}${ids.length ? `?ids=${ids.join(',')}` : ''}`;

/**
 * Adds or removes a home. Toasts `msg.full` when the list is full. With `msg.added`, adding also
 * toasts with a link to the compare page. `compare` is the hook snapshot from before the change.
 */
export function toggleCompare(
  compare: Pick<CompareState, 'ids' | 'toggle'>,
  id: number,
  msg: { full: string; added?: { text: string; view: string; locale: Locale } },
) {
  const wasIn = compare.ids.includes(id);
  if (!compare.toggle(id)) toast(msg.full);
  else if (!wasIn && msg.added) {
    const { text, view, locale } = msg.added;
    toast(text, 'success', { label: view, run: () => window.location.assign(compareHref([...compare.ids, id], locale)) });
  }
}

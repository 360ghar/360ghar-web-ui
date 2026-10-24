/**
 * Save / remove a project on the watchlist. Optimistic: the button flips at
 * once and flips back with a toast when the server says no. A signed-out click
 * goes to sign-in with the current page as the return path, because the
 * watchlist belongs to an account, not to the browser.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { initAuth, useAuthStore } from '@/features/auth/store';
import { loginHref } from '@/features/auth/flows';
import { describeError } from '@/lib/api/errors';
import { haptic } from '@/lib/haptics';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { toast } from '@/ui/react/Toaster';
import { addToWatchlist, removeFromWatchlist } from './api';
import { text } from './text';
import { loadSaved, savedState, setSaved, subscribeSaved, type SavedState } from './watchlistState';

export type WatchlistButtonProps = {
  locale: Locale;
  /** The project's `id`, which is what the watchlist stores. */
  projectId: number;
};

function Button({ locale, projectId }: WatchlistButtonProps) {
  const t = text(locale);
  // The saved set is browser state and the project page is cached at the edge, so
  // the server render cannot know it. Until the store answers, the button is
  // neutral and disabled rather than claiming "Save" for a saved project.
  const state = useSyncExternalStore(subscribeSaved, () => savedState(projectId), (): SavedState => 'unknown');
  const known = state !== 'unknown';
  const on = state === 'saved';
  const [pending, setPending] = useState(false);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void loadSaved();
  }, []);

  const onClick = async () => {
    if (pending) return;
    if (status === 'unknown') await initAuth();
    if (useAuthStore.getState().status !== 'authed') {
      window.location.assign(loginHref(locale));
      return;
    }
    const next = !on;
    setSaved(projectId, next);
    setPending(true);
    try {
      if (next) await addToWatchlist({ project_id: projectId });
      else await removeFromWatchlist(projectId);
      haptic('tap');
      toast(next ? t.wlSaved : t.wlRemoved, 'success');
    } catch (error) {
      setSaved(projectId, !next);
      toast(describeError(error, locale).title, 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className="btn pj-watch"
      // One constant name; `aria-pressed` carries the saved state.
      aria-label={known ? t.wlSave : t.wlChecking}
      aria-pressed={known ? on : undefined}
      aria-busy={pending || !known || undefined}
      disabled={!known}
      onClick={() => void onClick()}
    >
      <Icon name={on ? 'star' : 'heart'} size={18} className={on ? 'text-kesar-600' : undefined} />
      <span aria-hidden="true">{known ? (on ? t.wlLabel : t.wlSave) : t.wlChecking}</span>
    </button>
  );
}

/** A crash hides the button; the rest of the page keeps working. */
export function WatchlistButton(props: WatchlistButtonProps) {
  return (
    <IslandBoundary locale={props.locale} fallback={null}>
      <Button {...props} />
    </IslandBoundary>
  );
}

export default WatchlistButton;

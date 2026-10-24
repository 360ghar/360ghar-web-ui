/**
 * The signed-in visitor's saved project ids, held in one place so every
 * watchlist button on a page agrees and a cached page still shows the right
 * state after hydration.
 *
 * Pages that carry a watchlist button are rendered anonymously and cached at
 * the edge, so the server cannot know which projects are saved. The store is
 * read once per page in the browser, after the session settles; until it has
 * answered, `savedState` is `unknown` rather than a state the page cannot know.
 */
import { initAuth, useAuthStore } from '@/features/auth/store';
import { watchlist } from './api';

const saved = new Set<number>();
const listeners = new Set<() => void>();
/** Ids the visitor toggled on this page: a late server snapshot must not undo them. */
const mutated = new Map<number, boolean>();
/** True once the store has answered, so a button can tell "not saved" from "not known yet". */
let ready = false;

function emit() {
  for (const fn of listeners) fn();
}

export function subscribeSaved(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** `unknown` until the first load answers: the page is cached, so the server has no value. */
export type SavedState = 'unknown' | 'saved' | 'not-saved';

export const savedState = (projectId: number): SavedState => (ready ? (saved.has(projectId) ? 'saved' : 'not-saved') : 'unknown');

export function setSaved(projectId: number, on: boolean, local = true) {
  if (local) mutated.set(projectId, on);
  if (on) saved.add(projectId);
  else saved.delete(projectId);
  // The visitor just said what the state is, so it is known from here on.
  ready = true;
  emit();
}

let loading: Promise<void> | null = null;
/** Bumped when the account changes: a load started for an older account must not write. */
let generation = 0;

/** Loads the saved ids once per page. A failure leaves every project unsaved. */
export function loadSaved(): Promise<void> {
  loading ??= (async () => {
    const mine = generation;
    try {
      await initAuth();
      if (useAuthStore.getState().status !== 'authed') return;
      const items = await watchlist();
      if (mine !== generation) return;
      for (const item of items) saved.add(item.project_id);
    } catch {
      // Signed out, offline, or the route failed: nothing is known to be saved.
    } finally {
      if (mine === generation) {
        for (const [id, on] of mutated) {
          if (on) saved.add(id);
          else saved.delete(id);
        }
        ready = true;
        emit();
      }
    }
  })();
  return loading;
}

// Another account signed in, or the session ended: the last account's list is not theirs.
useAuthStore.subscribe((state, previous) => {
  const was = previous.session?.user.id ?? null;
  const now = state.session?.user.id ?? null;
  if (was === now) return;
  // The first session to settle on a page: the pending load reads it after initAuth.
  if (!was && !ready && loading) return;
  generation += 1;
  loading = null;
  mutated.clear();
  saved.clear();
  ready = false;
  emit();
  // The new account's list is not known yet either; ask for it.
  void loadSaved();
});

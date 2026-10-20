/**
 * Checklist state in localStorage, under the old site's keys so saved ticks
 * carry over. useSyncExternalStore gives the server snapshot (empty) during
 * hydration, then the saved values.
 */
import { useSyncExternalStore } from 'react';

const EMPTY = {};
const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();

function read<T>(key: string): T {
  if (!cache.has(key)) {
    try {
      cache.set(key, JSON.parse(localStorage.getItem(key) ?? '{}') ?? {});
    } catch {
      cache.set(key, {});
    }
  }
  return cache.get(key) as T;
}

export function write<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the ticks still work for this visit.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useStored<T extends object>(key: string): T {
  return useSyncExternalStore(
    subscribe,
    () => read<T>(key),
    () => EMPTY as T,
  );
}

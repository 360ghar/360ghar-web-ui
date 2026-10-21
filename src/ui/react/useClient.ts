import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * False during the server render and hydration, true after. Use it to read
 * browser-only values without a hydration mismatch (and without setState in an effect).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

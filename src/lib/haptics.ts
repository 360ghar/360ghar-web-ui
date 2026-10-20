/**
 * A short buzz on phones that support it, for discrete confirmations only:
 * a home saved, a visit booked, a form sent. Not for scrolling, hovering or
 * every tap. Silent (returns false) when the browser has no `vibrate`
 * (iOS Safari, desktop), when the person prefers reduced motion, or when the
 * call throws.
 */

/** Durations in ms. v1 used 20 (light) and 50, 100, 50 (success). */
const PATTERNS: Record<'tap' | 'success', number[]> = { tap: [20], success: [50, 100, 50] };

export type HapticKind = keyof typeof PATTERNS;

type Env = { navigator?: Pick<Navigator, 'vibrate'> | { vibrate?: undefined }; matchMedia?: (q: string) => { matches: boolean } };

export function haptic(kind: HapticKind, env: Env = globalThis as unknown as Env): boolean {
  try {
    const vibrate = env.navigator?.vibrate;
    if (typeof vibrate !== 'function') return false;
    if (env.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    return vibrate.call(env.navigator, PATTERNS[kind]);
  } catch {
    return false;
  }
}

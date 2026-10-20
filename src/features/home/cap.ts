/**
 * Resolves with `fallback` when `p` is slower than `ms` or rejects, so a slow
 * upstream can add at most `ms` to a render. `p` keeps running: when it is a
 * `memo()` promise, the next render finds the result in the cache.
 */
export function capped<T, F = null>(p: Promise<T>, ms: number, fallback: F = null as F): Promise<T | F> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<F>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([p.catch(() => fallback), late]).finally(() => clearTimeout(timer));
}

/**
 * Small in-memory cache for server renders (per function instance). Use it for
 * reference data that changes rarely, such as the amenity list.
 * The in-flight promise is cached too, so concurrent cold requests share one
 * fetch. A rejected fetch is dropped, so the next call tries again.
 */
type Entry = { at: number; promise: Promise<unknown> };
const store = new Map<string, Entry>();

export async function memo<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.promise as Promise<T>;
  // `at` is Infinity while the fetch runs (the entry never expires), and the resolve time after.
  const entry: Entry = { at: Number.POSITIVE_INFINITY, promise: Promise.resolve().then(fn) };
  store.set(key, entry);
  entry.promise.then(
    () => {
      entry.at = Date.now();
    },
    () => {
      if (store.get(key) === entry) store.delete(key);
    },
  );
  return entry.promise as Promise<T>;
}

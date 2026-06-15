import { useEffect, useState } from 'react';

/**
 * Lazily loads the (464 KB) localities index chunk on demand.
 *
 * The JSON is split into its own chunk by `manualChunks` in vite.config.js, but
 * because `utils/internalLinks.js` statically imported it, the chunk was being
 * pulled into every page that used any internalLinks helper. This hook keeps the
 * index out of the initial bundle: it dynamic-imports the chunk on first use and
 * caches it for the lifetime of the page.
 *
 * Returns `{ data, loading }`. `data` is the index array once loaded, or `null`
 * while loading. Callers should render a lightweight fallback (or nothing) until
 * `data` is available — these localities are always below-the-fold cross-links.
 */
let cachedPromise = null;
let cachedData = null;

function loadLocalitiesIndex() {
  if (cachedData) return Promise.resolve(cachedData);
  if (!cachedPromise) {
    cachedPromise = import('../data/localities-index.json')
      .then((mod) => {
        cachedData = mod.default;
        return cachedData;
      })
      .catch((err) => {
        cachedPromise = null; // allow retry on failure
        console.error('Failed to load localities index', err);
        return [];
      });
  }
  return cachedPromise;
}

export function useLocalitiesIndex() {
  const [data, setData] = useState(cachedData);

  useEffect(() => {
    if (data) return; // already loaded
    let active = true;
    loadLocalitiesIndex().then((index) => {
      if (active) setData(index);
    });
    return () => { active = false; };
  }, [data]);

  return { data: data || [], loading: !data };
}

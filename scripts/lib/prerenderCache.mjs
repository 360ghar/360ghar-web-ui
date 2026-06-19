/**
 * Content-hash cache for prerendered HTML.
 *
 * Goal: on a build where the bundle + per-route inputs are unchanged, skip the
 * Puppeteer render entirely and copy the previously-rendered HTML out of the
 * cache into dist/. Netlify persists `node_modules/.cache` across builds, so
 * the default cache dir lives there and survives deploys with no plugin
 * configuration.
 *
 * Cache key (per route) = sha256 over:
 *   - viteHash   (dist/.vite-build-hash, written by vite.config.js closeBundle)
 *   - routeDataHash (sha256 of the route's slice of the bulk-data bundle, or
 *                   the literal "no-data" when no slice applies)
 *   - routeConfig JSON (route + waitForSelector/Text/Title)
 *   - scriptVersionHash (sha256 of the algorithm source files, so an
 *                        algorithm change busts every entry)
 *
 * Everything is best-effort: any read/parse/copy error falls back to "miss"
 * and the caller renders normally. The cache never blocks a successful build.
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, copyFile, stat, rm } from 'node:fs/promises';
import nodePath from 'node:path';

export const DEFAULT_CACHE_DIR = nodePath.resolve(
  process.cwd(),
  process.env.PRERENDER_CACHE_DIR || 'node_modules/.cache/prerender-html'
);

const MANIFEST_VERSION = 1;

/**
 * Compute a stable hash of the given source files. Missing files are hashed
 * as empty strings so the value is stable whether or not a file exists yet.
 */
export async function computeScriptVersionHash(files) {
  const hash = createHash('sha256');
  for (const file of files) {
    let content = '';
    try {
      content = await readFile(file, 'utf-8');
    } catch {
      content = '';
    }
    hash.update(`${file}\0${content}\0`);
  }
  return hash.digest('hex');
}

/**
 * Read dist/.vite-build-hash (written by the vite build). Returns null when
 * absent so callers can degrade to "always render".
 */
export async function readViteBuildHash(distDir) {
  try {
    const raw = await readFile(nodePath.join(distDir, '.vite-build-hash'), 'utf-8');
    const trimmed = raw.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * Stable JSON stringify (sorted object keys) for deterministic hashing.
 */
function stableStringify(value) {
  try {
    return JSON.stringify(sortKeys(value));
  } catch {
    return String(value);
  }
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeys(value[key]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Hash the data slice a route will consume from the bulk bundle. `routeData`
 * is whatever the caller extracted for this route (already JSON-serializable),
 * or null/undefined when the route has no data slice.
 */
export function hashRouteData(routeData) {
  if (routeData === null || routeData === undefined) return 'no-data';
  return createHash('sha256').update(stableStringify(routeData)).digest('hex');
}

function buildInputHash({ viteHash, routeDataHash, routeConfig, scriptVersionHash }) {
  const payload = stableStringify({
    v: MANIFEST_VERSION,
    viteHash: viteHash || null,
    routeDataHash,
    routeConfig: sortKeys(routeConfig),
    scriptVersionHash,
  });
  return createHash('sha256').update(payload).digest('hex');
}

async function readManifest(cacheDir) {
  try {
    const raw = await readFile(nodePath.join(cacheDir, 'manifest.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.routes && typeof parsed.routes === 'object' && !Array.isArray(parsed.routes)) return parsed;
  } catch {
    // missing or corrupt -> treat as empty
  }
  return { version: MANIFEST_VERSION, viteHash: null, routes: {} };
}

/**
 * Create a cache controller bound to a cache directory and base inputs.
 *
 * @param {object} opts
 * @param {string} opts.cacheDir      Absolute cache directory.
 * @param {string|null} opts.viteHash Vite build hash (or null).
 * @param {string} opts.scriptVersionHash  Algorithm source hash.
 * @param {boolean} [opts.disabled]   When true, every check is a forced miss.
 */
export function createPrerenderCache({
  cacheDir = DEFAULT_CACHE_DIR,
  viteHash = null,
  scriptVersionHash,
  disabled = false,
} = {}) {
  let manifestPromise = null;
  const manifestPath = () => nodePath.join(cacheDir, 'manifest.json');
  const routeCachePath = (inputHash) => nodePath.join(cacheDir, 'routes', `${inputHash}.html`);

  const getManifest = () => {
    if (!manifestPromise) {
      manifestPromise = disabled
        ? Promise.resolve({ version: MANIFEST_VERSION, viteHash, routes: {} })
        : readManifest(cacheDir);
    }
    return manifestPromise;
  };

  /**
   * Returns a cached HTML string for the route if the inputs match and the
   * cached file exists, else null (miss).
   */
  async function lookup(routeConfig, routeData) {
    if (disabled) return null;
    const routeDataHash = hashRouteData(routeData);
    const inputHash = buildInputHash({
      viteHash,
      routeDataHash,
      routeConfig,
      scriptVersionHash,
    });
    const manifest = await getManifest();
    const entry = manifest.routes[routeConfig.route];
    if (!entry || entry.inputHash !== inputHash) return null;
    const cachedPath = routeCachePath(inputHash);
    try {
      await stat(cachedPath);
    } catch {
      return null;
    }
    try {
      return await readFile(cachedPath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * Persist a freshly-rendered HTML string for the route under its inputHash.
   */
  async function store(routeConfig, routeData, html) {
    if (disabled) return;
    const routeDataHash = hashRouteData(routeData);
    const inputHash = buildInputHash({
      viteHash,
      routeDataHash,
      routeConfig,
      scriptVersionHash,
    });
    const cachedPath = routeCachePath(inputHash);
    try {
      await mkdir(nodePath.dirname(cachedPath), { recursive: true });
      await writeFile(cachedPath, html, 'utf-8');
    } catch {
      // best-effort
      return;
    }
    const manifest = await getManifest();
    manifest.routes[routeConfig.route] = { inputHash, updatedAt: Date.now() };
    manifest.version = MANIFEST_VERSION;
    manifest.viteHash = viteHash;
  }

  /**
   * Flush the (possibly mutated) manifest to disk.
   */
  async function flush() {
    if (disabled) return;
    const manifest = await getManifest();
    try {
      await mkdir(cacheDir, { recursive: true });
      await writeFile(manifestPath(), JSON.stringify(manifest, null, 2), 'utf-8');
    } catch {
      // best-effort
    }
  }

  /**
   * Remove every cached file (used by `--clear-cache`). Swallows errors.
   */
  async function clear() {
    try {
      await rm(cacheDir, { recursive: true, force: true });
    } catch {
      // best-effort
    } finally {
      manifestPromise = null;
    }
  }

  return { lookup, store, flush, clear, get cacheDir() { return cacheDir; } };
}

export { buildInputHash };

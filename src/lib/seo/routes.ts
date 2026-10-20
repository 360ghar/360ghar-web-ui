/**
 * The route table of src/pages, for tests and scripts that check URLs against real routes.
 * Node only (reads the file system). The Hindi copies in src/pages/hi are ignored: /hi/x resolves as /x.
 */
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type PageRoute = { file: string; pattern: RegExp; dynamic: number; literal: number; catchAll: boolean };

const PAGES = fileURLToPath(new URL('../../pages/', import.meta.url));
const SKIP = [/^hi\//, /^_/];

function walk(dir: string, base = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}${e.name}/`, `${base}${e.name}/`) : [`${base}${e.name}`]));
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|\\]/g, '\\$&');

function toRoute(file: string): PageRoute {
  const noExt = file.replace(/\.(astro|ts)$/, '');
  const parts = noExt.split('/');
  if (parts.at(-1) === 'index') parts.pop();
  let dynamic = 0;
  let catchAll = false;
  let literal = 0;
  const re = parts.map((seg) => {
    if (/^\[\.\.\.\w+\]$/.test(seg)) {
      catchAll = true;
      dynamic += 1;
      return '.+';
    }
    return seg
      .split(/(\[\w+\])/)
      .map((piece) => {
        if (/^\[\w+\]$/.test(piece)) {
          dynamic += 1;
          return '[^/]+';
        }
        literal += piece.length;
        return escapeRe(piece);
      })
      .join('');
  });
  return { file, pattern: new RegExp(`^/${re.join('/')}$`), dynamic, literal, catchAll };
}

let cache: PageRoute[] | null = null;

export function pageRoutes(): PageRoute[] {
  cache ??= walk(PAGES)
    .filter((f) => /\.(astro|ts)$/.test(f) && !SKIP.some((re) => re.test(f)))
    .map(toRoute);
  return cache;
}

/** The English path of a URL or path: no origin, query, hash, /hi prefix or trailing slash. */
export function englishPath(urlOrPath: string): string {
  const path = urlOrPath.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0] || '/';
  const noHi = path === '/hi' ? '/' : path.replace(/^\/hi(?=\/)/, '');
  return noHi.length > 1 ? noHi.replace(/\/+$/, '') : noHi;
}

/** The most specific route file for a path (fewest dynamic parts, then most literal text; no catch-all), or null. `fixed: true` skips dynamic routes. */
export function resolveRoute(urlOrPath: string, opts: { fixed?: boolean } = {}): PageRoute | null {
  const path = englishPath(urlOrPath);
  const hits = pageRoutes()
    .filter((r) => !r.catchAll && (!opts.fixed || r.dynamic === 0) && r.pattern.test(path))
    .sort((a, b) => a.dynamic - b.dynamic || b.literal - a.literal);
  return hits[0] ?? null;
}

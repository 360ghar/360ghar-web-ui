/**
 * Mirrors every English route in src/pages into src/pages/hi, so /hi/<route>
 * exists for each page. Route files are thin and read the locale from the URL,
 * so the copies are identical. src/pages/hi is generated and git-ignored.
 *
 * Skipped: endpoints (sitemaps, feeds, robots, well-known files, the /art/
 * drawings), the 404 page and internal pages. Their names are listed in SKIP.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = join(root, 'src/pages');
const out = join(pages, 'hi');

const SKIP = [/^hi\//, /^404\.astro$/, /^\[\.\.\.path\]\.astro$/, /^500\.astro$/, /^styleguide/, /^lab\//, /^api\//, /\.(xml|txt|json|js|svg)\.ts$/, /^art\//, /^\.well-known\//, /^_/];

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const wanted = new Set();
for (const file of walk(pages)) {
  const rel = relative(pages, file).split('\\').join('/');
  if (SKIP.some((re) => re.test(rel))) continue;
  if (!/\.(astro|ts)$/.test(rel)) continue;
  wanted.add(rel);
  const target = join(out, rel);
  const src = readFileSync(file, 'utf8');
  if (/from\s+['"]\.\.?\//.test(src) || /import\(['"]\.\.?\//.test(src)) {
    console.error(`sync-hi-routes: ${rel} uses a relative import. Route files must import with "@/".`);
    process.exit(1);
  }
  if (existsSync(target) && readFileSync(target, 'utf8') === src) continue;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, src);
}

// Remove Hindi copies whose English source is gone.
if (existsSync(out)) {
  for (const file of walk(out)) {
    const rel = relative(out, file).split('\\').join('/');
    if (!wanted.has(rel)) rmSync(file);
  }
}

console.log(`sync-hi-routes: ${wanted.size} routes mirrored under /hi`);

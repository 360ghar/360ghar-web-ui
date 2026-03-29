/**
 * Purges unused Bootstrap CSS rules from the built output.
 * Reduces bootstrap.min.css from ~190KB to ~40-50KB by removing
 * components/utilities that are not used in the application.
 *
 * Run after: vite build
 * Output: dist/assets/css/bootstrap.min.css (purged, compressed)
 */
import { PurgeCSS } from 'purgecss';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_CSS = join(ROOT, 'public', 'assets', 'css', 'bootstrap.min.css');
const DIST_CSS = join(ROOT, 'dist', 'assets', 'css', 'bootstrap.min.css');
const DIST_DIR = join(ROOT, 'dist');

if (!existsSync(DIST_DIR)) {
  console.log('No dist/ directory found, skipping Bootstrap purge.');
  process.exit(0);
}

if (!existsSync(SRC_CSS)) {
  console.log('bootstrap.min.css not found, skipping.');
  process.exit(0);
}

const originalSize = readFileSync(SRC_CSS).length;

console.log(`Purging Bootstrap CSS (original: ${Math.round(originalSize / 1024)}KB)...`);

const [result] = await new PurgeCSS().purge({
  content: [
    join(DIST_DIR, '**', '*.html'),
    join(DIST_DIR, '**', '*.js'),
    // Also scan source JSX for class names (for dev builds)
    join(ROOT, 'src', '**', '*.{jsx,js,tsx,ts}'),
  ],
  css: [SRC_CSS],
  safelist: {
    // Preserve Bootstrap classes that are added dynamically at runtime
    standard: [
      /^show$/,
      /^collapsing$/,
      /^collapse$/,
      /^modal/,
      /^tooltip/,
      /^popover/,
      /^fade$/,
      /^active$/,
      /^disabled$/,
      /^open$/,
      /^btn-/,
      /^form-/,
    ],
    // Preserve pseudo-classes and responsive variants
    greedy: [
      /^col-/,
      /^d-/,
      /^flex-/,
      /^align-/,
      /^justify-/,
      /^gap-/,
      /^g-/,
      /^m[tblrxyse]?-/,
      /^p[tblrxyse]?-/,
      /^text-/,
      /^fw-/,
      /^fs-/,
      /^lh-/,
      /^border/,
      /^rounded/,
      /^position-/,
      /^overflow-/,
      /^w-/,
      /^h-/,
      /^min-/,
      /^max-/,
      /^row$/,
      /^container/,
    ],
  },
});

if (!result || !result.css) {
  console.log('PurgeCSS returned no result, skipping write.');
  process.exit(0);
}

const purgedSize = Buffer.byteLength(result.css, 'utf8');

// Ensure dist/assets/css directory exists
const distCssDir = join(DIST_DIR, 'assets', 'css');
if (!existsSync(distCssDir)) {
  mkdirSync(distCssDir, { recursive: true });
}

writeFileSync(DIST_CSS, result.css);

const saved = originalSize - purgedSize;
console.log(`Bootstrap CSS purged: ${Math.round(originalSize / 1024)}KB → ${Math.round(purgedSize / 1024)}KB (saved ${Math.round(saved / 1024)}KB)`);

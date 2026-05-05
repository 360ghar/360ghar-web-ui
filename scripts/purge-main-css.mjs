/**
 * Purges unused CSS rules from the main entry CSS chunk.
 * The entry chunk (compiled from src/index.scss) includes ~179KB of CSS
 * from public/assets/sass/main.scss plus component styles. PurgeCSS scans
 * all built HTML/JS and source JSX to find used selectors and removes the rest.
 *
 * Run after: vite build
 * Target: dist/assets/index-*.css
 */
import { PurgeCSS } from 'purgecss';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST_DIR = join(ROOT, 'dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');

if (!existsSync(DIST_DIR)) {
  console.log('No dist/ directory found, skipping main CSS purge.');
  process.exit(0);
}

if (!existsSync(ASSETS_DIR)) {
  console.log('No dist/assets/ directory found, skipping main CSS purge.');
  process.exit(0);
}

// Find the main entry CSS chunk (index-[hash].css)
const cssFiles = readdirSync(ASSETS_DIR).filter((f) =>
  /^index-[a-zA-Z0-9_-]+\.css$/.test(f)
);

if (cssFiles.length === 0) {
  console.log('No entry CSS chunk found in dist/assets/, skipping purge.');
  process.exit(0);
}

if (cssFiles.length > 1) {
  console.log(`Found multiple entry CSS chunks: ${cssFiles.join(', ')}. Processing all.`);
}

for (const cssFile of cssFiles) {
  const cssPath = join(ASSETS_DIR, cssFile);
  const originalSize = readFileSync(cssPath).length;

  console.log(`Purging main CSS: ${cssFile} (${Math.round(originalSize / 1024)}KB)...`);

  const [result] = await new PurgeCSS().purge({
    content: [
      join(DIST_DIR, '**', '*.html'),
      join(DIST_DIR, '**', '*.js'),
      join(ROOT, 'src', '**', '*.{jsx,js,tsx,ts}'),
    ],
    css: [cssPath],
    safelist: {
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
        /^slick-/,
        /^Toastify/,
        /^react-tabs/,
        /^yarl/,
        /^lightbox/,
        /^page-loader/,
        /^body-bg/,
        /^text-gradient/,
        /^common-card/,
        /^common-input/,
        /^control-select/,
        /^padding-y-/,
        /^padding-t-/,
        /^padding-b-/,
        /^bg-white/,
        /^bg-light/,
        /^section-heading/,
        /^spinner-/,
        /^alert-/,
        /^badge-/,
        /^dropdown-/,
        /^list-/,
        /^nav-/,
        /^navbar-/,
        /^footer-/,
        /^header-/,
        /^mobile-/,
        /^offcanvas-/,
        /^social-/,
        /^swiper-/,
        /^skeleton-/,
        /^loading-/,
      ],
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
        /^banner-/,
        /^section-/,
        /^property-/,
        /^card/,
        /^btn/,
        /^padding-/,
        /^margin-/,
        /^bg-/,
        /^tab-/,
        /^filter-/,
        /^map-/,
        /^testimonial-/,
        /^counter-/,
        /^blog-/,
        /^faq-/,
        /^message-/,
        /^newsletter-/,
        /^app-/,
        /^review-/,
        /^explore-/,
        /^ai-/,
        /^tool-/,
        /^refer-/,
        /^about-/,
        /^contact-/,
        /^login-/,
        /^register-/,
        /^error-/,
        /^coming-/,
        /^search-/,
        /^sort-/,
        /^pagination-/,
        /^breadcrumb-/,
        /^meta-/,
        /^tag-/,
        /^category-/,
        /^author-/,
        /^date-/,
        /^time-/,
        /^location-/,
        /^price-/,
        /^area-/,
        /^bedroom-/,
        /^bathroom-/,
        /^furnishing-/,
        /^amenity-/,
        /^feature-/,
        /^highlight-/,
        /^status-/,
        /^type-/,
        /^purpose-/,
        /^sort-/,
        /^vr-/,
        /^vr-tour/,
        /^virtual-/,
        /^video-/,
        /^audio-/,
        /^chat-/,
        /^whatsapp-/,
        /^sticky-/,
      ],
    },
  });

  if (!result || !result.css) {
    console.log('PurgeCSS returned no result, skipping write.');
    continue;
  }

  const purgedSize = Buffer.byteLength(result.css, 'utf8');
  writeFileSync(cssPath, result.css);

  const saved = originalSize - purgedSize;
  console.log(
    `Main CSS purged: ${Math.round(originalSize / 1024)}KB → ${Math.round(purgedSize / 1024)}KB (saved ${Math.round(saved / 1024)}KB)`
  );
}

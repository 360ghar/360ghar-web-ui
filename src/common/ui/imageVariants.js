/**
 * Helpers for declaring next-gen image variants consumed by <LazyImage>.
 *
 * Images live in `public/assets/images`, so they are referenced by absolute
 * URL string (not bundled/hashed). Vite's image optimizer therefore never
 * touches them — the `scripts/optimize-images.mjs` build step generates the
 * `.webp` / `.avif` twins and responsive variants ahead of time.
 *
 * Usage in a component:
 *
 *   import { srcSet, responsiveImage } from '../common/ui/imageVariants';
 *
 *   // Full format negotiation (avif → webp → png) + responsive srcsets:
 *   <LazyImage
 *     src="/assets/images/thumbs/team1.png"
 *     {...responsiveImage('thumbs/team1')}
 *     sizes="(max-width: 768px) 100vw, 200px"
 *     width={263} height={284}
 *   />
 *
 *   // Just format twins, no responsive variants:
 *   <LazyImage
 *     src="/assets/images/thumbs/foo.png"
 *     {...formatTwins('thumbs/foo')}
 *   />
 *
 * `responsiveImage` returns { webpSrc, avifSrc, webpSrcSet, avifSrcSet, srcSet }.
 * The original `.png` is passed separately via `src` as the ultimate fallback.
 */

const BASE = '/assets/images';
const RESPONSIVE_WIDTHS = [320, 640, 768, 1024];

/**
 * Build a `srcset` string for a given extension across the responsive widths.
 * Only widths that were generated on disk are included, so missing variants
 * don't produce 404s — callers just get fewer entries.
 */
export function srcSet(ref, ext) {
  // ref is like "thumbs/team1" (no leading slash, no extension)
  const prefix = `${BASE}/${ref}`;
  return RESPONSIVE_WIDTHS
    .map((w) => `${prefix}-${w}w.${ext} ${w}w`)
    .join(', ');
}

/**
 * Format-twin sources only (avif + webp), no responsive variants.
 * Use for images too small to warrant responsive variants.
 */
export function formatTwins(ref) {
  const prefix = `${BASE}/${ref}`;
  return {
    avifSrc: `${prefix}.avif`,
    webpSrc: `${prefix}.webp`,
  };
}

/**
 * Full next-gen + responsive descriptor for a single art-directed image.
 * Returns everything <LazyImage> needs besides the fallback `src`.
 */
export function responsiveImage(ref) {
  const prefix = `${BASE}/${ref}`;
  return {
    avifSrc: `${prefix}.avif`,
    webpSrc: `${prefix}.webp`,
    avifSrcSet: srcSet(ref, 'avif'),
    webpSrcSet: srcSet(ref, 'webp'),
    srcSet: srcSet(ref, 'webp'),
  };
}

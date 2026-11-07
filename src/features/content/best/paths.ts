/**
 * The English-only best-X paths. No imports: tests/e2e/seo-parity.spec.ts loads this file
 * with Playwright's loader, which does not resolve "@/" aliases. The /hi copies of these
 * pages canonicalise to the English URL and carry no hreflang pair.
 */
export const BEST_PATHS: readonly string[] = [
  '/best-real-estate-apps-india',
  '/best-property-sites-gurgaon',
  '/best-ai-real-estate-platforms',
  '/best-property-portals-india',
];

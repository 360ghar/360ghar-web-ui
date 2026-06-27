// Netlify Edge Function: Soft-404 Guard
//
// PURPOSE
//   The SPA catch-all (`/* → /index.html 200` in netlify.toml and public/_redirects)
//   serves HTTP 200 for EVERY path, so public/404.html (which carries noindex)
//   never runs. Google therefore sees the 200 shell for non-existent URLs and
//   classifies them as soft-404s, polluting the index.
//
//   This guard runs at the edge, BEFORE the SPA catch-all. For paths that match
//   NO valid route, it rewrites to /404.html and forces HTTP 404 +
//   `X-Robots-Tag: noindex` so the URL is dropped from the index instead of
//   being treated as a soft-404 duplicate of the homepage.
//
// CONSERVATIVE BY DESIGN
//   False positives (404-ing a real page) are far worse than false negatives
//   (letting a junk URL through as 200). The dynamic-segment regexes below are
//   intentionally PERMISSIVE — e.g. /[^/]{2,40}/ for city slugs, /[^/]+/ for
//   content slugs — so that NO valid dynamic route is ever 404'd. When in doubt,
//   the guard allows the request through to the normal SPA fallback.

// ── Valid route grammar (mirrors src/App.jsx routeGroups) ──────────────────
// Static routes — exact literals from App.jsx contentRoutes/accountRoutes/
// propertyRoutes/toolRoutes/dataHubRoutes/comparisonRoutes/truthRoutes/
// careersRoutes. Order does not matter; joined into one alternation.
const STATIC_ROUTES = [
  // content / core
  '', // root index ("/"), handled separately
  'about-us',
  'faq',
  'project',
  'blog',
  'contact',
  'policies',
  'gurugram-real-estate-guide',
  'property-investment-gurugram',
  'refer-and-earn',
  'for-ai',
  'ai-agent',
  'celebrity-homes',
  'nri-property-guide',
  'list-property-free',
  'glossary',
  'links',
  'localities',
  // account
  'login',
  'mcp/login',
  'register',
  'account',
  'delete-account',
  'forgot-password',
  'reset-password',
  'auth/callback',
  'add-phone',
  'profile-completion',
  // property
  'properties',
  'property-sidebar',
  'add-new-listing',
  'post-property',
  'map-location',
  // tools
  'tools',
  'emi-calculator',
  'area-converter',
  'loan-eligibility-calculator',
  'area-calculator',
  'property-document-checklist',
  'capital-gains-tax-calculator',
  'design-blueprint',
  'vastu-checker',
  'ai-design-studio',
  'check-fake-listing',
  'rent-receipt',
  'mofa-to-rera-converter',
  'sq-ft-calculator',
  'acre-in-gaj',
  // data hub
  'circle-rates',
  'stamp-duty-calculator',
  'rera-projects',
  'bank-auctions',
  'auction-sources',
  'verify-ownership',
  'zone-checker',
  'regulatory-updates',
  'builder-reputation',
  // comparison (static set under /vs/)
  'vs/nobroker',
  'vs/magicbricks',
  'vs/99acres',
  'vs/housing',
  'vs/commonfloor',
  'vs/proptiger',
  'vs/squareyards',
  'vs/nestaway',
  'vs/zolo',
  'vs/stanza-living',
  // truth pages
  'truth/nobroker-listings',
  'truth/magicbricks-spam',
  'truth/99acres-fake',
  'truth/nestaway-collapse',
  'truth/zolo-issues',
  // careers
  'careers',
];

// Dynamic routes — one regex per grammar rule. Segments are deliberately
// permissive (see CONSERVATIVE BY DESIGN above). Anchored at ^...$ by the
// matcher. NOTE: locale prefix is stripped before matching (see normalize()).
const DYNAMIC_ROUTES = [
  // /property/:id            — numeric id
  /^\/property\/[^/]+\/?$/,
  // /property/:id/virtual-tour
  /^\/property\/[^/]+\/virtual-tour\/?$/,
  // /project/:slug
  /^\/project\/[^/]+\/?$/,
  // /blog/:slug
  /^\/blog\/[^/]+\/?$/,
  // /policies/:slug
  /^\/policies\/[^/]+\/?$/,
  // /locality/:slug  and  /locality/:slug/:intent
  /^\/locality\/[^/]+\/?$/,
  /^\/locality\/[^/]+\/[^/]+\/?$/,
  // /circle-rate/:slug, /zone-checker/:slug, /builder-reputation/:slug,
  // /bank-auctions/:id, /price-index/:citySlug
  /^\/circle-rate\/[^/]+\/?$/,
  /^\/zone-checker\/[^/]+\/?$/,
  /^\/builder-reputation\/[^/]+\/?$/,
  /^\/bank-auctions\/[^/]+\/?$/,
  /^\/price-index\/[^/]+\/?$/,
  // /careers/:slug
  /^\/careers\/[^/]+\/?$/,
  // /near/:slug
  /^\/near\/[^/]+\/?$/,
  // Programmatic SEO — /:citySlug/:intent/:type  (+ facet variants)
  // citySlug: 2–40 chars (permissive); intent: buy|rent|pg only would be too
  // strict for the guard, so we accept any single segment here and let the
  // landing page decide indexability. Conservative: allow any non-empty value.
  /^\/[^/]{2,40}\/[^/]+\/[^/]+\/?$/,
  // Facet variants:
  //   /:citySlug/:intent/:type/:bhk
  //   /:citySlug/:intent/:type/budget/:budget
  //   /:citySlug/:intent/:type/amenity/:amenity
  /^\/[^/]{2,40}\/[^/]+\/[^/]+\/[^/]+\/?$/,
  /^\/[^/]{2,40}\/[^/]+\/[^/]+\/budget\/[^/]+\/?$/,
  /^\/[^/]{2,40}\/[^/]+\/[^/]+\/amenity\/[^/]+\/?$/,
  // /:citySlug  (CityHub) — single segment, 2–40 chars, NOT a static route.
  // Matched last by the matcher (see below) so statics win.
  /^\/[^/]{2,40}\/?$/,
];

// Build one anchored regex for the static set (escaped). Root "/" handled by
// the matcher as a special case.
const STATIC_RE = new RegExp(
  '^/(?:' + STATIC_ROUTES.filter(Boolean).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')/?$'
);

// ── Static / asset passthrough (never intercept) ───────────────────────────
// Exact file names (no extension match needed) and path prefixes.
const EXACT_PASSTHROUGH = new Set([
  '/robots.txt',
  '/llms.txt',
  '/manifest.json',
  '/sw.js',
  '/registerSW.js',
]);

const PREFIX_PASSTHROUGH = [
  '/assets/',
  '/.well-known/',
  '/data/',
  '/api/',
  '/blueprint3d/',
  '/rss/',
];

// Anything with a file extension falls through to Netlify's static handler
// (so a missing /assets/foo.png becomes a real 404, not the SPA shell).
// /.well-known/* is explicitly excluded from this extension test.
const EXTENSION_RE = /\.(?!well-known)[a-z0-9]{1,8}$/i;

function isPassthrough(pathname) {
  if (EXACT_PASSTHROUGH.has(pathname)) return true;
  if (pathname.startsWith('sitemap')) return true; // /sitemap.xml, /sitemap-static.xml, ...
  if (pathname.startsWith('/workbox-')) return true;
  for (const prefix of PREFIX_PASSTHROUGH) {
    if (pathname.startsWith(prefix)) return true;
  }
  if (EXTENSION_RE.test(pathname)) return true;
  return false;
}

// Strip an optional /hi locale prefix and trailing slashes so the same route
// grammar matches both en and hi variants.
function normalize(pathname) {
  let p = pathname;
  if (p === '/hi' || p === '/hi/') return '/';
  if (p.startsWith('/hi/')) p = p.slice(3); // → "/..."
  // collapse trailing slashes (but keep root "/")
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p;
}

function isValidRoute(normalizedPath) {
  if (normalizedPath === '/' || normalizedPath === '') return true;
  if (STATIC_RE.test(normalizedPath)) return true;
  for (const re of DYNAMIC_ROUTES) {
    if (re.test(normalizedPath)) return true;
  }
  return false;
}

export default async (_request, context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. Static assets, API, well-known, sitemaps, service worker, and any
  //    extensioned request: never intercept — let Netlify handle them.
  if (isPassthrough(pathname)) {
    return context.next();
  }

  // 2. Normalize (strip /hi prefix + trailing slashes), then test the
  //    valid-route allowlist.
  const normalizedPath = normalize(pathname);
  if (isValidRoute(normalizedPath)) {
    return context.next();
  }

  // 3. Nothing matched → serve 404.html with HTTP 404 + noindex so Google
  //    drops the URL instead of flagging the 200 shell as a soft-404.
  const notFoundUrl = new URL('/404.html', url.origin);
  const resp = await context.rewrite(notFoundUrl);
  return new Response(resp.body, {
    status: 404,
    statusText: 'Not Found',
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  });
};

export const config = {
  path: '/*',
  excludedPath: [
    '/assets/*',
    '/.well-known/*',
    '/data/*',
    '/api/*',
    '/blueprint3d/*',
    '/rss/*',
  ],
};

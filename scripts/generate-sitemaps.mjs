#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {
  approvedIndexableCitySlugs,
  indexableStaticRoutes,
  indexableBudgetFacets,
} from '../src/seo/indexationPolicy.js';

const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';
const outDir = path.resolve(process.cwd(), 'public');

// Phased release: limit landing URLs per city to avoid dumping too many pages at once
const SITEMAP_MAX_LANDING_PER_CITY = parseInt(process.env.SITEMAP_MAX_LANDING_PER_CITY || '0', 10) || 0; // 0 = no limit
const SITEMAP_BATCH = parseInt(process.env.SITEMAP_BATCH || '0', 10) || 0;

// Pruning: load prune list if available
const pruneListPath = path.resolve(process.cwd(), 'src', 'data', 'pseo-prune-list.json');
let prunedPatterns = [];
if (fs.existsSync(pruneListPath)) {
  try {
    prunedPatterns = JSON.parse(fs.readFileSync(pruneListPath, 'utf8'));
  } catch { prunedPatterns = []; }
}

const isPruned = (urlPath) => prunedPatterns.some((pattern) => {
  if (typeof pattern !== 'string') return false;
  if (pattern.startsWith('/') && pattern.endsWith('/*')) {
    return urlPath.startsWith(pattern.slice(0, -1));
  }
  if (pattern.startsWith('/')) return urlPath === pattern;
  try { return new RegExp(pattern).test(urlPath); } catch { return false; }
});

const writeFile = (p, content) => {
  fs.writeFileSync(p, content, 'utf8');
  console.log(`Wrote ${p}`);
};

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';

const URLSET_NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"';

const urlTag = (loc, lastmod, changefreq, priority, alternates) => {
  const altTags = (alternates || []).map(
    (a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`
  ).join('\n');
  return `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}${changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ''}${priority ? `    <priority>${priority}</priority>\n` : ''}${altTags ? `${altTags}\n` : ''}  </url>`;
};

/** Build hreflang alternates for an English path. */
const buildAlternates = (enPath) => [
  { hreflang: 'en', href: `${SITE_URL}${enPath}` },
  { hreflang: 'hi', href: `${SITE_URL}/hi${enPath === '/' ? '' : enPath}` },
  { hreflang: 'x-default', href: `${SITE_URL}${enPath}` },
];

const slug = (s) => String(s || '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

const staticRoutes = [...indexableStaticRoutes];

const REDIRECT_PATTERNS = [
  { pattern: '/gurugram/', reason: 'gurugram→gurgaon redirect' },
  { pattern: '/apartments', reason: 'apartments→flats redirect' },
];

function validateSitemapUrl(urlPath) {
  for (const { pattern, reason } of REDIRECT_PATTERNS) {
    if (urlPath.includes(pattern)) {
      console.warn(`[sitemap] Skipping redirected URL: ${urlPath} (${reason})`);
      return false;
    }
  }
  return true;
}

// Cities and facets for programmatic landing pages
const cities = approvedIndexableCitySlugs.map((citySlug) => ({
  slug: citySlug,
  label: citySlug === 'gurgaon'
    ? 'Gurgaon'
    : citySlug.replace(/\b\w/g, (char) => char.toUpperCase()),
}));

const intents = [
  { key: 'buy', label: 'Buy' },
  { key: 'rent', label: 'Rent' },
  { key: 'pg', label: 'PG' },
];

const types = [
  { key: 'flats', label: 'Flats' },
  { key: 'independent-house', label: 'Independent House' },
  { key: 'builder-floor', label: 'Builder Floor' },
  { key: 'villa', label: 'Villa' },
  { key: 'plots', label: 'Plots' },
  { key: 'land', label: 'Land' },
  { key: 'office-space', label: 'Office Space' },
  { key: 'shop', label: 'Shop' },
];

// BHK facets for approved cities (buy/rent only)
const bhkFacets = ['1-bhk', '2-bhk', '3-bhk'];

// Build landing URLs: /city/intent/type
const landingUrls = [];
for (const city of cities) {
  const citySlug = slug(city.slug);

  // City hub page
  landingUrls.push(`/${citySlug}`);

  const cityUrls = [];
  for (const intent of intents) {
    for (const t of types) {
      // Skip irrelevant combinations (e.g., PG with office-space)
      if (intent.key === 'pg' && t.key !== 'flats') continue;
      cityUrls.push(`/${citySlug}/${intent.key}/${t.key}`);

      // Add BHK facet URLs for buy/rent flats
      if (['buy', 'rent'].includes(intent.key) && t.key === 'flats') {
        for (const bhk of bhkFacets) {
          cityUrls.push(`/${citySlug}/${intent.key}/${t.key}/${bhk}`);
        }
        // Add budget facet URLs
        for (const bf of indexableBudgetFacets) {
          if (slug(bf.city) === citySlug && bf.intent === intent.key) {
            cityUrls.push(`/${citySlug}/${intent.key}/${t.key}/budget/${bf.budget}`);
          }
        }
      }
    }
  }

  // Apply per-city limit if configured
  const limitedCityUrls = SITEMAP_MAX_LANDING_PER_CITY > 0
    ? cityUrls.slice(0, SITEMAP_MAX_LANDING_PER_CITY)
    : cityUrls;

  if (SITEMAP_MAX_LANDING_PER_CITY > 0 && cityUrls.length > SITEMAP_MAX_LANDING_PER_CITY) {
    console.log(`City ${citySlug}: limiting ${cityUrls.length} landing URLs to ${SITEMAP_MAX_LANDING_PER_CITY}`);
  }

  landingUrls.push(...limitedCityUrls);
}

// Filter out pruned URLs
const filteredLandingUrls = landingUrls.filter((u) => !isPruned(u));
const prunedCount = landingUrls.length - filteredLandingUrls.length;
if (prunedCount > 0) {
  console.log(`Pruned ${prunedCount} URLs from landing sitemap`);
}

// Generate sitemap-static.xml — includes both English and Hindi URLs with hreflang alternates
const staticXml = [
  xmlHeader,
  `<urlset ${URLSET_NS}>`,
  ...staticRoutes
    .filter((r) => !isPruned(r) && validateSitemapUrl(r))
    .flatMap((r) => {
      const alts = buildAlternates(r);
      const priority = r === '/' ? '1.0' : '0.7';
      const changefreq = r === '/' ? 'daily' : 'weekly';
      const hiPath = r === '/' ? '/hi' : `/hi${r}`;
      if (isPruned(hiPath)) {
        return [urlTag(`${SITE_URL}${r}`, null, changefreq, priority, alts)];
      }
      return [
        urlTag(`${SITE_URL}${r}`, null, changefreq, priority, alts),
        urlTag(`${SITE_URL}${hiPath}`, null, changefreq, priority, alts),
      ];
    }),
  '</urlset>\n',
].join('\n');

// Generate sitemap-landing.xml — includes both English and Hindi URLs with hreflang alternates
const today = new Date().toISOString().split('T')[0];
const landingXml = [
  xmlHeader,
  `<urlset ${URLSET_NS}>`,
  ...filteredLandingUrls.filter(validateSitemapUrl).flatMap((r) => {
    const isHub = /^\/[a-z]+$/.test(r);
    const isBhkFacet = /\/\d-bhk$/.test(r);
    const priority = isHub ? '0.9' : isBhkFacet ? '0.75' : '0.8';
    const changefreq = isHub ? 'daily' : 'weekly';
    const alts = buildAlternates(r);
    const hiPath = `/hi${r}`;
    if (isPruned(hiPath)) {
      return [urlTag(`${SITE_URL}${r}`, today, changefreq, priority, alts)];
    }
    return [
      urlTag(`${SITE_URL}${r}`, today, changefreq, priority, alts),
      urlTag(`${SITE_URL}${hiPath}`, today, changefreq, priority, alts),
    ];
  }),
  '</urlset>\n',
].join('\n');

// Write files
writeFile(path.join(outDir, 'sitemap-static.xml'), staticXml);
writeFile(path.join(outDir, 'sitemap-landing.xml'), landingXml);

// Compose sitemap index
const indexXml = [
  xmlHeader,
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <sitemap>\n    <loc>${SITE_URL}/sitemap-static.xml</loc>\n  </sitemap>`,
  `  <sitemap>\n    <loc>${SITE_URL}/sitemap-landing.xml</loc>\n  </sitemap>`,
  `  <sitemap>\n    <loc>${SITE_URL}/sitemap-localities.xml</loc>\n  </sitemap>`,
  '</sitemapindex>\n',
].join('\n');

writeFile(path.join(outDir, 'sitemap.xml'), indexXml);

console.log(`Sitemaps generated. Landing URLs: ${filteredLandingUrls.length} English + ${filteredLandingUrls.length} Hindi (${prunedCount} pruned)`);
if (SITEMAP_BATCH > 0) {
  console.log(`Batch mode: ${SITEMAP_BATCH}, Max per city: ${SITEMAP_MAX_LANDING_PER_CITY || 'unlimited'}`);
}

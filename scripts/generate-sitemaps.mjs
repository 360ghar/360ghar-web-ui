#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import {
  approvedIndexableCitySlugs,
  indexableStaticRoutes,
} from '../src/seo/indexationPolicy.js';

const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';
const outDir = path.resolve(process.cwd(), 'public');

const writeFile = (p, content) => {
  fs.writeFileSync(p, content, 'utf8');
  console.log(`Wrote ${p}`);
};

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';

const urlTag = (loc, lastmod, changefreq, priority) => `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}${changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ''}${priority ? `    <priority>${priority}</priority>\n` : ''}  </url>`;

const slug = (s) => String(s || '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

const staticRoutes = [...indexableStaticRoutes];

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

// Build landing URLs: /city/intent/type
const landingUrls = [];
for (const city of cities) {
  const citySlug = slug(city.slug);
  for (const intent of intents) {
    for (const t of types) {
      // Skip irrelevant combinations (e.g., PG with office-space)
      if (intent.key === 'pg' && t.key !== 'flats') continue;
      const u = `/${citySlug}/${intent.key}/${t.key}`;
      landingUrls.push(u);
    }
  }
}

// Generate sitemap-static.xml
const staticXml = [
  xmlHeader,
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes.map((r) => urlTag(`${SITE_URL}${r}`, null, r === '/' ? 'daily' : 'weekly', r === '/' ? '1.0' : '0.7')),
  '</urlset>\n',
].join('\n');

// Generate sitemap-landing.xml
const landingXml = [
  xmlHeader,
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...landingUrls.map((r) => urlTag(`${SITE_URL}${r}`, null, 'daily', '0.8')),
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

console.log('Sitemaps generated.');

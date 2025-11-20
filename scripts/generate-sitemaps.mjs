#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';
const outDir = path.resolve(process.cwd(), 'public');

const writeFile = (p, content) => {
  fs.writeFileSync(p, content, 'utf8');
  console.log(`Wrote ${p}`);
};

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';

const urlTag = (loc, lastmod, changefreq, priority) => `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}${changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ''}${priority ? `    <priority>${priority}</priority>\n` : ''}  </url>`;

const today = new Date().toISOString();

const slug = (s) => String(s || '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

// Static important routes (no query params)
const staticRoutes = [
  '/',
  '/properties',
  '/emi-calculator',
  '/about-us',
  '/contact',
  '/faq',
  '/project',
  '/blog',
  '/policies',
  // Real estate specific content pages
  '/gurugram-real-estate-guide',
  '/buy-property-gurugram',
  '/rent-property-gurugram',
  '/pg-gurugram',
  '/property-investment-gurugram',
  '/real-estate-trends-gurugram',
  '/property-prices-gurugram',
  '/virtual-property-tours',
  '/for-ai',
];

// Cities and facets for programmatic landing pages
const cities = [
  'Gurugram', 'Gurgaon', 'Delhi', 'Noida', 'Ghaziabad', 'Faridabad',
  'Mumbai', 'Thane', 'Pune', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata',
  'Jaipur', 'Chandigarh', 'Mohali', 'Lucknow', 'Indore'
];

const intents = [
  { key: 'buy', label: 'Buy' },
  { key: 'rent', label: 'Rent' },
  { key: 'pg', label: 'PG' },
];

const types = [
  { key: 'flats', label: 'Flats' },
  { key: 'apartments', label: 'Apartments' },
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
  const citySlug = slug(city);
  for (const intent of intents) {
    for (const t of types) {
      // Skip irrelevant combinations (e.g., PG with office-space)
      if (intent.key === 'pg' && !['flats','apartments'].includes(t.key)) continue;
      const u = `/${citySlug}/${intent.key}/${t.key}`;
      landingUrls.push(u);
    }
  }
}

// Facet variants: limited to priority cities and residential types to control size
const priorityCities = ['Gurugram','Gurgaon','Delhi','Noida'];
const bhks = ['1-bhk','1-5-bhk','2-bhk','2-5-bhk','3-bhk','4-bhk','5-bhk'];
const budgets = [
  // Rent budgets
  'under-10k','under-15k','under-20k','under-25k','under-30k','under-40k',
  // Buy budgets
  'under-50-lakhs','under-80-lakhs','under-1-crore','under-1-5-crore','under-2-crore'
];
const resTypes = ['flats','apartments','independent-house','builder-floor','villa'];

// Amenity facets (guardrails: small, high-value set)
const amenities = ['near-metro','pet-friendly','parking','power-backup','gated-community','swimming-pool','gym','lift','park'];
const pgAmenities = ['near-metro','meals-included','wifi','housekeeping'];

for (const city of priorityCities) {
  const citySlug = slug(city);
  for (const intent of intents) {
    for (const t of resTypes) {
      // BHK pages
      for (const b of bhks) {
        // PG supports only flats/apartments; skip others for PG
        if (intent.key === 'pg' && !['flats','apartments'].includes(t)) continue;
        landingUrls.push(`/${citySlug}/${intent.key}/${t}/${b}`);
      }
      // Budget pages
      for (const bd of budgets) {
        // rental budgets meaningful for rent/pg; buy budgets for buy
        const isRentBudget = ['under-10k','under-15k','under-20k','under-25k','under-30k','under-40k'].includes(bd);
        if (isRentBudget && intent.key === 'buy') continue;
        const isBuyBudget = ['under-50-lakhs','under-80-lakhs','under-1-crore','under-1-5-crore','under-2-crore'].includes(bd);
        if (isBuyBudget && intent.key !== 'buy') continue;
        if (intent.key === 'pg' && !['flats','apartments'].includes(t)) continue;
        landingUrls.push(`/${citySlug}/${intent.key}/${t}/budget/${bd}`);
      }
      // Amenity pages
      const aList = intent.key === 'pg' ? pgAmenities : amenities;
      for (const a of aList) {
        if (intent.key === 'pg' && !['flats','apartments'].includes(t)) continue;
        landingUrls.push(`/${citySlug}/${intent.key}/${t}/amenity/${a}`);
      }
    }
  }
}

// Generate sitemap-static.xml
const staticXml = [
  xmlHeader,
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes.map((r) => urlTag(`${SITE_URL}${r}`, today, r === '/' ? 'daily' : 'weekly', r === '/' ? '1.0' : '0.7')),
  '</urlset>\n',
].join('\n');

// Generate sitemap-landing.xml
const landingXml = [
  xmlHeader,
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...landingUrls.map((r) => urlTag(`${SITE_URL}${r}`, today, 'daily', '0.8')),
  '</urlset>\n',
].join('\n');

// Write files
writeFile(path.join(outDir, 'sitemap-static.xml'), staticXml);
writeFile(path.join(outDir, 'sitemap-landing.xml'), landingXml);

// Compose sitemap index
const indexXml = [
  xmlHeader,
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <sitemap>\n    <loc>${SITE_URL}/sitemap-static.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
  `  <sitemap>\n    <loc>${SITE_URL}/sitemap-landing.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`,
  // Properties sitemaps can be appended here by backend/build step
  '</sitemapindex>\n',
].join('\n');

writeFile(path.join(outDir, 'sitemap.xml'), indexXml);

console.log('Sitemaps generated.');

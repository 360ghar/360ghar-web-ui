#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fetchPaginatedCollection } from './lib/paginatedApi.mjs';

const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';
const API_BASE = `${process.env.VITE_API_SERVER || 'https://api.360ghar.com'}/api/v1`;
const outDir = path.resolve(process.cwd(), 'public');

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
  return `  <url>\n    <loc>${loc}</loc>\n${
    lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''
  }${
    changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ''
  }${
    priority ? `    <priority>${priority}</priority>\n` : ''
  }${altTags ? `${altTags}\n` : ''}  </url>`;
};

const buildAlternates = (enPath) => [
  { hreflang: 'en', href: `${SITE_URL}${enPath}` },
  { hreflang: 'hi', href: `${SITE_URL}/hi${enPath}` },
  { hreflang: 'x-default', href: `${SITE_URL}${enPath}` },
];

const today = new Date().toISOString().split('T')[0];

function buildSitemapXml(urls) {
  return [xmlHeader, `<urlset ${URLSET_NS}>`, ...urls, '</urlset>\n'].join('\n');
}

const staticDataHubRoutes = [
  { path: '/circle-rates', changefreq: 'monthly', priority: '0.8' },
  { path: '/rera-projects', changefreq: 'weekly', priority: '0.8' },
  { path: '/bank-auctions', changefreq: 'daily', priority: '0.8' },
  { path: '/stamp-duty-calculator', changefreq: 'monthly', priority: '0.9' },
  { path: '/verify-ownership', changefreq: 'monthly', priority: '0.7' },
  { path: '/zone-checker', changefreq: 'monthly', priority: '0.7' },
  { path: '/regulatory-updates', changefreq: 'daily', priority: '0.7' },
  { path: '/builder-reputation', changefreq: 'weekly', priority: '0.8' },
];

async function fetchCircleRates() {
  try {
    return await fetchPaginatedCollection({
      baseUrl: API_BASE,
      path: '/data-hub/circle-rates',
    });
  } catch (e) {
    console.warn('Failed to fetch circle rates:', e.message);
    return [];
  }
}

async function fetchAuctions() {
  try {
    return await fetchPaginatedCollection({
      baseUrl: API_BASE,
      path: '/data-hub/auctions',
    });
  } catch (e) {
    console.warn('Failed to fetch auctions:', e.message);
    return [];
  }
}

async function fetchZoning() {
  try {
    return await fetchPaginatedCollection({
      baseUrl: API_BASE,
      path: '/data-hub/zoning',
    });
  } catch (e) {
    console.warn('Failed to fetch zoning data:', e.message);
    return [];
  }
}

async function fetchBuilders() {
  try {
    return await fetchPaginatedCollection({
      baseUrl: API_BASE,
      path: '/data-hub/builders',
    });
  } catch (e) {
    console.warn('Failed to fetch builders:', e.message);
    return [];
  }
}

async function main() {
  console.log('Generating datahub sitemap with detail pages...');
  const urls = [];

  for (const { path, changefreq, priority } of staticDataHubRoutes) {
    const alts = buildAlternates(path);
    urls.push(urlTag(`${SITE_URL}${path}`, today, changefreq, priority, alts));
    urls.push(urlTag(`${SITE_URL}/hi${path}`, today, changefreq, priority, alts));
  }

  const priceIndexCities = ['gurgaon', 'delhi', 'noida', 'faridabad', 'ghaziabad'];
  for (const city of priceIndexCities) {
    const enPath = `/price-index/${city}`;
    const alts = buildAlternates(enPath);
    urls.push(urlTag(`${SITE_URL}${enPath}`, today, 'weekly', '0.8', alts));
    urls.push(urlTag(`${SITE_URL}/hi${enPath}`, today, 'weekly', '0.8', alts));
  }

  const [circleRates, auctions, zoningData, builders] = await Promise.all([
    fetchCircleRates(),
    fetchAuctions(),
    fetchZoning(),
    fetchBuilders(),
  ]);

  console.log(`Fetched: ${circleRates.length} circle rates, ${auctions.length} auctions, ${zoningData.length} zones, ${builders.length} builders`);

  const seenCircleRateSlugs = new Set();
  for (const rate of circleRates) {
    const slug = rate.slug;
    if (!slug || seenCircleRateSlugs.has(slug)) continue;
    seenCircleRateSlugs.add(slug);
    const enPath = `/circle-rate/${slug}`;
    const alts = buildAlternates(enPath);
    const lastmod = rate.updated_at ? new Date(rate.updated_at).toISOString().split('T')[0] : today;
    urls.push(urlTag(`${SITE_URL}${enPath}`, lastmod, 'monthly', '0.7', alts));
    urls.push(urlTag(`${SITE_URL}/hi${enPath}`, lastmod, 'monthly', '0.7', alts));
  }
  console.log(`Added ${seenCircleRateSlugs.size} circle rate detail pages`);

  for (const auction of auctions) {
    const id = auction.id || auction._id;
    if (!id) continue;
    const enPath = `/bank-auctions/${id}`;
    const alts = buildAlternates(enPath);
    const lastmod = auction.updated_at ? new Date(auction.updated_at).toISOString().split('T')[0] : today;
    urls.push(urlTag(`${SITE_URL}${enPath}`, lastmod, 'daily', '0.7', alts));
    urls.push(urlTag(`${SITE_URL}/hi${enPath}`, lastmod, 'daily', '0.7', alts));
  }
  console.log(`Added ${auctions.length} bank auction detail pages`);

  const seenZoneSlugs = new Set();
  for (const zone of zoningData) {
    const slug = zone.slug;
    if (!slug || seenZoneSlugs.has(slug)) continue;
    seenZoneSlugs.add(slug);
    const enPath = `/zone-checker/${slug}`;
    const alts = buildAlternates(enPath);
    const lastmod = zone.updated_at ? new Date(zone.updated_at).toISOString().split('T')[0] : today;
    urls.push(urlTag(`${SITE_URL}${enPath}`, lastmod, 'monthly', '0.7', alts));
    urls.push(urlTag(`${SITE_URL}/hi${enPath}`, lastmod, 'monthly', '0.7', alts));
  }
  console.log(`Added ${seenZoneSlugs.size} zone checker detail pages`);

  for (const builder of builders) {
    const slug = builder.slug;
    if (!slug) continue;
    const enPath = `/builder-reputation/${slug}`;
    const alts = buildAlternates(enPath);
    const lastmod = builder.updated_at ? new Date(builder.updated_at).toISOString().split('T')[0] : today;
    urls.push(urlTag(`${SITE_URL}${enPath}`, lastmod, 'weekly', '0.7', alts));
    urls.push(urlTag(`${SITE_URL}/hi${enPath}`, lastmod, 'weekly', '0.7', alts));
  }
  console.log(`Added ${builders.length} builder reputation detail pages`);

  const sitemap = buildSitemapXml(urls);
  writeFile(path.join(outDir, 'sitemap-datahub.xml'), sitemap);
  console.log(`Generated datahub sitemap with ${urls.length} total URLs.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')) {
  main().catch(console.error);
}

export { main as generateDatahubSitemap };

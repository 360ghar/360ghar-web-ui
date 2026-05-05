#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'node:url';
import { fetchPaginatedCollectionParallel, fetchPaginatedCollectionWithFallbacksParallel } from './lib/paginatedApi.mjs';

const require = createRequire(import.meta.url);

const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';
const API_BASE = `${process.env.VITE_API_SERVER || 'https://api.360ghar.com'}/api/v1`;
const outDir = path.resolve(process.cwd(), 'public');

const escapeXml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const titleToSlug = (title) =>
  String(title || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const toRfc2822 = (dateStr) => {
  if (!dateStr) return new Date().toUTCString();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
};

// --- Fetchers ---

async function fetchBlogPosts() {
  return fetchPaginatedCollectionWithFallbacksParallel({
    baseUrl: API_BASE,
    path: '/blog/posts',
    pageSizes: [50, 25],
  });
}

async function fetchProperties() {
  return fetchPaginatedCollectionParallel({
    baseUrl: API_BASE,
    path: '/properties/',
  });
}

// --- Static data ---

function loadLocalitiesIndex() {
  const indexPath = path.resolve(process.cwd(), 'src/data/localities-index.json');
  return require(indexPath);
}

// --- RSS item builders ---

function blogItem(post) {
  const slug = post.slug || titleToSlug(post.title);
  const link = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
  return { title: post.title, link, desc: post.excerpt || post.summary || '', date: post.published_at };
}

function propertyItem(prop) {
  const link = `${SITE_URL}/property/${prop.id}`;
  const title = prop.title || prop.name || `Property #${prop.id}`;
  const parts = [
    prop.property_type?.replace(/_/g, ' '),
    prop.purpose ? `for ${prop.purpose}` : null,
    prop.locality || prop.city ? `in ${[prop.locality, prop.city].filter(Boolean).join(', ')}` : null,
  ].filter(Boolean);
  const desc = prop.description || (parts.length ? parts.join(' ') : '');
  return { title, link, desc, date: prop.created_at || prop.updated_at };
}

function localityItem(entry) {
  const link = `${SITE_URL}/locality/${encodeURIComponent(entry.slug)}`;
  return { title: entry.name, link, desc: `${entry.type} in ${entry.city}`, date: entry.lastVerifiedAt };
}

function toRssItem({ title, link, desc, date }) {
  return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <description>${escapeXml(desc)}</description>
      <pubDate>${toRfc2822(date)}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
}

// --- RSS XML builder ---

const buildRssXml = (items, channelOpts = {}) => {
  const {
    title = '360Ghar',
    link = SITE_URL,
    description = 'Properties, projects, localities, and real estate insights from 360Ghar',
    selfHref = `${SITE_URL}/rss.xml`,
  } = channelOpts;
  const buildDate = new Date().toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${link}</link>
    <description>${escapeXml(description)}</description>
    <language>en-in</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${selfHref}" rel="self" type="application/rss+xml"/>
${items.map(toRssItem).join('\n')}
  </channel>
</rss>`;
};

// --- Ensure rss/ subdirectory exists ---

function ensureRssDir() {
  const rssDir = path.join(outDir, 'rss');
  if (!fs.existsSync(rssDir)) {
    fs.mkdirSync(rssDir, { recursive: true });
  }
  return rssDir;
}

// --- Write helper ---

function writeRssFile(filePath, xml, label) {
  fs.writeFileSync(filePath, xml, 'utf8');
  console.log(`generate-rss: wrote ${label} to ${filePath}`);
}

export function writeFeedOrPreserveExisting({ filePath, xml, label, isFresh }) {
  if (!isFresh && fs.existsSync(filePath)) {
    console.log(`generate-rss: preserved ${label} at ${filePath}`);
    return 'preserved';
  }

  writeRssFile(filePath, xml, label);
  return 'written';
}

// --- Main ---

async function main() {
  ensureRssDir();
  const rssDir = path.join(outDir, 'rss');

  const localitiesIndex = loadLocalitiesIndex();
  const localityEntries = localitiesIndex.filter((e) => e.entityType === 'locality');

  let blogPosts = [];
  let blogFetchOk = true;
  let properties = [];
  let propertiesFetchOk = true;

  // Fetch blog posts and properties in parallel
  const [blogResult, propertiesResult] = await Promise.allSettled([
    fetchBlogPosts(),
    fetchProperties(),
  ]);

  if (blogResult.status === 'fulfilled') {
    blogPosts = blogResult.value;
    console.log(`generate-rss: fetched ${blogPosts.length} blog posts`);
  } else {
    blogFetchOk = false;
    console.warn(`generate-rss: failed to fetch blog posts (${blogResult.reason?.message})`);
  }

  if (propertiesResult.status === 'fulfilled') {
    properties = propertiesResult.value;
    console.log(`generate-rss: fetched ${properties.length} properties`);
  } else {
    propertiesFetchOk = false;
    console.warn(`generate-rss: failed to fetch properties (${propertiesResult.reason?.message})`);
  }

  console.log(`generate-rss: ${localityEntries.length} localities from static index`);

  // --- Sub-feed: Blog ---
  const blogItems = blogPosts.map(blogItem);
  const blogXml = buildRssXml(blogItems, {
    title: '360Ghar Blog',
    description: 'Real estate guides, buying tips, locality deep-dives, and market updates from 360Ghar',
    selfHref: `${SITE_URL}/rss/blog.xml`,
  });
  writeFeedOrPreserveExisting({
    filePath: path.join(rssDir, 'blog.xml'),
    xml: blogXml,
    label: `${blogItems.length} blog items`,
    isFresh: blogFetchOk,
  });

  // --- Sub-feed: Properties ---
  const propertyItems = properties.map(propertyItem);
  const propertiesXml = buildRssXml(propertyItems, {
    title: '360Ghar Properties',
    description: 'Latest verified property listings in Gurugram and Delhi NCR from 360Ghar',
    selfHref: `${SITE_URL}/rss/properties.xml`,
  });
  writeFeedOrPreserveExisting({
    filePath: path.join(rssDir, 'properties.xml'),
    xml: propertiesXml,
    label: `${propertyItems.length} property items`,
    isFresh: propertiesFetchOk,
  });

  // --- Sub-feed: Localities ---
  const localityItems = localityEntries.map(localityItem);
  const localitiesXml = buildRssXml(localityItems, {
    title: '360Ghar Localities',
    description: 'Locality guides and neighbourhood intelligence for Gurugram and Delhi NCR',
    selfHref: `${SITE_URL}/rss/localities.xml`,
  });
  writeRssFile(path.join(rssDir, 'localities.xml'), localitiesXml, `${localityItems.length} locality items`);

  // --- Main index feed: lists each sub-feed as an item ---
  const indexItems = [
    {
      title: '360Ghar Blog',
      link: `${SITE_URL}/rss/blog.xml`,
      desc: 'Real estate guides, buying tips, locality deep-dives, and market updates',
      date: blogItems.length ? blogItems[0].date : new Date().toISOString(),
    },
    {
      title: '360Ghar Properties',
      link: `${SITE_URL}/rss/properties.xml`,
      desc: 'Latest verified property listings in Gurugram and Delhi NCR',
      date: propertyItems.length ? propertyItems[0].date : new Date().toISOString(),
    },
    {
      title: '360Ghar Localities',
      link: `${SITE_URL}/rss/localities.xml`,
      desc: 'Locality guides and neighbourhood intelligence for Gurugram and Delhi NCR',
      date: localityItems.length ? localityItems[0].date : new Date().toISOString(),
    },
  ];
  const indexXml = buildRssXml(indexItems, {
    title: '360Ghar - All Feeds',
    description: 'Index of all 360Ghar RSS feeds: blog, properties, and localities',
    selfHref: `${SITE_URL}/rss.xml`,
  });
  writeRssFile(path.join(outDir, 'rss.xml'), indexXml, `index feed (${indexItems.length} sub-feeds)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('generate-rss: unexpected error:', err.message);
    process.exit(1);
  });
}

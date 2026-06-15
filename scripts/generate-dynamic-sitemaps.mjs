#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchPaginatedCollection, fetchPaginatedCollectionCached } from './lib/paginatedApi.mjs';
import { getProjectEntries } from './lib/projectEntries.mjs';

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

// Format date for sitemap
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return null;
  }
};

// Fetch properties from API (build-cached to avoid re-crawling on every build)
async function fetchProperties() {
  try {
    return {
      items: await fetchPaginatedCollectionCached({
        baseUrl: API_BASE,
        path: '/properties/',
      }),
      ok: true,
    };
  } catch (error) {
    console.warn('Failed to fetch properties:', error.message);
    return { items: [], ok: false };
  }
}

// Fetch blog posts from API
async function fetchBlogPosts() {
  try {
    return {
      items: await fetchPaginatedCollection({
        baseUrl: API_BASE,
        path: '/blog/posts',
      }),
      ok: true,
    };
  } catch (error) {
    console.warn('Failed to fetch blog posts:', error.message);
    return { items: [], ok: false };
  }
}

async function fetchProjects() {
  try {
    return {
      items: getProjectSitemapEntries(),
      ok: true,
    };
  } catch (error) {
    console.warn('Failed to build project sitemap entries:', error.message);
    return { items: [], ok: false };
  }
}

export function getProjectSitemapEntries() {
  return getProjectEntries();
}

function buildSitemapXml(urls) {
  return [
    xmlHeader,
    `<urlset ${URLSET_NS}>`,
    ...urls,
    '</urlset>\n'
  ].join('\n');
}

function getExistingSitemapUrl(filename) {
  const filePath = path.join(outDir, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return `${SITE_URL}/${filename}`;
}

// Generate properties sitemap
async function generatePropertiesSitemap() {
  const { items: properties, ok } = await fetchProperties();
  const filename = 'sitemap-properties.xml';
  const filePath = path.join(outDir, filename);

  if (!ok) {
    const existing = getExistingSitemapUrl(filename);
    if (existing) {
      console.log('Preserving existing properties sitemap after API failure');
      return existing;
    }

    console.log('No properties sitemap generated and no previous file to preserve');
    return null;
  }

  const urls = properties.flatMap(prop => {
    const id = prop.id || prop.slug;
    const lastmod = formatDate(prop.updated_at || prop.created_at);
    const enPath = `/property/${id}`;
    const hiPath = `/hi/property/${id}`;
    const alts = buildAlternates(enPath);
    return [
      urlTag(`${SITE_URL}${enPath}`, lastmod, 'weekly', '0.8', alts),
      urlTag(`${SITE_URL}${hiPath}`, lastmod, 'weekly', '0.8', alts),
    ];
  });

  writeFile(filePath, buildSitemapXml(urls));
  return `${SITE_URL}/${filename}`;
}

// Generate blog sitemap
async function generateBlogSitemap() {
  const { items: posts, ok } = await fetchBlogPosts();
  const filename = 'sitemap-blog.xml';
  const filePath = path.join(outDir, filename);

  if (!ok) {
    const existing = getExistingSitemapUrl(filename);
    if (existing) {
      console.log('Preserving existing blog sitemap after API failure');
      return existing;
    }

    console.log('No blog sitemap generated and no previous file to preserve');
    return null;
  }

  const urls = posts.flatMap(post => {
    const slug = post.slug || post.id;
    const lastmod = formatDate(post.updated_at || post.published_at);
    const enPath = `/blog/${slug}`;
    const hiPath = `/hi/blog/${slug}`;
    const alts = buildAlternates(enPath);
    return [
      urlTag(`${SITE_URL}${enPath}`, lastmod, 'weekly', '0.7', alts),
      urlTag(`${SITE_URL}${hiPath}`, lastmod, 'weekly', '0.7', alts),
    ];
  });

  writeFile(filePath, buildSitemapXml(urls));
  return `${SITE_URL}/${filename}`;
}

// Generate projects sitemap
async function generateProjectsSitemap() {
  const { items: projects, ok } = await fetchProjects();
  const filename = 'sitemap-projects.xml';
  const filePath = path.join(outDir, filename);

  if (!ok) {
    const existing = getExistingSitemapUrl(filename);
    if (existing) {
      console.log('Preserving existing projects sitemap after project-index failure');
      return existing;
    }

    console.log('No projects sitemap generated and no previous file to preserve');
    return null;
  }

  const urls = projects.flatMap(proj => {
    const lastmod = formatDate(proj.updated_at || proj.created_at);
    const enPath = `/project/${proj.slug}`;
    const hiPath = `/hi/project/${proj.slug}`;
    const alts = buildAlternates(enPath);
    return [
      urlTag(`${SITE_URL}${enPath}`, lastmod, 'weekly', '0.7', alts),
      urlTag(`${SITE_URL}${hiPath}`, lastmod, 'weekly', '0.7', alts),
    ];
  });

  writeFile(filePath, buildSitemapXml(urls));
  return `${SITE_URL}/${filename}`;
}

// Update sitemap index to include dynamic sitemaps
function updateSitemapIndex(dynamicSitemaps) {
  const staticSitemaps = [
    `${SITE_URL}/sitemap-static.xml`,
    `${SITE_URL}/sitemap-landing.xml`,
    `${SITE_URL}/sitemap-localities.xml`,
    `${SITE_URL}/sitemap-datahub.xml`,
  ];

  const allSitemaps = [...staticSitemaps, ...dynamicSitemaps.filter(Boolean)];

  const indexXml = [
    xmlHeader,
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allSitemaps.map(sitemap =>
      `  <sitemap>\n    <loc>${sitemap}</loc>\n  </sitemap>`
    ),
    '</sitemapindex>\n'
  ].join('\n');

  writeFile(path.join(outDir, 'sitemap.xml'), indexXml);
}

// Main execution
async function main() {
  console.log('Generating dynamic sitemaps...');

  const [propertiesSitemap, blogSitemap, projectsSitemap] = await Promise.all([
    generatePropertiesSitemap(),
    generateBlogSitemap(),
    generateProjectsSitemap()
  ]);

  updateSitemapIndex([propertiesSitemap, blogSitemap, projectsSitemap]);

  console.log('Dynamic sitemaps generated successfully!');
  console.log(`- Properties: ${propertiesSitemap ? 'Generated' : 'Skipped'}`);
  console.log(`- Blog: ${blogSitemap ? 'Generated' : 'Skipped'}`);
  console.log(`- Projects: ${projectsSitemap ? 'Generated' : 'Skipped'}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

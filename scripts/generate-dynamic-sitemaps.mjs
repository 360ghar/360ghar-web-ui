#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';
const API_BASE = process.env.API_BASE || 'https://api.360ghar.com/api/v1';
const outDir = path.resolve(process.cwd(), 'public');

const writeFile = (p, content) => {
  fs.writeFileSync(p, content, 'utf8');
  console.log(`Wrote ${p}`);
};

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';

const urlTag = (loc, lastmod, changefreq, priority) =>
  `  <url>\n    <loc>${loc}</loc>\n${
    lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''
  }${
    changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ''
  }${
    priority ? `    <priority>${priority}</priority>\n` : ''
  }  </url>`;

// Format date for sitemap
const formatDate = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

// Fetch properties from API
async function fetchProperties() {
  try {
    const response = await fetch(`${API_BASE}/properties/?limit=10000`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.results || data.items || data;
  } catch (error) {
    console.warn('Failed to fetch properties:', error.message);
    return [];
  }
}

// Fetch blog posts from API
async function fetchBlogPosts() {
  try {
    const response = await fetch(`${API_BASE}/blog/posts/?limit=1000`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.results || data.items || data;
  } catch (error) {
    console.warn('Failed to fetch blog posts:', error.message);
    return [];
  }
}

// Fetch projects from API
async function fetchProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects/?limit=1000`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.results || data.items || data;
  } catch (error) {
    console.warn('Failed to fetch projects:', error.message);
    return [];
  }
}

// Generate properties sitemap
async function generatePropertiesSitemap() {
  const properties = await fetchProperties();

  if (properties.length === 0) {
    console.log('No properties found, skipping properties sitemap');
    return null;
  }

  const urls = properties.map(prop => {
    const id = prop.id || prop.slug;
    const lastmod = formatDate(prop.updated_at || prop.created_at);
    return urlTag(
      `${SITE_URL}/property/${id}`,
      lastmod,
      'weekly',
      '0.8'
    );
  });

  const xml = [
    xmlHeader,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>\n'
  ].join('\n');

  writeFile(path.join(outDir, 'sitemap-properties.xml'), xml);
  return `${SITE_URL}/sitemap-properties.xml`;
}

// Generate blog sitemap
async function generateBlogSitemap() {
  const posts = await fetchBlogPosts();

  if (posts.length === 0) {
    console.log('No blog posts found, skipping blog sitemap');
    return null;
  }

  const urls = posts.map(post => {
    const slug = post.slug || post.id;
    const lastmod = formatDate(post.updated_at || post.published_at);
    return urlTag(
      `${SITE_URL}/blog/${slug}`,
      lastmod,
      'weekly',
      '0.7'
    );
  });

  const xml = [
    xmlHeader,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>\n'
  ].join('\n');

  writeFile(path.join(outDir, 'sitemap-blog.xml'), xml);
  return `${SITE_URL}/sitemap-blog.xml`;
}

// Generate projects sitemap
async function generateProjectsSitemap() {
  const projects = await fetchProjects();

  if (projects.length === 0) {
    console.log('No projects found, skipping projects sitemap');
    return null;
  }

  const urls = projects.map(proj => {
    const slug = proj.slug || proj.title || proj.id;
    const lastmod = formatDate(proj.updated_at || proj.created_at);
    return urlTag(
      `${SITE_URL}/project/${slug}`,
      lastmod,
      'weekly',
      '0.7'
    );
  });

  const xml = [
    xmlHeader,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>\n'
  ].join('\n');

  writeFile(path.join(outDir, 'sitemap-projects.xml'), xml);
  return `${SITE_URL}/sitemap-projects.xml`;
}

// Update sitemap index to include dynamic sitemaps
function updateSitemapIndex(dynamicSitemaps) {
  const staticSitemaps = [
    `${SITE_URL}/sitemap-static.xml`,
    `${SITE_URL}/sitemap-landing.xml`,
    `${SITE_URL}/sitemap-localities.xml`,
  ];

  const allSitemaps = [...staticSitemaps, ...dynamicSitemaps.filter(Boolean)];

  const indexXml = [
    xmlHeader,
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allSitemaps.map(sitemap =>
      `  <sitemap>\n    <loc>${sitemap}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </sitemap>`
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

main().catch(console.error);

#!/usr/bin/env node
/**
 * Google Search Console Audit Script
 * Fetches search analytics and crawl errors from GSC API.
 * Requires GOOGLE_SITE_URL, GOOGLE_SERVICE_ACCOUNT_EMAIL,
 * GOOGLE_PRIVATE_KEY env vars (or a service account key file).
 *
 * Outputs:
 *   scripts/reports/gsc-keywords.json   — per-page keyword rankings
 *   scripts/reports/gsc-crawl-errors.json — crawl issues
 *   scripts/reports/gsc-top-pages.json   — top performing pages
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';

const cwd = process.cwd();
const reportsDir = path.join(cwd, 'scripts', 'reports');
const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';

// GSC API endpoints
const GSC_API = 'https://www.googleapis.com/webmasters/v3/sites';

/**
 * Get an access token using a service account.
 * Falls back to a stored token if available.
 */
async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    console.warn('GSC: Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars');
    console.warn('GSC: Set these to enable automated GSC data fetching');
    console.warn('GSC: Alternatively, export from https://console.cloud.google.com/iam');
    return null;
  }

  const jwt = await import('jsonwebtoken').then(m => m.default || m).catch(() => null);
  if (!jwt) {
    console.warn('GSC: Install jsonwebtoken to enable GSC API access: npm install -D jsonwebtoken');
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    {
      iss: email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    key,
    { algorithm: 'RS256' }
  );

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GSC token fetch failed: ${err}`);
  }

  const data = await resp.json();
  return data.access_token;
}

/**
 * Fetch search analytics from GSC API.
 */
async function fetchSearchAnalytics(accessToken, { startDate, endDate, dimensions = ['page', 'query'], rowLimit = 1000 } = {}) {
  const encodedSite = encodeURIComponent(SITE_URL);
  const url = `${GSC_API}/${encodedSite}/searchAnalytics/query`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`GSC search analytics failed: ${err}`);
  }

  return resp.json();
}

/**
 * Fetch crawl errors from GSC API (urlCrawlErrorsCounts).
 */
async function fetchCrawlErrors(accessToken) {
  const encodedSite = encodeURIComponent(SITE_URL);
  const url = `${GSC_API}/${encodedSite}/urlCrawlErrorsCounts/query`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!resp.ok) {
    // Crawl error API may not be available for all sites
    console.warn('GSC: Crawl errors API not available or not configured');
    return { countPerTypes: [] };
  }

  return resp.json();
}

/**
 * Process raw search analytics into per-page keyword data.
 */
function processKeywordData(rows = []) {
  const pageMap = {};

  for (const row of rows) {
    const [page, query] = row.keys || [];
    if (!page || !query) continue;

    if (!pageMap[page]) {
      pageMap[page] = { page, keywords: [] };
    }

    pageMap[page].keywords.push({
      query,
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    });
  }

  // Sort keywords per page by clicks descending
  for (const entry of Object.values(pageMap)) {
    entry.keywords.sort((a, b) => b.clicks - a.clicks);
  }

  return Object.values(pageMap);
}

/**
 * Identify pages to prune (zero impressions over the date range).
 */
function identifyPruneCandidates(pageKeywords, minImpressions = 0) {
  return pageKeywords
    .filter((p) => p.keywords.reduce((sum, k) => sum + k.impressions, 0) <= minImpressions)
    .map((p) => p.page);
}

/**
 * Identify pages gaining traction (increasing impressions).
 */
function identifyGainingPages(pageKeywords, minClicks = 5) {
  return pageKeywords
    .filter((p) => p.keywords.reduce((sum, k) => sum + k.clicks, 0) >= minClicks)
    .map((p) => ({
      page: p.page,
      totalClicks: p.keywords.reduce((sum, k) => sum + k.clicks, 0),
      totalImpressions: p.keywords.reduce((sum, k) => sum + k.impressions, 0),
      topKeywords: p.keywords.slice(0, 5).map((k) => k.query),
    }));
}

async function main() {
  fs.mkdirSync(reportsDir, { recursive: true });

  const accessToken = await getAccessToken();
  if (!accessToken) {
    // Write empty reports so downstream tools don't break
    const empty = { generatedAt: new Date().toISOString(), source: 'gsc-api', data: [], note: 'GSC API not configured — set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY env vars' };
    fs.writeFileSync(path.join(reportsDir, 'gsc-keywords.json'), JSON.stringify(empty, null, 2));
    fs.writeFileSync(path.join(reportsDir, 'gsc-crawl-errors.json'), JSON.stringify(empty, null, 2));
    fs.writeFileSync(path.join(reportsDir, 'gsc-top-pages.json'), JSON.stringify(empty, null, 2));
    console.log('GSC: Wrote empty reports (API not configured)');
    return;
  }

  // Default: last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log(`GSC: Fetching search analytics from ${startDate} to ${endDate}...`);

  const [searchData, crawlData] = await Promise.all([
    fetchSearchAnalytics(accessToken, { startDate, endDate, rowLimit: 5000 }).catch((err) => {
      console.error('GSC: Search analytics fetch failed:', err.message);
      return { rows: [] };
    }),
    fetchCrawlErrors(accessToken).catch((err) => {
      console.error('GSC: Crawl errors fetch failed:', err.message);
      return { countPerTypes: [] };
    }),
  ]);

  const pageKeywords = processKeywordData(searchData.rows);
  const pruneCandidates = identifyPruneCandidates(pageKeywords);
  const gainingPages = identifyGainingPages(pageKeywords);

  // Write reports
  const keywordsReport = {
    generatedAt: new Date().toISOString(),
    source: 'gsc-api',
    dateRange: { startDate, endDate },
    totalPages: pageKeywords.length,
    totalKeywords: pageKeywords.reduce((sum, p) => sum + p.keywords.length, 0),
    data: pageKeywords,
  };

  const crawlReport = {
    generatedAt: new Date().toISOString(),
    source: 'gsc-api',
    errors: crawlData.countPerTypes || [],
  };

  const topPagesReport = {
    generatedAt: new Date().toISOString(),
    source: 'gsc-api',
    gainingPages,
    pruneCandidates,
  };

  fs.writeFileSync(path.join(reportsDir, 'gsc-keywords.json'), JSON.stringify(keywordsReport, null, 2));
  fs.writeFileSync(path.join(reportsDir, 'gsc-crawl-errors.json'), JSON.stringify(crawlReport, null, 2));
  fs.writeFileSync(path.join(reportsDir, 'gsc-top-pages.json'), JSON.stringify(topPagesReport, null, 2));

  console.log(`GSC: Wrote reports:`);
  console.log(`  Keywords: ${pageKeywords.length} pages, ${keywordsReport.totalKeywords} keywords`);
  console.log(`  Gaining pages: ${gainingPages.length}`);
  console.log(`  Prune candidates: ${pruneCandidates.length}`);
  console.log(`  Crawl errors: ${(crawlData.countPerTypes || []).length} types`);
}

const entryFile = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entryFile) {
  main().catch(console.error);
}

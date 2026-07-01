#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

const DEFAULT_SITE_URL = 'https://360ghar.com';
const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
const HOST = (() => {
  try {
    return new URL(SITE_URL).hostname;
  } catch {
    return new URL(DEFAULT_SITE_URL).hostname;
  }
})();

const INDEXNOW_KEY =
  process.env.INDEXNOW_API_KEY ||
  'ba96fa507cb7447aa74f5ddd2f516a6d';
const INDEXNOW_ENDPOINT =
  process.env.INDEXNOW_ENDPOINT ||
  'https://api.indexnow.org/IndexNow';
const KEY_LOCATION =
  process.env.INDEXNOW_KEY_LOCATION ||
  `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const SOURCE_DIR =
  process.env.INDEXNOW_SOURCE_DIR ||
  (fs.existsSync(path.join(cwd, 'dist')) ? path.join(cwd, 'dist') : path.join(cwd, 'public'));
const DRY_RUN = process.env.INDEXNOW_DRY_RUN === '1';
const ENFORCE = process.env.INDEXNOW_ENFORCE_SUCCESS === '1';
const BATCH_SIZE = Math.max(1, Number.parseInt(process.env.INDEXNOW_BATCH_SIZE || '1000', 10));

function readSitemapFiles(directory) {
  const sitemapDir = path.resolve(directory);
  if (!fs.existsSync(sitemapDir)) {
    console.warn(`[indexnow] Source directory not found: ${sitemapDir}`);
    return [];
  }

  const files = fs
    .readdirSync(sitemapDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^sitemap.*\.xml$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => path.join(sitemapDir, entry.name));

  if (files.length === 0) {
    console.warn(`[indexnow] No sitemap*.xml files found in ${sitemapDir}`);
  }

  return files;
}

function extractUrlsFromXml(xmlContent) {
  const locRegex = /<loc>(.*?)<\/loc>/gis;
  const urls = [];

  for (const match of xmlContent.matchAll(locRegex)) {
    const raw = match?.[1]?.trim();
    if (!raw) continue;

    const url = raw.replace(/&amp;/g, '&');
    try {
      new URL(url);
    } catch {
      continue;
    }

    if (url.toLowerCase().endsWith('.xml')) continue;
    urls.push(url);
  }

  return urls;
}

function collectIndexNowUrls(sitemapFiles) {
  const seen = new Set();
  const urls = [];

  for (const file of sitemapFiles) {
    let content = '';
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (error) {
      console.warn(`[indexnow] Failed to read ${path.basename(file)}: ${error.message}`);
      continue;
    }

    const locs = extractUrlsFromXml(content);
    for (const url of locs) {
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    }
  }

  return urls;
}

async function submitBatch(urlList) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  if (DRY_RUN) {
    const first = urlList[0];
    const last = urlList[urlList.length - 1];
    console.log('[indexnow] DRY RUN: skipping network call.');
    console.log(`[indexnow] Batch size ${urlList.length}; first=${first}; last=${last}`);
    return true;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '<unreadable>');
    throw new Error(`IndexNow ${response.status} ${response.statusText}: ${responseText}`);
  }

  return true;
}

async function main() {
  console.log('[indexnow] Starting URL submission...');

  const sitemapFiles = readSitemapFiles(SOURCE_DIR);
  if (sitemapFiles.length === 0) {
    console.log('[indexnow] No sitemap files found. Nothing to submit.');
    return;
  }

  const urls = collectIndexNowUrls(sitemapFiles);
  const sameHostUrls = urls.filter((url) => {
    try {
      return new URL(url).hostname === HOST;
    } catch {
      return false;
    }
  });

  if (sameHostUrls.length === 0) {
    console.log('[indexnow] No valid same-host URLs found for submission.');
    return;
  }

  console.log(`[indexnow] Found ${sameHostUrls.length} URLs across ${sitemapFiles.length} sitemap file(s).`);

  let failed = 0;
  let success = 0;

  for (let i = 0; i < sameHostUrls.length; i += BATCH_SIZE) {
    const batch = sameHostUrls.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
    try {
      await submitBatch(batch);
      success += 1;
      console.log(`[indexnow] Submitted batch #${batchIndex} (${batch.length} URLs).`);
    } catch (error) {
      failed += 1;
      console.warn(`[indexnow] Batch #${batchIndex} failed: ${error.message}`);
    }
  }

  if (failed > 0) {
    console.warn(`[indexnow] Submission finished with ${failed} failed batch(es) and ${success} successful batch(es).`);
    if (ENFORCE) process.exitCode = 1;
    return;
  }

  console.log('[indexnow] Submission complete.');
}

main().catch((error) => {
  console.error('[indexnow] Error:', error.message);
  process.exitCode = 1;
});

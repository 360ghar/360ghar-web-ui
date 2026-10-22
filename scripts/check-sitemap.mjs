#!/usr/bin/env node
/**
 * Fetches the sitemap index of a site, then every URL in every sitemap, and reports each URL that
 * does not answer 200 or is noindex (meta robots or X-Robots-Tag). Exit code 1 on any problem.
 *   node scripts/check-sitemap.mjs --base https://360ghar.com [--limit 300] [--concurrency 8]
 * --limit caps the URLs taken from each sitemap (evenly spaced); 0 means all.
 * Sitemap URLs are always written for https://360ghar.com; they are fetched from --base.
 */
import { helpText, parseArgs } from './lib/args.mjs';

const SPEC = {
  base: { type: 'string', default: 'https://360ghar.com', help: 'Site to check (no trailing slash).' },
  limit: { type: 'string', default: '0', help: 'Max URLs per sitemap (0 = all).' },
  concurrency: { type: 'string', default: '8', help: 'Parallel requests.' },
  help: { type: 'boolean', default: false, help: 'Show this text.' },
};
const args = parseArgs(process.argv.slice(2), SPEC);
if (args.help) {
  console.log(helpText('check-sitemap', 'every sitemap URL answers 200 and is indexable.', SPEC));
  process.exit(0);
}
const base = args.base.replace(/\/$/, '');
const limit = Number(args.limit);
const concurrency = Number(args.concurrency);
if (!Number.isInteger(limit) || limit < 0 || !Number.isInteger(concurrency) || concurrency < 1) {
  console.error('--limit must be a whole number from 0, --concurrency a whole number from 1.');
  process.exit(2);
}
const SITE = 'https://360ghar.com';
// Netlify previews send X-Robots-Tag: noindex on every page, so the header counts only on the real site.
const headerCounts = new URL(base).hostname.endsWith('360ghar.com');
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replaceAll('&amp;', '&'));
const local = (u) => base + u.replace(SITE, '');
const get = async (url, tries = 3) => {
  for (let i = 1; ; i += 1) {
    try {
      return await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(45_000), headers: { 'User-Agent': '360ghar-sitemap-check' } });
    } catch (e) {
      if (i === tries) throw e;
    }
  }
};

/** The text of a sitemap file. A failed fetch stops the run: an unavailable sitemap must not look like an empty one. */
const sitemapText = async (url) => {
  const res = await get(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
};

const index = await sitemapText(`${base}/sitemap.xml`);
const urls = [];
for (const sm of locs(index)) {
  let list = locs(await sitemapText(local(sm)));
  if (limit && list.length > limit) list = Array.from({ length: limit }, (_, i) => list[Math.floor((i * list.length) / limit)]);
  console.log(`${sm}: ${list.length} URL(s) to check`);
  urls.push(...new Set(list));
}

const problems = [];
let next = 0;
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      try {
        const res = await get(local(url));
        const body = res.status === 200 ? await res.text() : '';
        const noindex = (headerCounts && /noindex/i.test(res.headers.get('x-robots-tag') ?? '')) || /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(body);
        if (res.status !== 200) problems.push(`${res.status} ${url}${res.headers.get('location') ? ` -> ${res.headers.get('location')}` : ''}`);
        else if (noindex) problems.push(`noindex ${url}`);
      } catch (e) {
        problems.push(`error ${url} ${e.message}`);
      }
    }
  }),
);
console.log(`${urls.length} URL(s) checked, ${problems.length} problem(s).`);
for (const p of problems.slice(0, 200)) console.log(p);
process.exit(problems.length ? 1 : 0);

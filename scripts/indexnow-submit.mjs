#!/usr/bin/env node
/**
 * IndexNow: tell Bing and other engines which URLs changed.
 *
 * URL sources (pick one; default is --base https://360ghar.com):
 *   --base <url>   read <url>/sitemap.xml and every sitemap it lists (GET requests only)
 *   --file <path>  one URL per line
 *   --url <url>    one URL (repeat the flag with a comma list)
 * The sitemap builders in src/features/feeds need Astro's aliases and the API, so the live sitemap index is the source instead. It is the same output.
 *
 * DRY RUN by default: nothing is POSTed. Add --submit to send.
 * The key is public. Its file is public/ba96fa507cb7447aa74f5ddd2f516a6d.txt (checked before a submit).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { helpText, parseArgs } from './lib/args.mjs';
import { chunk, selectUrls, submitBatches, urlsFromSitemapIndex } from './lib/indexnow.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.INDEXNOW_API_KEY || 'ba96fa507cb7447aa74f5ddd2f516a6d';
const SPEC = {
  base: { type: 'string', default: 'https://360ghar.com', help: 'Site to read the sitemap index from. Also the host of the submitted URLs.' },
  file: { type: 'string', help: 'Read URLs from a text file (one per line) instead of the sitemap.' },
  url: { type: 'string', help: 'Submit this URL (comma list allowed) instead of the sitemap.' },
  'changed-within-hours': { type: 'number', help: 'Only sitemap URLs whose lastmod is this recent.' },
  include: { type: 'string', help: 'Keep only URL paths that match this regular expression, for example "^/blog".' },
  limit: { type: 'number', help: 'Submit at most this many URLs.' },
  'batch-size': { type: 'number', default: 1000, help: 'URLs per POST (IndexNow allows up to 10,000).' },
  endpoint: { type: 'string', default: process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/IndexNow', help: 'IndexNow endpoint.' },
  submit: { type: 'boolean', default: false, help: 'Send the POST requests. Without it, only a summary is printed.' },
  strict: { type: 'boolean', default: false, help: 'Exit with code 1 if any batch fails.' },
  help: { type: 'boolean', default: false, help: 'Show this text.' },
};

let args;
try {
  args = parseArgs(process.argv.slice(2), SPEC);
} catch (e) {
  console.error(e.message);
  process.exit(2);
}
if (args.help) {
  console.log(helpText('indexnow-submit', 'submit changed URLs to IndexNow (dry run unless --submit).', SPEC, ['Env: INDEXNOW_API_KEY (default: the key in public/), INDEXNOW_ENDPOINT.']));
  process.exit(0);
}

const base = args.base.replace(/\/+$/, '');
const host = new URL(base).hostname;
let raw;
try {
  if (args.file) raw = readFileSync(args.file, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  else if (args.url) raw = args.url.split(',').map((u) => u.trim());
  else raw = await urlsFromSitemapIndex(base, fetch, args['changed-within-hours'] === undefined ? {} : { sinceMs: Date.now() - args['changed-within-hours'] * 3_600_000 });
} catch (e) {
  console.error(`indexnow: could not read URLs: ${e.message}`);
  process.exit(1);
}

const urls = selectUrls(raw, { host, include: args.include ? new RegExp(args.include) : undefined, limit: args.limit });
const size = Math.min(Math.max(1, args['batch-size']), 10_000);
const batches = chunk(urls, size);
console.log(`indexnow: ${urls.length} URL(s) for ${host} in ${batches.length} batch(es). Endpoint: ${args.endpoint}`);
if (urls.length) console.log(`  first: ${urls[0]}\n  last:  ${urls.at(-1)}`);

const keyFile = join(root, 'public', `${KEY}.txt`);
if (!existsSync(keyFile) || readFileSync(keyFile, 'utf8').trim() !== KEY) {
  console.error(`indexnow: key file public/${KEY}.txt is missing or does not hold the key.`);
  if (args.submit) process.exit(1);
}

if (!args.submit) {
  console.log('Dry run. Nothing was sent. Add --submit to POST.');
  process.exit(0);
}
if (!urls.length) {
  console.log('Nothing to submit.');
  process.exit(0);
}

const { ok, failed } = await submitBatches(batches, { host, key: KEY, keyLocation: `${base}/${KEY}.txt` }, { endpoint: args.endpoint, log: (m) => console.log(`indexnow: ${m}`) });
console.log(`indexnow: done. ${ok} batch(es) accepted, ${failed} failed.`);
if (failed && args.strict) process.exit(1);

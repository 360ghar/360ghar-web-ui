#!/usr/bin/env node
/**
 * Google Search Console audit: which pages and queries get clicks, and which pages get no impressions.
 * Writes scripts/reports/gsc-keywords.json and gsc-top-pages.json.
 *
 * NO-CREDENTIALS DRY MODE is the default: the script prints the plan and calls nothing.
 * To call Google, add --run and set these variables (read-only scope webmasters.readonly):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL   client_email of a Google Cloud service account
 *   GOOGLE_PRIVATE_KEY             its private_key (literal \n pairs are fine)
 *   GSC_SITE_URL                   the Search Console property. Default https://360ghar.com/ ; a domain property is sc-domain:360ghar.com
 * Add the service account email as a user of the property in Search Console first.
 * Without credentials, --run exits with code 1 and writes no report.
 * The old script also called urlCrawlErrorsCounts. Google removed that API, so it is left out.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { helpText, parseArgs } from './lib/args.mjs';
import { credentialsFromEnv, dateRange, fetchAccessToken, fetchSearchAnalytics, gainingPages, groupByPage, pruneCandidates } from './lib/gsc.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = {
  run: { type: 'boolean', default: false, help: 'Call the Google API. Without it, nothing is sent.' },
  days: { type: 'number', default: 28, help: 'Days of data (the window ends two days ago).' },
  site: { type: 'string', default: process.env.GSC_SITE_URL || 'https://360ghar.com/', help: 'Search Console property.' },
  'row-limit': { type: 'number', default: 5000, help: 'Rows to request (API maximum 25,000).' },
  out: { type: 'string', default: 'scripts/reports', help: 'Report folder, relative to the project.' },
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
  console.log(helpText('gsc-audit', 'Search Console keyword and page report (dry mode unless --run).', SPEC, ['Env: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GSC_SITE_URL.']));
  process.exit(0);
}

const range = dateRange(args.days);
const creds = credentialsFromEnv();
console.log(`gsc-audit: property ${args.site}, ${range.startDate} to ${range.endDate}, up to ${args['row-limit']} rows.`);
console.log(`gsc-audit: credentials ${creds ? `found (${creds.email})` : 'not set (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)'}.`);

if (!args.run) {
  console.log(`Dry mode. Nothing was sent. Would write ${args.out}/gsc-keywords.json and gsc-top-pages.json. Add --run to call Google.`);
  process.exit(0);
}
if (!creds) {
  console.error('gsc-audit: --run needs GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY. See --help.');
  process.exit(1);
}

try {
  const token = await fetchAccessToken(creds);
  const data = await fetchSearchAnalytics(token, args.site, { ...range, rowLimit: args['row-limit'] });
  const pages = groupByPage(data.rows);
  const generatedAt = new Date().toISOString();
  const outDir = join(root, args.out);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'gsc-keywords.json'), `${JSON.stringify({ generatedAt, site: args.site, dateRange: range, totalPages: pages.length, data: pages }, null, 2)}\n`);
  writeFileSync(join(outDir, 'gsc-top-pages.json'), `${JSON.stringify({ generatedAt, site: args.site, dateRange: range, gainingPages: gainingPages(pages), pruneCandidates: pruneCandidates(pages) }, null, 2)}\n`);
  console.log(`gsc-audit: wrote ${pages.length} pages to ${args.out}.`);
} catch (e) {
  console.error(`gsc-audit: ${e.message}`);
  process.exit(1);
}

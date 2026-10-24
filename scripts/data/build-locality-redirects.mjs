#!/usr/bin/env node
/**
 * Builds src/data/locality-redirects.json: 301 map from the URL slug of a scraped locality ("projects in X")
 * to the slug of its real twin (same city, same name without "projects in "). Read by src/lib/redirects.ts.
 *
 *   node --experimental-strip-types --disable-warning=ExperimentalWarning scripts/data/build-locality-redirects.mjs [--write] [--all]
 *
 * Dry run by default: prints counts and a sample, and whether the file would change. `--write` writes the file,
 * and refuses when a target is thin or missing, equals its source, or the map has a chain or a loop.
 * Deterministic: same rows, same bytes. Scraped rows without a twin, and seed rows, are not redirected.
 * Needs Node type stripping (Node 22.18+) because the thin predicate comes from src/lib/seo/aiDiscovery.ts.
 */
import fs from 'node:fs';
import { parseArgs, readJson, srcData, writeJson } from './lib/cli.mjs';
import { buildRedirects, checkRedirects } from './lib/locality-redirects.mjs';

const args = parseArgs();
const { isScrapedName, isThinLocalityName } = await import('../../src/features/localities/thin.ts');
const rows = readJson(srcData('localities.json'));
const scraped = (r) => isScrapedName(r.name);
const thin = (r) => isThinLocalityName(r.name);

const r = buildRedirects(rows, thin, scraped);
const problems = checkRedirects(r.map, rows, thin);
const keys = Object.keys(r.map);
console.log(`Rows: ${rows.length}. Thin: ${rows.filter(thin).length}. Scraped: ${r.scraped}.`);
console.log(`Scraped rows with a real twin: ${r.withTwin} (${r.ambiguous} had more than one candidate). Without a twin: ${r.withoutTwin.length} (noindex only).`);
console.log(`Redirect keys (every URL slug that reaches those rows): ${keys.length}.`);
for (const k of args.all ? keys : keys.slice(0, 12)) console.log(`  ${k} -> ${r.map[k]}`);
if (!args.all && keys.length > 12) console.log(`  ... ${keys.length - 12} more (--all prints every pair)`);
if (args.all) for (const s of r.withoutTwin) console.log(`  no twin: ${s.slug}-${s.city.toLowerCase()}`);

const file = srcData('locality-redirects.json');
const next = `${JSON.stringify(r.map, null, 2)}\n`;
const same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === next;
console.log(same ? 'src/data/locality-redirects.json is up to date.' : 'src/data/locality-redirects.json would change.');
if (problems.length) {
  console.error(`Refusing to write: ${problems.length} problem(s).`);
  for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
  process.exit(1);
}
if (args.write) {
  writeJson(file, r.map);
  console.log(`Wrote ${keys.length} entries to src/data/locality-redirects.json.`);
} else console.log('Dry run. Add --write to write the file.');

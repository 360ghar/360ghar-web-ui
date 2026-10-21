#!/usr/bin/env node
/**
 * Step 2 of the locality pipeline: merge raw rows and build the two files the
 * site reads. Replaces the old merge-entities.mjs, build-localities-json.mjs
 * and build-localities-index.mjs.
 *
 *   node scripts/data/build-localities.mjs [--raw <entity-raw.json>] [--out <dir>] [--today YYYY-MM-DD]
 *   ... --write [--allow-removals]   copy the result into src/data (see below)
 *
 * Writes to the out dir (default: a temp folder):
 *   entity-coverage.json   full merged rows (ids, source urls, confidence)
 *   entity-duplicates.json rows that still share a slug
 *   entity-unresolved.json raw rows with no usable name
 *   localities.json        the src/data shape (coverage minus id, numericId, canonicalUrl, sourceCoverage, sourceUrls, confidence)
 *   localities-index.json  the directory index
 * and prints a diff against the files in src/data.
 *
 * `--write` copies localities.json and localities-index.json into src/data. It
 * only does so after the shape checks pass, and it refuses to drop a slug
 * (every slug is a live URL) unless `--allow-removals` is also given.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mergeEntityRecords } from './lib/entities.mjs';
import { describeDiff, diffRows } from './lib/diff.mjs';
import { checkLocalities, checkLocalitiesIndex } from './lib/schema.mjs';
import { outDir, parseArgs, readJson, srcData, writeJson } from './lib/cli.mjs';
import { isPlaceholderName } from './ingest-entities.mjs';

/** The row shape of src/data/localities.json (key order included). */
export const toLocality = ({ name, slug, city, entityType, aliases, parentLocality, geo, lastVerifiedAt, seo, description, contentBlocks, type }) => ({
  name, slug, city, entityType, aliases, parentLocality, geo, lastVerifiedAt, seo, description, contentBlocks, type,
});

/** The row shape of src/data/localities-index.json, sorted by name. */
export function buildLocalitiesIndex(localities) {
  return localities
    .map((l) => ({ slug: l.slug, name: l.name, city: l.city || 'Gurugram', entityType: l.entityType || l.type || 'Locality', type: l.type || l.entityType || 'Locality', lastVerifiedAt: l.lastVerifiedAt || null }))
    .filter((l) => l.slug && l.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Raw rows -> merged rows, duplicates and unresolved rows. */
export function buildFromRaw(raw, opts = {}) {
  const merged = mergeEntityRecords(raw, opts);
  const counts = new Map();
  for (const r of merged) counts.set(r.slug, (counts.get(r.slug) || 0) + 1);
  const duplicates = merged.filter((r) => (counts.get(r.slug) || 0) > 1);
  const unresolved = raw.filter((r) => {
    const name = String(r?.name || '').trim();
    return !name || name.length < 3 || isPlaceholderName(name);
  });
  const localities = merged.map(toLocality);
  const index = buildLocalitiesIndex(localities);
  return { merged, duplicates, unresolved, localities, index };
}

async function main() {
  const args = parseArgs();
  const out = outDir(args);
  const rawFile = path.resolve(String(args.raw || path.join(out, 'entity-raw.json')));
  if (!fs.existsSync(rawFile)) throw new Error(`Missing raw file ${rawFile}. Run scripts/data/ingest-entities.mjs first, or pass --raw.`);
  const raw = readJson(rawFile);
  const { merged, duplicates, unresolved, localities, index } = buildFromRaw(raw, args.today ? { today: String(args.today) } : {});

  writeJson(path.join(out, 'entity-coverage.json'), merged);
  writeJson(path.join(out, 'entity-duplicates.json'), duplicates);
  writeJson(path.join(out, 'entity-unresolved.json'), unresolved);
  writeJson(path.join(out, 'localities.json'), localities);
  writeJson(path.join(out, 'localities-index.json'), index);
  console.log(`Raw rows: ${raw.length}. Merged: ${merged.length}. Still sharing a slug: ${duplicates.length}. Unresolved raw rows: ${unresolved.length}.`);
  console.log(`Wrote 5 files -> ${out}`);

  const problems = [...checkLocalities(localities), ...checkLocalitiesIndex(index, localities)];
  if (problems.length) console.error(`Shape problems:\n  ${problems.join('\n  ')}`);
  else console.log('Shape check: ok (same checks as scripts/__tests__/data-schema.test.mjs)');

  const cur = fs.existsSync(srcData('localities.json')) ? readJson(srcData('localities.json')) : [];
  const curIndex = fs.existsSync(srcData('localities-index.json')) ? readJson(srcData('localities-index.json')) : [];
  const dLoc = diffRows(cur, localities, (r) => r.slug);
  const dIdx = diffRows(curIndex, index, (r) => r.slug);
  console.log(`Diff vs src/data:\n  ${describeDiff('localities.json', dLoc)}\n  ${describeDiff('localities-index.json', dIdx)}`);

  if (!args.write) return console.log('Dry run. Nothing written to src/data (add --write to copy).');
  if (problems.length) throw new Error('Refusing to write: shape problems above.');
  if (dLoc.removed.length && !args['allow-removals']) throw new Error(`Refusing to write: ${dLoc.removed.length} slugs would disappear (each is a live URL). Add --allow-removals if that is intended. First: ${dLoc.removed.slice(0, 5).join(', ')}`);
  if (dLoc.identical && dIdx.identical) return console.log('src/data already matches. Nothing to write.');
  fs.copyFileSync(path.join(out, 'localities.json'), srcData('localities.json'));
  fs.copyFileSync(path.join(out, 'localities-index.json'), srcData('localities-index.json'));
  console.log('Copied localities.json and localities-index.json into src/data.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

#!/usr/bin/env node
/**
 * Builds src/data/area-index.json: the list of Gurugram sectors, localities,
 * societies, roads, townships, phases and villages that the search boxes
 * suggest in the browser. The source (src/data/localities.json) stays
 * server-only.
 *
 *   node --experimental-strip-types --disable-warning=ExperimentalWarning scripts/data/build-area-index.mjs [--write]
 *
 * Dry run by default: prints counts and whether the file would change.
 * `--write` writes it. Deterministic: same rows, same bytes. Needs Node type
 * stripping (Node 22.18+) because the thin predicate and display helper come
 * from src/features/localities/thin.ts.
 */
import fs from 'node:fs';
import { parseArgs, readJson, srcData, writeJson } from './lib/cli.mjs';
import { buildAreaIndex } from './lib/area-index.mjs';
import { checkAreaIndex } from './lib/schema.mjs';

const args = parseArgs();
const { displayName, isThinLocalityName } = await import('../../src/features/localities/thin.ts');
const rows = readJson(srcData('localities.json'));
const thin = (name) => isThinLocalityName(name);
const index = buildAreaIndex(rows, { isThin: thin, display: displayName });
const problems = checkAreaIndex(index, rows, thin);

console.log(`Rows: ${rows.length}. Areas kept: ${index.areas.length}. Popular: ${index.popular.length}.`);
for (const area of index.areas.slice(0, 10)) console.log(`  ${area.n} (${area.t})${area.a ? ` [${area.a.join(', ')}]` : ''}`);
if (index.areas.length > 10) console.log(`  ... ${index.areas.length - 10} more`);

const file = srcData('area-index.json');
const next = `${JSON.stringify(index, null, 2)}\n`;
const same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === next;
console.log(same ? 'src/data/area-index.json is up to date.' : 'src/data/area-index.json would change.');
if (problems.length) {
  console.error(`Refusing to write: ${problems.length} problem(s).`);
  for (const problem of problems.slice(0, 20)) console.error(`  ${problem}`);
  process.exit(1);
}
if (args.write) {
  writeJson(file, index);
  console.log(`Wrote ${index.areas.length} areas to src/data/area-index.json.`);
} else console.log('Dry run. Add --write to write the file.');

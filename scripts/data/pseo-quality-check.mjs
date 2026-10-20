#!/usr/bin/env node
/**
 * pSEO quality check for landing pages, price context and locality pages.
 *
 *   node scripts/data/pseo-quality-check.mjs [--out <dir>] [--prune <file>] [--strict]
 *
 * The rules are in lib/pseo.mjs. The v2 landing model and copy are TypeScript
 * with "@/" imports, so the run goes through Vitest (which already resolves
 * them): this script starts scripts/__tests__/pseo-quality.gate.test.mjs and
 * passes the options as environment variables. The report is written to
 * pseo-quality.json in the out dir (default: a temp folder). Exit code 1 when
 * a rule of level "error" fails; `--strict` fails on warnings too.
 *
 * Same thing without this wrapper: `npx vitest run scripts/__tests__/pseo-quality.gate.test.mjs`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { outDir, parseArgs } from './lib/cli.mjs';

export const GATE_TEST = 'scripts/__tests__/pseo-quality.gate.test.mjs';

function main() {
  const args = parseArgs();
  const out = outDir(args);
  const env = { ...process.env, PSEO_OUT: out, PSEO_STRICT: args.strict ? '1' : '', PSEO_PRUNE: args.prune ? path.resolve(String(args.prune)) : '' };
  const run = spawnSync('npx', ['vitest', 'run', GATE_TEST], { stdio: 'inherit', env, cwd: process.cwd() });
  const file = path.join(out, 'pseo-quality.json');
  if (fs.existsSync(file)) {
    const r = JSON.parse(fs.readFileSync(file, 'utf8'));
    const { landing, localities } = r.summary;
    console.log(`Landing pages: ${landing.pages} (${landing.indexable} indexable, ${landing.noindex} noindex). Price context: ${landing.priceContext.type} by type, ${landing.priceContext.default} city default, ${landing.priceContext.none} none.`);
    console.log(`Localities: ${localities.total}. Scraped "projects in" names: ${localities.scrapedNames}. Made-up seed names: ${localities.generatedSeeds}.`);
    console.log(`Errors: ${r.errors.length}. Warnings: ${r.warnings.length}.`);
    for (const e of r.errors.slice(0, 20)) console.log(`  error: ${e}`);
    for (const w of r.warnings.filter((x) => !/^\//.test(x))) console.log(`  warning: ${w}`);
  }
  console.log(`Report: ${file}`);
  process.exit(run.status ?? 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

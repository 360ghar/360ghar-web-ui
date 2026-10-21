#!/usr/bin/env node
/**
 * Validates JSON-LD.
 *   default          the site-wide blocks and the old generators' samples (src/lib/seo/fixtures.ts)
 *   --url <u,...>    fetch pages (GET) and validate the JSON-LD they carry
 *   --file <path>    validate the JSON-LD in a saved HTML file
 * Exit code 1 if any block has an error (or a warning with --strict).
 * Needs Node 22.18+ (or 22.6+ with --experimental-strip-types) to load the .ts modules.
 */
import { readFileSync } from 'node:fs';
import { helpText, parseArgs } from './lib/args.mjs';

const SPEC = {
  url: { type: 'string', help: 'Page URL to fetch and check (comma list allowed).' },
  file: { type: 'string', help: 'HTML file to check.' },
  strict: { type: 'boolean', default: false, help: 'Treat warnings as errors.' },
  quiet: { type: 'boolean', default: false, help: 'Print only failures and the summary.' },
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
  console.log(helpText('validate-structured-data', 'check JSON-LD for required fields, types, URLs and dates.', SPEC));
  process.exit(0);
}

const { extractJsonLd, formatReport, validateBlocks } = await import('../src/lib/seo/validate.ts');

/** [name, blocks, parseErrors][] */
const jobs = [];
if (args.url || args.file) {
  for (const u of (args.url ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    try {
      const res = await fetch(u, { signal: AbortSignal.timeout(30_000), headers: { 'User-Agent': '360ghar-schema-validator' } });
      if (!res.ok) throw new Error(`answered ${res.status}`);
      const { blocks, parseErrors } = extractJsonLd(await res.text());
      jobs.push([u, blocks, parseErrors]);
    } catch (e) {
      jobs.push([u, [], [`fetch failed: ${e.message}`]]);
    }
  }
  if (args.file) {
    const { blocks, parseErrors } = extractJsonLd(readFileSync(args.file, 'utf8'));
    jobs.push([args.file, blocks, parseErrors]);
  }
} else {
  const { fixtureBlocks } = await import('../src/lib/seo/fixtures.ts');
  for (const [name, blocks] of Object.entries(fixtureBlocks())) jobs.push([name, blocks, []]);
}

let failed = 0;
let warnings = 0;
for (const [name, blocks, parseErrors] of jobs) {
  const r = validateBlocks(blocks, name);
  for (const message of parseErrors) r.errors.push({ message, path: name });
  if (args.url || args.file) {
    if (!blocks.length && !parseErrors.length) r.errors.push({ message: 'Page has no JSON-LD', path: name });
  }
  r.isValid = r.errors.length === 0;
  warnings += r.warnings.length;
  const bad = !r.isValid || (args.strict && r.warnings.length > 0);
  if (bad) failed += 1;
  if (bad || !args.quiet) console.log(formatReport(`${name} [${blocks.length} block(s)]`, r));
}
console.log(`\n${jobs.length - failed}/${jobs.length} passed, ${warnings} warning(s).`);
process.exit(failed ? 1 : 0);

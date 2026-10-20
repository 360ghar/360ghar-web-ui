/**
 * The pSEO quality gate on the real v2 code and data. Run it with
 * `node scripts/data/pseo-quality-check.mjs` (writes a report) or with the rest
 * of the tests. Environment: PSEO_OUT (report folder), PSEO_STRICT=1 (warnings
 * fail), PSEO_PRUNE (prune-list file).
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import landingTypeContext from '@/data/landingTypeContext.json';
import priceContext from '@/data/priceContext.json';
import { landingCopy } from '@/features/landing/copy';
import { CITIES, INTENTS, TYPE_SEGMENTS, budgetsFor, isIndexable, parseBhk, parseLanding } from '@/features/landing/model';
import { ALL_LOCALITIES, isGeneratedSeed, isScrapedName } from '@/features/localities/data';
import { BUDGETS } from '@/features/search/filters';
import { legacyRedirect } from '@/lib/redirects';
import { runPseoCheck } from '../data/lib/pseo.mjs';

const deps = { CITIES, INTENTS, TYPE_SEGMENTS, parseLanding, parseBhk, budgetsFor, isIndexable, landingCopy, priceContext, typeContext: landingTypeContext, legacyRedirect, BUDGETS, localities: ALL_LOCALITIES, isScrapedName, isGeneratedSeed };
const pruneFile = process.env.PSEO_PRUNE || path.join(process.cwd(), 'scripts', 'data', 'fixtures', 'pseo-prune-list.json');
const prune = JSON.parse(fs.readFileSync(pruneFile, 'utf8'));

describe('pSEO quality gate (v2 landing pages and localities)', () => {
  const result = runPseoCheck(deps, prune);

  it('writes the report when PSEO_OUT is set', () => {
    if (process.env.PSEO_OUT) {
      const report = { summary: { landing: result.landing.summary, localities: result.localities.summary, errors: result.errors.length, warnings: result.warnings.length }, errors: result.errors, warnings: result.warnings, prune: result.prune.rows, landingPages: result.landing.pages, localityExamples: result.localities.examples };
      fs.writeFileSync(path.join(process.env.PSEO_OUT, 'pseo-quality.json'), `${JSON.stringify(report, null, 2)}\n`);
    }
    // Printed so that the CLI wrapper shows the numbers.
    console.log(`pSEO: ${result.landing.summary.pages} landing pages (${result.landing.summary.indexable} indexable), ${result.localities.summary.total} localities, ${result.errors.length} errors, ${result.warnings.length} warnings`);
    for (const w of result.localities.warnings) console.log(`  warning: ${w}`);
    expect(result.landing.summary.pages).toBeGreaterThan(400);
  });

  it('has no errors', () => {
    expect(result.errors).toEqual([]);
  });

  it('covers every prune-list path (301, 404 or noindex)', () => {
    expect(result.prune.errors).toEqual([]);
    expect(result.prune.rows.length).toBeGreaterThan(0);
  });

  it.runIf(process.env.PSEO_STRICT === '1')('has no warnings (strict)', () => {
    expect(result.warnings).toEqual([]);
  });
});

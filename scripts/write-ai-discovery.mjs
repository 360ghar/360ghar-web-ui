#!/usr/bin/env node
/**
 * Regenerates the AI-discovery files from src/lib/seo/aiDiscovery.ts:
 *   public/llms.txt, public/llms-full.txt, public/data/llm-feed.json,
 *   public/.well-known/ai.txt, public/.well-known/api-catalog
 *
 * Safe default: nothing in public/ is touched. The output goes to a temp folder
 * and a diff against the current files is printed. Add --write to overwrite.
 * Needs Node 22.18+ (or 22.6+ with --experimental-strip-types) to load the .ts module.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { helpText, parseArgs } from './lib/args.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC = {
  write: { type: 'boolean', default: false, help: 'Overwrite the files in public/. Without it, only a diff is printed.' },
  out: { type: 'string', help: 'Keep the generated files in this folder instead of a fresh temp folder.' },
  date: { type: 'string', help: 'Value of metadata.last_updated in llm-feed.json (YYYY-MM-DD).', default: new Date().toISOString().slice(0, 10) },
  full: { type: 'boolean', default: false, help: 'Print the whole diff (default: first 80 lines per file).' },
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
  console.log(helpText('write-ai-discovery', 'regenerate llms.txt, llms-full.txt, llm-feed.json, ai.txt and api-catalog.', SPEC));
  process.exit(0);
}

const { buildAiDiscoveryArtifacts } = await import('../src/lib/seo/aiDiscovery.ts');
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8'));
const a = buildAiDiscoveryArtifacts({ priceContext: readJson('src/data/priceContext.json'), localitiesIndex: readJson('src/data/localities-index.json'), landmarks: readJson('src/data/locality-landmarks.json'), today: args.date });

const files = {
  'llms.txt': a.llmsTxt,
  'llms-full.txt': a.llmsFullTxt,
  'data/llm-feed.json': `${JSON.stringify(a.llmFeed, null, 2)}\n`,
  '.well-known/ai.txt': a.aiTxt,
  '.well-known/api-catalog': `${JSON.stringify(a.apiCatalog, null, 2)}\n`,
};

const outDir = args.out ?? mkdtempSync(join(tmpdir(), 'ai-discovery-'));
let changed = 0;
for (const [rel, content] of Object.entries(files)) {
  const tmp = join(outDir, rel);
  mkdirSync(dirname(tmp), { recursive: true });
  writeFileSync(tmp, content);
  const live = join(root, 'public', rel);
  const same = existsSync(live) && readFileSync(live, 'utf8') === content;
  if (same) {
    console.log(`same     public/${rel}`);
    continue;
  }
  changed += 1;
  console.log(`${existsSync(live) ? 'changed ' : 'new     '} public/${rel}`);
  if (!args.write) {
    const diff = spawnSync('diff', ['-u', live, tmp], { encoding: 'utf8' });
    const lines = (diff.stdout || '(diff is not available)').split('\n');
    console.log(lines.slice(0, args.full ? undefined : 80).join('\n'));
    if (!args.full && lines.length > 80) console.log(`... ${lines.length - 80} more lines (use --full)`);
  }
}

if (args.write) {
  for (const [rel, content] of Object.entries(files)) {
    const live = join(root, 'public', rel);
    mkdirSync(dirname(live), { recursive: true });
    writeFileSync(live, content);
  }
  console.log(`Wrote ${changed} changed file(s) to public/.`);
} else {
  console.log(`\nDry run: ${changed} file(s) differ. Generated copy: ${outDir}\nRun again with --write to update public/.`);
}

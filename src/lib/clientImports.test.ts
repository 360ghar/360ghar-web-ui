import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards the browser bundle. A React island (or anything a .tsx under src/features or src/ui imports) must not reach
 * server-only code: `sanitize-html` and Node built-ins break in the browser (a chat panel once failed to load because
 * chat/markdown.ts imported content/shared/cms.ts, which imports sanitize-html). This is a regex scan of static
 * imports, `export ... from` and dynamic `import('...')`; `import type` is skipped because it is erased at build.
 */
const SRC = resolve(__dirname, '..');
const ROOT = resolve(SRC, '..');

const FORBIDDEN_PACKAGES = ['sanitize-html', 'fs', 'path'];
const FORBIDDEN_FILES = [
  'src/features/content/shared/cms.ts',
  'src/data/localities.json',
  'src/data/localities-index.json',
  'src/features/localities/data.ts',
];
/** "importer -> import": modules that are only ever used on the server, with the reason. Empty is best. */
const ALLOW: Record<string, string> = {};

const EXT = ['.ts', '.tsx', '.js', '.json'];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.tsx') && !p.endsWith('.test.tsx')) out.push(p);
  }
  return out;
}

/** Specifiers of the runtime imports of a source file. */
function importsOf(code: string): string[] {
  const noComments = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const found: string[] = [];
  const re = /(?:^|[\s;}])(import|export)\s+(type\s+)?(?:[\w*${}\s,]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const m of noComments.matchAll(re)) {
    // `import type` and `export type` are erased. `import { type A }` still loads the module, so it stays.
    if (m[2]) continue;
    if (m[1] === 'export' && !/\sfrom\s/.test(m[0])) continue;
    found.push((m[3] ?? m[4])!);
  }
  return found;
}

function resolveLocal(from: string, spec: string): string | null {
  const base = spec.startsWith('@/') ? join(SRC, spec.slice(2)) : spec.startsWith('.') ? resolve(dirname(from), spec) : null;
  if (!base) return null;
  for (const c of [base, ...EXT.map((e) => base + e), ...EXT.map((e) => join(base, `index${e}`))]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/** Every violation reachable from the client roots, as "root -> ... -> importer imports spec". */
function scan(roots: string[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const visit = (file: string, trail: string[]) => {
    if (seen.has(file)) return;
    seen.add(file);
    const rel = relative(ROOT, file);
    if (file.endsWith('.json')) return;
    for (const spec of importsOf(readFileSync(file, 'utf8'))) {
      const target = resolveLocal(file, spec);
      const targetRel = target ? relative(ROOT, target) : null;
      const bad =
        FORBIDDEN_PACKAGES.includes(spec) ||
        spec.startsWith('node:') ||
        spec.endsWith('.astro') ||
        (targetRel !== null && (FORBIDDEN_FILES.includes(targetRel) || targetRel.endsWith('.astro')));
      if (bad && !ALLOW[`${rel} -> ${spec}`]) problems.push(`${[...trail, rel].join(' -> ')} imports ${spec}`);
      if (target && !bad) visit(target, [...trail, rel]);
    }
  };
  for (const r of roots) visit(r, []);
  return problems;
}

describe('client bundle imports', () => {
  it('no island or client module reaches sanitize-html, Node built-ins, the CMS, the locality data or an .astro file', () => {
    const roots = [...walk(join(SRC, 'features')), ...walk(join(SRC, 'ui'))];
    expect(roots.length).toBeGreaterThan(20);
    expect(scan(roots)).toEqual([]);
  });

  it('the scanner sees each kind of import, and skips type-only ones', () => {
    const code = `
      import a from 'sanitize-html';
      import { b } from "node:fs";
      import type { T } from 'fs';
      export { c } from 'path';
      export type { U } from 'fs';
      const d = await import('@/x.astro');
      // import e from 'fs';
    `;
    expect(importsOf(code)).toEqual(['sanitize-html', 'node:fs', 'path', '@/x.astro']);
  });

  it('finds a forbidden import two files deep', () => {
    const dir = mkdtempSync(join(tmpdir(), 'client-imports-'));
    mkdirSync(join(dir, 'lib'));
    writeFileSync(join(dir, 'Island.tsx'), "import { md } from './lib/markdown';\nexport const I = () => md;\n");
    writeFileSync(join(dir, 'lib/markdown.ts'), "import { clean } from './cms';\nexport const md = clean;\n");
    writeFileSync(join(dir, 'lib/cms.ts'), "import sanitize from 'sanitize-html';\nexport const clean = sanitize;\n");
    const problems = scan([join(dir, 'Island.tsx')]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/Island\.tsx -> .*markdown\.ts -> .*cms\.ts imports sanitize-html/);
  });

  it('every allowlist entry is still needed', () => {
    expect(Object.keys(ALLOW)).toEqual([]);
  });
});

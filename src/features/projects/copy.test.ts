import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The `projects` namespace is the i18n layer for the project-intelligence pages.
 * These checks keep it honest: both locales carry the same keys, Hindi is a real
 * translation rather than a copy of English, and every key a page or component
 * asks for exists in both locales (a missing key renders as an empty string in
 * production, which is invisible in review).
 */

const read = (path: string) => readFileSync(path, 'utf8');
const en = JSON.parse(read('src/i18n/locales/en/projects.json')) as Record<string, unknown>;
const hi = JSON.parse(read('src/i18n/locales/hi/projects.json')) as Record<string, unknown>;

/** Every leaf path of a nested object, as "a.b.c". */
function leaves(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

function valueAt(dict: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((cur, part) => (typeof cur === 'object' && cur !== null ? (cur as Record<string, unknown>)[part] : undefined), dict);
}

function sources(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) sources(path, out);
    else if (/\.(ts|tsx|astro)$/.test(path) && !path.endsWith('.test.ts')) out.push(path);
  }
  return out;
}

describe('projects i18n namespace', () => {
  it('has the same keys in English and Hindi', () => {
    expect(leaves(hi).sort()).toEqual(leaves(en).sort());
  });

  it('translates every Hindi string instead of copying English', () => {
    const copied = leaves(en).filter((path) => {
      const english = valueAt(en, path);
      const hindi = valueAt(hi, path);
      // A shared value is fine for a placeholder, a brand name or a URL-like label.
      return typeof english === 'string' && english === hindi && /[a-z]{3}/i.test(english);
    });
    expect(copied).toEqual([]);
  });

  it('resolves every projects: key used by the feature', () => {
    const used = new Set<string>();
    for (const file of sources('src/features/projects')) {
      for (const match of read(file).matchAll(/['"`]projects:([a-zA-Z0-9_.]+)['"`]/g)) used.add(match[1]!);
    }
    expect(used.size).toBeGreaterThan(8);
    const missing = [...used].filter((path) => typeof valueAt(en, path) !== 'string' || typeof valueAt(hi, path) !== 'string');
    expect(missing).toEqual([]);
  });
});

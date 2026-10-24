import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CELEBRITY_HOMES, celebrityCards } from './data';

/** Route patterns of src/pages ("/blog/[slug]" -> /^\/blog\/[^/]+$/), for the English site and /hi. */
function routePatterns(): RegExp[] {
  const root = path.join(process.cwd(), 'src', 'pages');
  const out: RegExp[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.astro')) {
        const route = `/${path.relative(root, full).replace(/\.astro$/, '').replace(/\/index$/, '')}`.replace(/^\/index$/, '/');
        if (route.includes('[...')) continue;
        out.push(new RegExp(`^${route.split('/').map((s) => (/^\[.+\]$/.test(s) ? '[^/]+' : s.replace(/[.*+?^${}()|\\]/g, '\\$&'))).join('/')}$`));
      }
    }
  };
  walk(root);
  return out;
}
const known = (href: string) => routePatterns().some((r) => r.test(href));

describe('celebrity cards', () => {
  it('has 16 unique slugs', () => {
    expect(CELEBRITY_HOMES).toHaveLength(16);
    expect(new Set(CELEBRITY_HOMES.map((c) => c.slug)).size).toBe(16);
  });

  it('links no card when no post exists (the live API has none of the 16)', () => {
    expect(celebrityCards(new Set()).every((c) => c.post === null)).toBe(true);
  });

  it('links only the cards whose post exists', () => {
    const slug = CELEBRITY_HOMES[3]!.slug;
    const cards = celebrityCards(new Set([slug, 'a-post-that-is-not-a-card']));
    expect(cards.filter((c) => c.post).map((c) => c.post)).toEqual([`/blog/${slug}`]);
  });

  it('every link resolves to a route pattern of the site, in English and Hindi', () => {
    const all = celebrityCards(new Set(CELEBRITY_HOMES.map((c) => c.slug)));
    for (const c of all) {
      expect(known(c.post!), c.post!).toBe(true);
      expect(known(`/hi${c.post}`), `/hi${c.post}`).toBe(true);
    }
    expect(known('/blog/does-not-need-to-exist')).toBe(true);
    expect(known('/nowhere/at-all')).toBe(false);
  });

  it('the held page has no link of its own', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/features/content/celebrity/CelebrityPage.astro'), 'utf8');
    const hrefs = [...src.matchAll(/href=(\{[^}]*\}|"[^"]*")/g)].map((m) => m[1]);
    expect(hrefs).toEqual([]);
  });
});

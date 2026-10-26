import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('held project routes', () => {
  it.each([
    ['catalog', 'src/pages/project.astro'],
    // `[title].astro` was deleted: one segment is `[slug].astro`, which is the detail route.
    ['detail', 'src/pages/project/[slug].astro'],
  ])('%s route does not load project listings', (_name, path) => {
    const route = readFileSync(path, 'utf8');
    expect(route).not.toMatch(/\b(projectCounts|loadProject|liveHomes)\b/);
  });
});

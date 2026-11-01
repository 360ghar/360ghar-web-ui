import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { HERO_PRELOAD_IDS, LCP_LAYER_ID } from './gurugram';

// Vitest stubs CSS imports (css processing off), so layers.ts sees an empty
// file and cannot resolve the scene's --color-* vars. Read the real tokens.
vi.mock('@/styles/global.css?raw', async () => {
  const css = readFileSync(new URL('../../../styles/global.css', import.meta.url), 'utf8');
  return { default: css };
});

const { DIORAMA_LAYERS, HERO_PRELOAD_SRCS } = await import('./layers');

describe('diorama layers', () => {
  it('builds all 20 scene layers with versioned sources', () => {
    expect(DIORAMA_LAYERS).toHaveLength(20);
    for (const layer of DIORAMA_LAYERS) {
      expect(layer.src).toMatch(new RegExp(`^/diorama/${layer.id}\\.svg\\?v=[0-9a-f]{8}$`));
    }
  });

  it('preloads only the first-painted hero layers, LCP layer first', () => {
    const srcs = new Map(DIORAMA_LAYERS.map((layer) => [layer.id, layer.src]));
    expect(HERO_PRELOAD_SRCS).toHaveLength(HERO_PRELOAD_IDS.length);
    expect(HERO_PRELOAD_SRCS[0]).toBe(srcs.get(LCP_LAYER_ID));
    expect([...srcs.values()]).toEqual(expect.arrayContaining(HERO_PRELOAD_SRCS));
  });
});

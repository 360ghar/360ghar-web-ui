import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PaperArt } from '@/ui/paper/PaperArt';
import { PaperVignette } from '@/ui/paper/PaperVignette';
import { sceneLayers } from '@/ui/states/scenes';
import { SHADOW_SIZES, SHARED_SHADOWS, sharedShadowId } from './defs';
import { paperUid } from './uid';
import { VIGNETTE_THEMES, vignetteLayers } from './vignettes';

const paths = (layers: { cut: string[]; solid: string[] }[]) => layers.flatMap((l) => [...l.cut, ...l.solid]).join('');

describe('vignettes', () => {
  for (const theme of VIGNETTE_THEMES) {
    it(`${theme}: finite coordinates, same seed same drawing, new seed new cut`, () => {
      const d = paths(vignetteLayers(theme, 'a'));
      expect(d.length).toBeGreaterThan(200);
      expect(d).not.toMatch(/NaN|Infinity|undefined/);
      // Every number sits near the 160 x 100 box (shapes may bleed a few units past the edge).
      for (const n of d.match(/-?\d+(\.\d+)?/g) ?? []) expect(Math.abs(Number(n))).toBeLessThan(200);
      expect(paths(vignetteLayers(theme, 'a'))).toBe(d);
      expect(paths(vignetteLayers(theme, 'b'))).not.toBe(d);
      const ids = vignetteLayers(theme).map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }

  it('state scenes have unique layer ids and finite coordinates', () => {
    for (const name of ['empty', 'error', 'notFound', 'offline'] as const) {
      const ids = sceneLayers(name).map((l) => l.id);
      expect(new Set(ids).size, name).toBe(ids.length);
      expect(paths(sceneLayers(name))).not.toMatch(/NaN|Infinity|undefined/);
    }
  });
});

describe('filter ids', () => {
  it('paperUid never repeats within a page', () => {
    const ids = Array.from({ length: 500 }, () => paperUid());
    expect(new Set(ids).size).toBe(500);
  });

  it('two React vignettes of the same theme in one tree keep their own clip ids and share the shadows', () => {
    const html = renderToString(createElement('div', null, createElement(PaperVignette, { theme: 'home' }), createElement(PaperVignette, { theme: 'home' })));
    const ids = [...html.matchAll(/<(?:filter|clipPath) id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(ids.length);
    // Every url(#id) points at a local definition or at a shared shadow in PaperDefs.
    const shared = new Set(SHARED_SHADOWS.map((f) => f.id));
    const refs = [...html.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]!);
    expect(refs.filter((r) => shared.has(r)).length).toBeGreaterThan(4);
    for (const r of refs) expect(ids.includes(r) || shared.has(r), r).toBe(true);
  });

  it('fit="slice" covers the box; the default keeps the whole scene', () => {
    const slice = renderToString(createElement(PaperVignette, { theme: 'park', fit: 'slice' }));
    expect(slice).toContain('preserveAspectRatio="xMidYMax slice"');
    expect(slice).toContain('height:100%');
    const meet = renderToString(createElement(PaperVignette, { theme: 'park' }));
    expect(meet).not.toContain('preserveAspectRatio');
    expect(meet).toContain('height:auto');
  });

  it('with ownFilters, a vignette draws its own filters again', () => {
    const html = renderToString(createElement(PaperArt, { layers: vignetteLayers('home'), width: 160, height: 100, shadow: [1.4, 2, 0.7], ownFilters: true }));
    expect(html).not.toContain('url(#pc-');
    expect((html.match(/<filter /g) ?? []).length).toBeGreaterThan(3);
  });
});

describe('shared shadows', () => {
  it('maps every kit layer to a shared filter at the kit sizes', () => {
    for (const theme of VIGNETTE_THEMES)
      for (const l of vignetteLayers(theme)) if (l.shadow !== 'transparent') expect(sharedShadowId(l.shadow, SHADOW_SIZES.s), `${theme}/${l.id}`).not.toBeNull();
    for (const name of ['empty', 'error', 'notFound', 'offline'] as const)
      for (const l of sceneLayers(name)) if (l.shadow !== 'transparent') expect(sharedShadowId(l.shadow, SHADOW_SIZES.m), `${name}/${l.id}`).not.toBeNull();
  });

  it('matches near tints, and refuses other tints and sizes', () => {
    expect(sharedShadowId('rgb(226 91 0 / 0.28)', [2, 3, 1.1])).toBe('pc-m1');
    expect(sharedShadowId('rgb(47 15 2 / 0.5)', [3, 4, 1.4])).toBe('pc-l5');
    expect(sharedShadowId('rgb(138 51 0 / 0.3)', [1.4, 2, 0.7])).toBe('pc-s6');
    expect(sharedShadowId('rgb(0 0 0 / 0.35)', [2, 3, 1.1])).toBeNull();
    expect(sharedShadowId('rgb(226 91 0 / 0.16)', [2, 3, 1.1])).toBeNull();
    expect(sharedShadowId('rgb(226 91 0 / 0.3)', [3, 4, 1.6])).toBeNull();
    expect(sharedShadowId('var(--x)', [2, 3, 1.1])).toBeNull();
    expect(new Set(SHARED_SHADOWS.map((f) => f.id)).size).toBe(18);
  });
});

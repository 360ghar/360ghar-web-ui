import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SHARED_SHADOWS } from '@/lib/paper/defs';
import { SceneArt } from './SceneArt';
import { paperArt, SCENE_NAMES } from './scenes';

const shared = new Set(SHARED_SHADOWS.map((s) => s.id));

describe('SceneArt filters', () => {
  it('points every layer at a shared paper shadow or at a filter in the same svg', () => {
    for (const name of SCENE_NAMES)
      for (const wide of [false, true]) {
        const html = renderToStaticMarkup(createElement(SceneArt, { art: paperArt(name, 'test', { wide }) }));
        const own = new Set([...html.matchAll(/<filter id="([^"]+)"/g)].map((m) => m[1]));
        for (const [, id] of html.matchAll(/url\(#([^)]+)\)/g)) expect(shared.has(id!) || own.has(id!), `${name} ${wide} ${id}`).toBe(true);
      }
  });
});

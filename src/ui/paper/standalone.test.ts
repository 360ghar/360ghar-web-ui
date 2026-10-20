import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SCENE_NAMES } from '@/features/blog/art/scenes';
import { GET, getStaticPaths } from '@/pages/art/[kind]/[name].svg';
import { GET as mapGET } from '@/pages/art/map/[id].svg';
import { PALETTE, plainColors } from './standalone';

const files = getStaticPaths().map(({ params }) => `${params.kind}/${params.name}`);

describe('art files (src/pages/art)', () => {
  it('lists the files the pages ask for', () => {
    for (const s of SCENE_NAMES) expect(files).toContain(`scene/${s}`);
    for (const f of ['home/tour', 'home/owners-bare', 'vignette/document-menu', 'vignette/calculator-menu', 'vignette/calculator-home-0', 'skyline/footer', 'skyline/menu'])
      expect(files).toContain(f);
  });

  it('serves each one as a self-contained SVG: namespace, plain colours, only its own filters', async () => {
    for (const f of files) {
      const [kind, name] = f.split('/');
      const res = await GET({ params: { kind, name } } as unknown as Parameters<typeof GET>[0]);
      const svg = await res.text();
      expect(res.headers.get('Content-Type'), f).toContain('image/svg+xml');
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="'), f).toBe(true);
      expect(svg, f).not.toContain('var(');
      const ids = new Set([...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
      for (const [, id] of svg.matchAll(/url\(#([^)]+)\)/g)) expect(ids.has(id), `${f} ${id}`).toBe(true);
    }
  });

  it('draws a listing\'s street plan for any listing id, the same each time', async () => {
    const get = (id: string) => mapGET({ params: { id } } as unknown as Parameters<typeof mapGET>[0]) as Promise<Response>;
    const res = await get('182');
    const svg = await res.text();
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');
    expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320"')).toBe(true);
    expect(svg).not.toContain('var(');
    const ids = new Set([...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
    for (const [, id] of svg.matchAll(/url\(#([^)]+)\)/g)) expect(ids.has(id), id).toBe(true);
    expect(await (await get('182')).text()).toBe(svg);
    expect(await (await get('97')).text()).not.toBe(svg);
    for (const bad of ['0', '012', 'abc', '1e5', '1234567890']) expect((await get(bad)).status, bad).toBe(404);
  });

  it('has the same palette as global.css', () => {
    const css = readFileSync(new URL('../../styles/global.css', import.meta.url), 'utf8');
    for (const [name, hex] of Object.entries(PALETTE)) expect(css, name).toMatch(new RegExp(`--color-${name}:\\s*${hex};`, 'i'));
  });

  it('writes the palette colours out', () => {
    expect(plainColors('fill="var(--color-kesar-500)" x="var(--color-nope)"')).toBe('fill="#ff6b00" x="var(--color-nope)"');
  });
});

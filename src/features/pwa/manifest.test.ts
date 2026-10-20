import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const publicDir = new URL('../../../public/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.webmanifest', publicDir), 'utf8')) as {
  id: string;
  name: string;
  short_name: string;
  lang: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: { src: string; sizes: string; type: string; purpose?: string }[];
};

/** Width and height from the PNG IHDR chunk (bytes 16 to 24). */
function pngSize(file: URL) {
  const b = readFileSync(file);
  expect(b.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

describe('web app manifest', () => {
  it('is installable: standalone, with id, scope, start URL, names and language', () => {
    expect(manifest.display).toBe('standalone');
    expect(manifest.id).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.start_url.startsWith(manifest.scope)).toBe(true);
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.lang).toBe('en-IN');
  });

  it('uses the same theme colour as Base.astro', () => {
    const base = readFileSync(new URL('../../layouts/Base.astro', import.meta.url), 'utf8');
    expect(base).toContain(`<meta name="theme-color" content="${manifest.theme_color}" />`);
    expect(manifest.theme_color).toBe('#ff6b00');
    expect(manifest.background_color).toBe('#ffffff');
  });

  it('has a 192, a 512 and a maskable 512 icon', () => {
    const has = (size: string, purpose: string) => manifest.icons.some((i) => i.sizes === size && (i.purpose ?? 'any') === purpose);
    expect(has('192x192', 'any')).toBe(true);
    expect(has('512x512', 'any')).toBe(true);
    expect(has('512x512', 'maskable')).toBe(true);
  });

  it('points every icon at a real PNG whose size matches what it declares', () => {
    for (const icon of manifest.icons) {
      const file = new URL(icon.src.replace(/^\//, ''), publicDir);
      expect(existsSync(file), icon.src).toBe(true);
      expect(icon.type).toBe('image/png');
      const { w, h } = pngSize(file);
      expect(`${w}x${h}`, icon.src).toBe(icon.sizes);
    }
  });

  it('links the page icons Base.astro declares to real files', () => {
    const base = readFileSync(new URL('../../layouts/Base.astro', import.meta.url), 'utf8');
    for (const m of base.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*href="(\/[^"]+)"/g)) expect(existsSync(new URL(m[1]!.replace(/^\//, ''), publicDir)), m[1]).toBe(true);
    const apple = pngSize(new URL('assets/images/logo/apple-touch-icon.png', publicDir));
    expect([apple.w, apple.h]).toEqual([180, 180]);
  });
});

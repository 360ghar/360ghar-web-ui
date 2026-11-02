import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APPS, PLAY_STORE } from './apps';

describe('APPS', () => {
  it('has https store URLs with the ids the apps ship with', () => {
    expect(APPS.ghar360.play).toBe('https://play.google.com/store/apps/details?id=com.the360ghar.ghar360');
    expect(APPS.flatmates.play).toBe('https://play.google.com/store/apps/details?id=com.the360ghar.flatmates360');
    expect(APPS.flatmates.ios).toBe(`https://apps.apple.com/in/app/360-flatmates/id${APPS.flatmates.itunesId}`);
    expect(PLAY_STORE).toBe(APPS.ghar360.play);
  });

  it('keeps the 360Ghar iPhone link empty until the app is live', () => {
    expect(APPS.ghar360.ios).toBeNull();
  });
});

describe('deep-link files', () => {
  // The files live on the backend. The Worker serves them through SSR endpoints
  // that proxy the API as-is (the old netlify.toml 200-rewrites; Workers
  // _redirects cannot proxy external hosts), or the apps cannot verify the domain.
  it.each(['assetlinks.json.ts', 'apple-app-site-association.ts'])('has a src/pages/.well-known/%s endpoint proxying the API', (file) => {
    const src = readFileSync(new URL(`../pages/.well-known/${file}`, import.meta.url), 'utf8');
    expect(src).toContain('prerender = false');
    expect(src).toMatch(/proxyWellKnown\('(assetlinks\.json|apple-app-site-association)'\)/);
  });
});

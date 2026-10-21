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
  // The files live on the backend. Netlify must proxy them as-is (status 200, force), or the apps cannot verify the domain.
  const toml = readFileSync(new URL('../../netlify.toml', import.meta.url), 'utf8');
  it.each(['assetlinks.json', 'apple-app-site-association'])('proxies /.well-known/%s to the API', (file) => {
    const block = toml.split('[[redirects]]').find((b) => b.includes(`from = "/.well-known/${file}"`));
    expect(block).toBeDefined();
    expect(block).toContain(`to = "https://api.360ghar.com/.well-known/${file}"`);
    expect(block).toContain('status = 200');
    expect(block).toContain('force = true');
  });
});

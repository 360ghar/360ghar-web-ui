import { describe, expect, it } from 'vitest';
import { englishPath, resolveRoute } from './routes';

describe('route table', () => {
  it('resolves fixed and dynamic routes', () => {
    expect(resolveRoute('/')?.file).toBe('index.astro');
    expect(resolveRoute('/hi')?.file).toBe('index.astro');
    expect(resolveRoute('/hi/emi-calculator')?.file).toBe('emi-calculator.astro');
    expect(resolveRoute('/property/123')?.dynamic).toBe(1);
    expect(resolveRoute('/sitemap-static.xml')?.file).toBe('sitemap-[name].xml.ts');
  });
  it('does not resolve removed or unknown routes', () => {
    // A single unknown segment falls to the [city] route (it answers 404 for a slug that is not a city), so check fixed routes.
    expect(resolveRoute('/property-sidebar', { fixed: true })).toBeNull();
    expect(resolveRoute('/add-new-listing', { fixed: true })).toBeNull();
    expect(resolveRoute('/definitely/not/a/page/at/all')).toBeNull();
  });
  it('prefers a fixed route and can skip dynamic ones', () => {
    expect(resolveRoute('/properties')?.dynamic).toBe(0);
    expect(resolveRoute('/property/123', { fixed: true })).toBeNull();
  });
  it('strips origin, query, locale and trailing slash', () => {
    expect(englishPath('https://360ghar.com/hi/blog/?a=1')).toBe('/blog');
    expect(englishPath('https://360ghar.com')).toBe('/');
    expect(englishPath('/hindi')).toBe('/hindi');
  });
});

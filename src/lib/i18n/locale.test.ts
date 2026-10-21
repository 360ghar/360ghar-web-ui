import { describe, expect, it } from 'vitest';
import { localeFromPath, localizePath, stripLocale } from './locale';

describe('locale helpers', () => {
  it('reads the locale from the path', () => {
    expect(localeFromPath('/')).toBe('en');
    expect(localeFromPath('/hi')).toBe('hi');
    expect(localeFromPath('/hi/properties')).toBe('hi');
    expect(localeFromPath('/hindi-guide')).toBe('en');
  });

  it('strips and adds the prefix', () => {
    expect(stripLocale('/hi')).toBe('/');
    expect(stripLocale('/hi/blog/x')).toBe('/blog/x');
    expect(localizePath('/', 'hi')).toBe('/hi');
    expect(localizePath('/blog/x', 'hi')).toBe('/hi/blog/x');
    expect(localizePath('/hi/blog/x', 'en')).toBe('/blog/x');
    expect(localizePath('/properties?q=2bhk', 'hi')).toBe('/hi/properties?q=2bhk');
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/features/content/celebrity/CelebrityPage.astro', 'utf8');
const englishSeo = JSON.parse(readFileSync('src/i18n/locales/en/seo.json', 'utf8'));
const hindiSeo = JSON.parse(readFileSync('src/i18n/locales/hi/seo.json', 'utf8'));

describe('celebrity residence page evidence hold', () => {
  it('withholds unverified residence details and removes the page from indexing', () => {
    expect(page).toMatch(/\bnoindex\b/);
    expect(page).not.toMatch(/publishedCelebritySlugs|CELEBRITY_CITIES|celebrityCards|jsonLd/);
    expect(englishSeo.celebrityHomes.title).toMatch(/under review/i);
    expect(englishSeo.celebrityHomes.description).toMatch(/withheld|review/i);
    expect(hindiSeo.celebrityHomes.title).toMatch(/समीक्षा के अधीन/);
    expect(hindiSeo.celebrityHomes.description).toMatch(/रोकी गई|समीक्षा/);
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { localityFaqs } from './faq';

const page = readFileSync('src/features/localities/LocalityPage.astro', 'utf8');
const route = readFileSync('src/pages/locality/[slug].astro', 'utf8');
const loader = readFileSync('src/features/localities/load.ts', 'utf8');

describe('locality evidence gates', () => {
  it('does not publish city-wide price context or circle-rate values', () => {
    expect(page).not.toContain('priceContext');
    expect(page).not.toContain('priceRows');
    expect(page).not.toContain('rate_per_sqft');
    expect(page).not.toMatch(/circle rate|सर्कल रेट/i);
  });

  it('does not request circle-rate records for locality pages', () => {
    expect(loader).not.toContain('/api/v1/data-hub/circle-rates');
  });

  it('does not imply live inventory in other localities or free listing', () => {
    expect(page).not.toMatch(/These places have homes listed now|इन जगहों पर अभी घर लिस्ट हैं/);
    expect(page).not.toMatch(/list your own home .*free|मुफ़्त लिस्ट करें/i);
  });

  it('labels price ranges as current 360Ghar listing prices', () => {
    expect(page).toContain('listed prices');
    expect(page).toContain('लिस्टिंग की कीमतें');
  });

  it('does not use unverified static SEO descriptions', () => {
    expect(route).not.toContain('generated?.metaDescription');
    expect(route).not.toContain('l.seo?.description');
    expect(route).not.toContain('l.description');
    expect(route).not.toContain('l.seo?.title');
    expect(route).not.toContain('Property Prices, Reviews');
    expect(route).toContain('Property listings for');
    expect(route).toContain('लिस्टिंग और सामान्य जानकारी');
  });

  it('does not render static landmark distances or nearest-place claims', () => {
    expect(page).not.toContain('landmarksFor');
    expect(page).not.toContain('LandmarkList');
    expect(page).not.toContain('Nearest');
    expect(page).not.toContain('How far things are');
  });

  it('uses neutral FAQs without unsupported market or legal claims', () => {
    const copy = ['sector', 'society', 'project', 'township', 'phase', 'road', 'locality']
      .flatMap((kind) => ['en', 'hi'].flatMap((locale) => localityFaqs('Test Place', kind, locale as 'en' | 'hi')))
      .flatMap(({ question, answer }) => [question, answer])
      .join('\n');

    expect(copy).not.toMatch(/circle rate|stamp duty|H-RERA|Haryana government|investment|resale demand|planned sector/i);
    expect(copy).not.toMatch(/सर्कल रेट|स्टैंप ड्यूटी|हरियाणा सरकार|निवेश|रीसेल माँग/i);
  });
});

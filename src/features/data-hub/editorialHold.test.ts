import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

const heldPages = [
  'src/features/data-hub/BestSectorsPage.astro',
  'src/features/data-hub/TenantPage.astro',
  'src/features/data-hub/PriceIndexIndexPage.astro',
  'src/features/data-hub/PriceIndexPage.astro',
];

describe('data hub editorial holds', () => {
  it('marks every affected page noindex and uses a localized review notice', () => {
    for (const path of heldPages) {
      const source = read(path);
      expect(source, path).toMatch(/\bnoindex\b/);
      expect(source, path).toMatch(/review/i);
      expect(source, path).toMatch(/समीक्षा/);
      expect(source, path).not.toMatch(/\bjsonLd\b|Dataset|temporalCoverage|faqPage/i);
    }
  });

  it('does not render sector forecasts, demand metrics, or price ranges', () => {
    const bestSectors = read(heldPages[0]!);
    const tenant = read(heldPages[1]!);
    const priceIndex = read(heldPages[2]!);
    const priceCity = read(heldPages[3]!);

    expect(bestSectors).not.toMatch(/\b(?:SECTORS|expectedReturn|rentalYield|priceRange|FAQ\.bestSectors)\b/);
    expect(tenant).not.toMatch(/AREAS|demandScore|avgRent2bhk|a\.vacancy|a\.demandTrend|FAQ\.tenant/i);
    expect(priceIndex).not.toMatch(/priceContext\.json|\.buy\b|\.rent\b|<table|rows\.map/i);
    expect(priceCity).not.toMatch(/priceContext\.json|PriceRanges|avgRent|Dataset|temporalCoverage/i);
  });

  it('holds the Gurugram investment guide without estimates or financial claims', () => {
    const source = read('src/features/content/guides/InvestmentGuide.astro');

    expect(source).toMatch(/\bnoindex\b/);
    expect(source).toMatch(/review/i);
    expect(source).toMatch(/समीक्षा/);
    expect(source).not.toMatch(/\b(?:ROI|yield|return|estimate|2024|2026|jsonLd|published)\b/i);
  });

  it('holds source-dependent data pages instead of publishing unverified records', () => {
    const componentPath = 'src/features/data-hub/DataHubHold.astro';
    expect(existsSync(componentPath)).toBe(true);
    const component = read(componentPath);
    expect(component).toMatch(/\bnoindex\b/);

    const pages = [
      'src/features/data-hub/ZonesPage.astro',
      'src/features/data-hub/ZonePage.astro',
      'src/features/data-hub/GazettePage.astro',
      'src/features/data-hub/SourcesPage.astro',
      'src/features/data-hub/AuctionsPage.astro',
      'src/features/data-hub/AuctionPage.astro',
    ];

    for (const path of pages) {
      const source = read(path);
      expect(source, path).toMatch(/DataHubHold/);
      expect(source, path).toMatch(/review/i);
      expect(source, path).toMatch(/समीक्षा/);
      expect(source, path).not.toMatch(/\b(?:FAQ|howTo|jsonLd|ItemList|Dataset|CollectionPage)\b/);
    }
  });

  it('describes Jamabandi as a record lookup, not title verification', () => {
    const page = read('src/features/data-hub/OwnershipPage.astro');
    const english = JSON.parse(read('src/i18n/locales/en/data-hub.json')) as {
      verifyOwnership: { description: string; aboutJamabandi: { description: string; tips: string[] } };
    };
    const hindi = JSON.parse(read('src/i18n/locales/hi/data-hub.json')) as {
      verifyOwnership: { description: string; aboutJamabandi: { description: string; tips: string[] } };
    };

    expect(page).toMatch(/Jamabandi record lookup/i);
    expect(page).not.toMatch(/How to Verify Property Ownership|generateToolSchema|toolSchemas\.verifyOwnership/);
    expect(english.verifyOwnership.description).toMatch(/record lookup/i);
    expect(english.verifyOwnership.description).toMatch(/does not verify/i);
    expect(english.verifyOwnership.aboutJamabandi.description).toMatch(/does not independently verify legal title/i);
    expect(english.verifyOwnership.aboutJamabandi.tips.join(' ')).not.toMatch(/verify ownership before buying/i);
    expect(hindi.verifyOwnership.description).toMatch(/रिकॉर्ड खोज/);
    expect(hindi.verifyOwnership.description).toMatch(/पुष्टि नहीं/);
    expect(hindi.verifyOwnership.aboutJamabandi.description).toMatch(/कानूनी टाइटल की पुष्टि नहीं/);
  });

  it('labels held Data Hub links as under review or unavailable', () => {
    const links = read('src/features/data-hub/pages.ts');
    const nav = read('src/features/layout/nav.ts');

    expect(links).not.toMatch(/Government rates for every Gurugram sector|Where renters want to live|Five micro-markets for investment|Price ranges by property type/);
    expect(nav).not.toMatch(/Government rates by sector|Stamp duty and registration cost/);
    for (const phrase of [
      'Rate data is under review',
      'Estimate unavailable while rates are reviewed',
      'समीक्षा के अधीन',
    ]) expect(nav).toContain(phrase);
  });

  it('uses review metadata for withheld source-dependent routes in both locales', () => {
    const english = JSON.parse(read('src/i18n/locales/en/seo.json')) as Record<string, Record<string, string>>;
    const hindi = JSON.parse(read('src/i18n/locales/hi/seo.json')) as Record<string, Record<string, string>>;
    const keys = [
      'listPropertyFree',
      'securityDepositGuide',
      'stampDuty',
      'circleRateDirectory',
      'circleRateDetail',
      'priceIndex',
    ];

    for (const key of keys) {
      expect(Object.values(english[key] ?? {}).join(' '), `English ${key}`).toMatch(/review|withheld|unavailable/i);
      expect(Object.values(hindi[key] ?? {}).join(' '), `Hindi ${key}`).toMatch(/समीक्षा|रोके|उपलब्ध नहीं/);
    }
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('guide editorial holds', () => {
  it('keeps the NRI guide noindex with only official source links', () => {
    const source = read('src/features/content/guides/NriGuide.astro');

    expect(source).toMatch(/\bnoindex\b/);
    expect(source).toContain('https://www.rbi.org.in/Scripts/BS_FemaNotifications.aspx');
    expect(source).toContain('https://www.incometax.gov.in/iec/foportal/');
    expect(source).toMatch(/review/i);
    expect(source).not.toMatch(/\b(?:TDS|Form 27Q|LRS|PoA|Power of Attorney|PAN card|indexation|USD 1 million|20%)\b/i);
    expect(source).toMatch(/not legal or tax advice/i);
  });

  it('holds the investment guide without market estimates or article markup', () => {
    const source = read('src/features/content/guides/InvestmentGuide.astro');

    expect(source).toMatch(/\bnoindex\b/);
    expect(source).toMatch(/review/i);
    expect(source).not.toMatch(/\b(?:ROI|yield|return|estimate|2024|2026|jsonLd|published)\b/i);
  });

  it('holds the Gurugram guide until its market claims have sources and dates', () => {
    const source = read('src/features/content/guides/GurugramGuide.astro');

    expect(source).toMatch(/\bnoindex\b/);
    expect(source).toMatch(/review/i);
    expect(source).not.toMatch(/TableScroll|const prices|marketTrends|investmentTitle|helpVerified|article\(/);
  });

  it('renders a localized noindex notice instead of the dirty deposit guide', () => {
    const route = read('src/pages/landlord-not-returning-security-deposit.astro');

    expect(route).toMatch(/\bnoindex\b/);
    expect(route).toContain('export const prerender = true;');
    expect(route).not.toContain('DepositGuide');
    expect(route).toMatch(/review/i);
    expect(route).toMatch(/समीक्षा/);
  });

  it('holds the unsupported free-listing and portal-comparison page', () => {
    const source = read('src/features/content/guides/ListFree.astro');

    expect(source).toMatch(/\bnoindex\b/);
    expect(source).toMatch(/review/i);
    expect(source).toMatch(/समीक्षा/);
    expect(source).not.toMatch(/MagicBricks|99acres|zero spam|zero upfront|360°|howTo|faqPage|<table/i);
  });

  it('removes unsupported legal data from the deposit guide data module', () => {
    const source = read('src/features/content/guides/deposit.ts');

    expect(source).not.toMatch(/Tamil Nadu|Delhi Rent Act|Haryana Urban|Model Tenancy Act|15 days|₹|%/i);
    expect(source).toMatch(/export const stateRules[^=]*=\s*\[\s*\]/);
    expect(source).toMatch(/export const faqs[^=]*=\s*\[\s*\]/);
  });
});

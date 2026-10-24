import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { faqPage } from '@/lib/seo/site';
import { GLOSSARY } from './data';

const localeMetadata = (locale: 'en' | 'hi') =>
  JSON.parse(readFileSync(new URL(`../../../i18n/locales/${locale}/seo.json`, import.meta.url), 'utf8')).glossary as {
    title: string;
    description: string;
  };

const unsafeClaims = [
  /\b\d+(?:[.,]\d+)?\s*(?:%|sq\.?\s*ft|lakh|crore|days?|months?|years?)\b/i,
  /\b(?:19|20)\d{2}\b/,
  /₹\s*50\s*lakh/i,
  /\bwithin 30 days\b/i,
  /\b(?:Form 26QB|Form 27Q)\b/i,
  /\b2 residential properties\b/i,
  /NRO account is mandatory/i,
  /higher of (?:circle|collector) rate/i,
  /RERA mandates?/i,
  /without CLU.{0,40}illegal/i,
  /must be notarized/i,
  /must be executed on non-judicial stamp paper/i,
  /without a registered sale deed.{0,60}not legally valid/i,
  /physically verifies every listing/i,
  /every verified listing includes/i,
  /eliminates fake listings|no fake listings/i,
  /charged only when a deal closes|no upfront fees/i,
  /unlike many platforms|standard market brokerage/i,
  /typically 13-30 years/i,
];

describe('glossary content safety', () => {
  it('describes the actual glossary in both locale metadata', () => {
    const en = localeMetadata('en');
    const hi = localeMetadata('hi');

    expect(en.title).toMatch(/real estate glossary/i);
    expect(en.description).toMatch(/real estate terms/i);
    expect(hi.title).toMatch(/रियल एस्टेट शब्दावली/);
    expect(hi.description).toMatch(/रियल एस्टेट शब्द/);
    for (const value of [en.title, en.description]) expect(value).not.toMatch(/AI|100\+|complete/i);
    for (const value of [hi.title, hi.description]) expect(value).not.toMatch(/AI|100\+|संपूर्ण/i);
  });

  it('marks the glossary noindex while legal entries await review', () => {
    const page = readFileSync(new URL('./GlossaryPage.astro', import.meta.url), 'utf8');
    const seo = readFileSync(new URL('../../../lib/seo/Seo.astro', import.meta.url), 'utf8');
    expect(page).toMatch(/<Content\b(?=[^>]*\bnoindex\b)[^>]*>/s);
    expect(seo).toContain("? 'noindex,follow'");
    expect(page).toMatch(/not legal or tax advice/);
    expect(page).toMatch(/कानूनी या कर सलाह नहीं/);
  });

  it('omits unsupported claims from visible entries and FAQ structured data', () => {
    const visible = JSON.stringify(GLOSSARY);
    const faq = JSON.stringify(faqPage(GLOSSARY.map(({ question, answer }) => ({ q: question, a: answer }))));

    for (const claim of unsafeClaims) {
      expect(visible).not.toMatch(claim);
      expect(faq).not.toMatch(claim);
    }
  });
});

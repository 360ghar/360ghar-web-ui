import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { COMPETITORS, EVIDENCE_REVIEWED_ON } from './competitors';
import { TRUTH_PAGES } from './truth';

const STATES = ['available', 'limited', 'unavailable', 'unknown'];
const MARKETPLACE_SLUGS = ['nobroker', 'magicbricks', '99acres', 'housing', 'proptiger', 'squareyards'];
const enCopy = JSON.parse(readFileSync(new URL('../../../i18n/locales/en/compare.json', import.meta.url), 'utf8'));
const hiCopy = JSON.parse(readFileSync(new URL('../../../i18n/locales/hi/compare.json', import.meta.url), 'utf8'));
const enSeo = JSON.parse(readFileSync(new URL('../../../i18n/locales/en/seo.json', import.meta.url), 'utf8'));
const hiSeo = JSON.parse(readFileSync(new URL('../../../i18n/locales/hi/seo.json', import.meta.url), 'utf8'));

function keys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe('comparison evidence', () => {
  it('limits marketplace profiles to the sourced, like-for-like candidates', () => {
    expect(
      COMPETITORS.filter((competitor) => competitor.category === 'property-marketplace')
        .map((competitor) => competitor.slug)
        .sort(),
    ).toEqual([...MARKETPLACE_SLUGS].sort());
  });

  it('uses dated, attributed evidence states instead of boolean feature claims', () => {
    expect(EVIDENCE_REVIEWED_ON).toBe('2026-10-23');

    for (const competitor of COMPETITORS) {
      expect(competitor.source.url).toMatch(/^https:\/\//);
      expect(competitor.source.checkedOn).toBe(EVIDENCE_REVIEWED_ON);
      expect(competitor.companyDescription).toContain(competitor.name);
      expect(competitor.features.length).toBeGreaterThan(0);

      for (const feature of competitor.features) {
        expect(STATES).toContain(feature.ourState);
        expect(STATES).toContain(feature.competitorState);
        expect(feature.competitorState).toBe('unknown');
        expect(feature.competitorNote).toMatch(/unknown/i);
      }

      expect(competitor).not.toHaveProperty('claims');
      expect(competitor).not.toHaveProperty('faqs');
      expect(competitor).not.toHaveProperty('strengths');
    }
  });

  it('keeps managed accommodation and unknown product status out of marketplace peers', () => {
    for (const slug of ['zolo', 'stanza-living']) {
      const competitor = COMPETITORS.find((item) => item.slug === slug);
      expect(competitor?.category).toBe('managed-accommodation');
      expect(competitor?.comparisonScope).toMatch(/not a like-for-like marketplace peer/i);
    }

    for (const slug of ['commonfloor', 'nestaway']) {
      const competitor = COMPETITORS.find((item) => item.slug === slug);
      expect(competitor?.currentStatus).toBe('unknown');
      expect(competitor?.noindex).toBe(true);
      expect(competitor?.companyDescription).toMatch(/status remains unknown/i);
    }
  });

  it('replaces truth allegations with dated evidence notes', () => {
    for (const page of TRUTH_PAGES) {
      expect(page.checkedOn).toBe(EVIDENCE_REVIEWED_ON);
      expect(page.source.url).toMatch(/^https:\/\//);
      expect(page).not.toHaveProperty('issues');
    }
  });

  it('keeps English and Hindi comparison copy in parity without superiority claims', () => {
    expect(keys(enCopy).sort()).toEqual(keys(hiCopy).sort());
    expect(JSON.stringify(enCopy)).not.toMatch(/\b(?:beats|best|better|fake|spam|refund|complaints|verified|trustpilot)\b/i);
    expect(JSON.stringify(hiCopy)).not.toMatch(/बेहतर|फर्जी|स्पैम|रिफंड|शिकायत|वेरिफाइड/i);
  });

  it('keeps competitor evidence-note metadata free of stale allegations and superiority claims', () => {
    const metadata = JSON.stringify({ en: enSeo.truth, hi: hiSeo.truth });

    expect(metadata).not.toMatch(
      /spam calls|broker-call concerns|verification gaps|verified listings|physically verified|valuation decline|service concerns|स्पैम कॉल|वेरिफिकेशन कमियाँ|वेरिफाइड लिस्टिंग|भौतिक रूप से वेरिफाइड|वैल्यूएशन गिरावट|सेवा चिंताएँ/i,
    );
    for (const slug of ['99acres', 'magicbricks', 'nobroker', 'nestaway', 'zolo']) {
      expect(enSeo.truth[slug].title).toMatch(/evidence note/i);
      expect(hiSeo.truth[slug].title).toMatch(/साक्ष्य नोट/i);
      expect(enSeo.truth[slug].description).toMatch(/evidence|source/i);
      expect(hiSeo.truth[slug].description).toMatch(/साक्ष्य|स्रोत/i);
    }
  });
});

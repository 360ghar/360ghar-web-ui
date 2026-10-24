import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FAQ } from './content';
import { HUB } from './pages';
import { text } from './text';
import { chartText } from './charts';
import { faqs, text as projectText } from '../projects/text';

/**
 * The copy audit pins. Every check here corresponds to a claim that was wrong
 * about what the data can deliver, and each one is a claim the code or the
 * database can settle:
 *
 * - no copy promises a price, a rate or a price trend from the RERA registers
 *   (no register publishes one; `project_price_history` is empty and
 *   `avg_price_per_sqft` / `price_change_90d_pct` are always null);
 * - no copy implies every project has a declared cost (Delhi's cost is
 *   deliberately unwritten, so only the Haryana projects have one);
 * - no copy says the project list is Gurugram-only or HRERA-only (it is the
 *   Delhi RERA register plus HRERA);
 * - the builder score is described as the formula `calculate_builder_score`
 *   actually runs, not a multi-factor algorithm;
 * - the HRERA portal is linked at its real host.
 */

const read = (path: string) => readFileSync(path, 'utf8');

/**
 * The locale files, typed to the shape this audit reads. The repo's other copy
 * tests declare the exact keys inline rather than casting to `any`, so a renamed
 * key fails to compile instead of silently comparing `undefined`.
 */
type ProjectsLocale = {
  page: { project: { lead: string; nearbyLead: string }; watchlist: { lead: string } };
  seo: {
    projectDetail: { titleTemplate: string; descriptionTemplate: string };
    mapDiscovery: { description: string };
  };
};
type SeoLocale = {
  reraProjectDirectory: { title: string; description: string };
  builderReputationDetail: { descriptionTemplate: string };
};
type DataHubLocale = {
  rera: { title: string; description: string; placeholder: string };
  builderReputation: { title: string; description: string; disclaimer: string };
};

const en = JSON.parse(read('src/i18n/locales/en/projects.json')) as ProjectsLocale;
const hi = JSON.parse(read('src/i18n/locales/hi/projects.json')) as ProjectsLocale;
const seoEn = JSON.parse(read('src/i18n/locales/en/seo.json')) as SeoLocale;
const seoHi = JSON.parse(read('src/i18n/locales/hi/seo.json')) as SeoLocale;
const dhEn = JSON.parse(read('src/i18n/locales/en/data-hub.json')) as DataHubLocale;
const dhHi = JSON.parse(read('src/i18n/locales/hi/data-hub.json')) as DataHubLocale;

/** Every string in a nested object, so a search does not have to know the shape. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (typeof value === 'object' && value !== null) for (const v of Object.values(value)) strings(v, out);
  return out;
}

describe('copy does not promise a RERA price', () => {
  // The registers publish no rate per square foot on any filing, so the price
  // surface is empty by design. A page that offers one is offering nothing.
  const pricePromises = [
    /project cost/i,
    /प्रोजेक्ट लागत/,
    /\bcost and status\b/i,
    /लागत और स्थिति/,
    /\bwith its current stage and price\b/i,
    /\bprice, registrations and complaints\b/i,
    /कीमत, रजिस्ट्री और शिकायतें/,
  ];

  it('keeps the project detail lead, meta and watchlist lead off cost and price', () => {
    const surfaces = [
      en.page.project.lead,
      en.page.project.nearbyLead,
      en.page.watchlist.lead,
      en.seo.projectDetail.titleTemplate,
      en.seo.projectDetail.descriptionTemplate,
      en.seo.mapDiscovery.description,
      hi.page.project.lead,
      hi.page.watchlist.lead,
      hi.seo.projectDetail.titleTemplate,
      hi.seo.projectDetail.descriptionTemplate,
      hi.seo.mapDiscovery.description,
      seoEn.reraProjectDirectory.description,
      seoHi.reraProjectDirectory.description,
      dhEn.rera.description,
      dhHi.rera.description,
      HUB.marketPulse.desc[0],
      HUB.marketPulse.desc[1],
      HUB.projectMap.desc[0],
      HUB.projectMap.desc[1],
    ];
    for (const value of surfaces) {
      for (const pattern of pricePromises) expect(value, `${value} matches ${pattern}`).not.toMatch(pattern);
    }
  });

  it('leaves the true disclosure that no price column is drawn', () => {
    const mp = faqs('en', 'marketPulse')[0]!.a;
    expect(mp).toMatch(/publish no rate per sq ft/i);
    // The column is absent rather than empty, and the answer has to say which:
    // a column of dashes reads as a figure that is merely pending.
    expect(mp).toMatch(/no price column here at all/i);
    expect(mp).not.toMatch(/stay empty/i);
    // The Hindi answer must make the same disclosure rather than implying a
    // source is merely pending.
    const mpHi = faqs('hi', 'marketPulse')[0]!.a;
    expect(mpHi).toMatch(/प्रकाशित नहीं करते/);
    expect(mpHi).toMatch(/कोई कॉलम ही नहीं/);
    expect(mpHi).not.toMatch(/जब तक कोई कीमत स्रोत न जुड़े/);

    const mmHi = faqs('hi', 'microMarket')[1]!;
    expect(mmHi.q).toMatch(/कोई कीमत क्यों नहीं/);
    expect(mmHi.a).not.toMatch(/स्रोत जुड़ने तक/);
  });
});

describe('copy describes the register the list actually holds', () => {
  // 148 rows: 133 from the Delhi RERA register at erera.co.in, 15 from HRERA.
  // 10 of them are in the Gurugram district, so a Gurugram-only label is wrong.
  it('does not label the whole list Gurugram-only, HRERA-only or verified', () => {
    const wrong = [/RERA projects in Gurugram/i, /Gurugram register/i, /Verified real estate projects/i, /वेरिफाइड बिलर/i];
    const surfaces = [
      text('en').reraH1,
      text('hi').reraH1,
      text('en').bdH1,
      text('hi').bdH1,
      HUB.builders.desc[0],
      HUB.builders.desc[1],
      chartText('en').reraLead(148),
      chartText('en').reraSource(null),
      chartText('hi').reraLead(148),
      chartText('hi').reraSource(null),
      seoEn.reraProjectDirectory.title,
      seoEn.reraProjectDirectory.description,
      seoHi.reraProjectDirectory.title,
      dhEn.rera.title,
      dhEn.rera.description,
      dhHi.rera.title,
      dhHi.rera.description,
    ];
    for (const value of surfaces) {
      for (const pattern of wrong) expect(value, `${value} matches ${pattern}`).not.toMatch(pattern);
      expect(value).not.toMatch(/hrera\.org\.in/i);
    }
  });

  it('names both registers in the source line and the page meta', () => {
    expect(chartText('en').reraSource('24 October 2026')).toMatch(/Delhi RERA and HRERA registers/);
    expect(chartText('hi').reraSource('24 October 2026')).toMatch(/दिल्ली RERA और HRERA रजिस्टर/);
    expect(seoEn.reraProjectDirectory.description).toMatch(/Delhi and Haryana registers/);
    expect(seoHi.reraProjectDirectory.description).toMatch(/दिल्ली और हरियाणा के रजिस्टर/);
  });

  it('does not promise a Gurugram delivery record on a builder page', () => {
    // The builder detail route covers Delhi promoters too, and the score it
    // shows is the complaint ratio, which has no delivery input.
    expect(seoEn.builderReputationDetail.descriptionTemplate).not.toMatch(/delivery track record/i);
    expect(seoHi.builderReputationDetail.descriptionTemplate).not.toMatch(/डिलीवरी ट्रैक रिकॉर्ड/);
    expect(seoEn.builderReputationDetail.descriptionTemplate).toMatch(/Delhi and Haryana RERA registers/);
    expect(text('en').bdProjectsTitle).not.toMatch(/HRERA/);
    expect(text('hi').bdProjectsTitle).not.toMatch(/HRERA/);
  });
});

describe('the builder score is described as the formula the backend runs', () => {
  // `calculate_builder_score` in app/services/data_hub/utils.py is
  // max(0, 100 - (complaints / projects) * 15), and 50 when projects is 0.
  it('states that formula and no other inputs', () => {
    const faq = FAQ.builders.find((f) => /how is the builder reputation score calculated/i.test(f.q))!;
    expect(faq).toBeDefined();
    expect(faq.a).toMatch(/100 minus 15 for each complaint per project/i);
    expect(faq.a).toMatch(/no other input/i);
    expect(faq.a).not.toMatch(/weights recent data more heavily/i);
    expect(faq.a).not.toMatch(/on-time delivery record/i);

    expect(dhEn.builderReputation.description).toMatch(/100 minus 15 for each complaint per project/i);
    expect(dhHi.builderReputation.description).toMatch(/प्रति शिकायत 15 घटाकर/);
    // The disclaimer said HRERA, but 83 of the 97 developer slugs are Delhi rows.
    expect(dhEn.builderReputation.disclaimer).not.toMatch(/HRERA records/i);
    expect(dhHi.builderReputation.disclaimer).not.toMatch(/HRERA रिकॉर्ड/);
  });

  it('does not assert scores the live builder page contradicts', () => {
    const faq = FAQ.builderScore.find((f) => /best reputation/i.test(f.q))!;
    expect(faq).toBeDefined();
    expect(faq.a).not.toMatch(/consistently score above 80/i);
    expect(faq.a).toMatch(/not the live register counts/i);
  });
});

describe('every HRERA link points at the real host', () => {
  it('never links the old HRERA host, which redirects off-site', () => {
    for (const file of ['src/features/data-hub/content.ts', 'src/features/data-hub/text.ts']) {
      expect(read(file), file).not.toMatch(/hrera\.org\.in/i);
    }
    for (const locale of ['en', 'hi'] as const) {
      expect(strings(FAQ).length).toBeGreaterThan(0);
      expect(text(locale).verifyNo).toMatch(/haryanarera\.gov\.in/);
    }
  });

  it('does not invent a RERA number format', () => {
    // The registers issue RERA-GRG-PROJ-1540-2024 and DLRERA2026P0011; the old
    // placeholder HRERA-PKL-GGM-2024-001 matches neither.
    expect(dhEn.rera.placeholder).not.toMatch(/HRERA-PKL-GGM/);
    expect(dhHi.rera.placeholder).not.toMatch(/HRERA-PKL-GGM/);
    for (const faq of FAQ.rera) expect(faq.a).not.toMatch(/HRERA-PKL-GGM-XXXX-XXX/);
  });
});

describe('the project text module keeps the corrected leads', () => {
  it('names the district rather than a distance for nearby projects', () => {
    expect(en.page.project.nearbyLead).toMatch(/same district/i);
    expect(hi.page.project.nearbyLead).toMatch(/उसी ज़िले/);
    expect(projectText('en').nearbyTitle).toBe('Nearby projects');
  });
});

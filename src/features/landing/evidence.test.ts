import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import landingTypeContext from '@/data/landingTypeContext.json';
import { faqPage } from '@/lib/seo/site';
import { landingCopy } from './copy';
import { parseLanding } from './model';

const landingTemplate = readFileSync(new URL('./LandingPage.astro', import.meta.url), 'utf8');
const cityHubTemplate = readFileSync(new URL('./CityHub.astro', import.meta.url), 'utf8');
const nearTemplate = readFileSync(new URL('./NearPage.astro', import.meta.url), 'utf8');
const contextText = JSON.stringify(landingTypeContext);

describe('landing evidence-safe copy', () => {
  it('keeps unsupported market figures and categorical RERA claims out of landing context', () => {
    expect(contextText).not.toMatch(/priceBands|8-12%|60%|20-30%|500-1000/i);
    expect(contextText).not.toMatch(/all new-launch|all .* projects require|does not yet have a fully operational RERA/i);
    expect(contextText).not.toMatch(/security deposit is typically|rental agreements.*registered/i);
  });

  it('does not render unsourced static price ranges on landing pages', () => {
    expect(landingTemplate).not.toMatch(/priceContext|priceRange|usual market price|usual market bands/i);
    expect(cityHubTemplate).not.toMatch(/priceContext|city-wide ranges|hub-price/i);
  });

  it('does not promise universal verification or free listing fees in landing copy', () => {
    const landingMarkup = `${landingTemplate}\n${cityHubTemplate}\n${nearTemplate}`;
    expect(landingMarkup).not.toMatch(/Verified homes|list (?:your own home )?free|मुफ़्त लिस्ट करें/i);
  });

  it.each(['en', 'hi'] as const)('uses only qualified visible FAQ copy in %s FAQPage JSON-LD', (locale) => {
    const landing = parseLanding('noida', 'buy', 'flats')!;
    const copy = landingCopy(landing, undefined, locale);
    const schema = faqPage(copy.faqs);
    const serialized = JSON.stringify(schema);

    expect(schema.mainEntity.map(({ name, acceptedAnswer }) => [name, acceptedAnswer.text])).toEqual(
      copy.faqs.map(({ q, a }) => [q, a]),
    );
    expect(serialized).not.toMatch(/every listing|all properties|no fake|no outdated|zero brokerage|no hidden charges|unlike other portals|20-30%|500-1000/i);
    expect(serialized).not.toMatch(/every listing.*360|all properties.*360|हर लिस्टिंग.*360|हर प्रॉपर्टी.*वेरिफाइड/i);
  });

  it('keeps FAQ answers specific to the landing facet', () => {
    const apartments = parseLanding('gurgaon', 'buy', 'flats')!;
    const villas = parseLanding('gurgaon', 'buy', 'villa')!;
    const oneBhk = landingCopy(apartments, { kind: 'bhk', bhk: 1 }, 'en').faqs.map((faq) => faq.a);
    const twoBhk = landingCopy(apartments, { kind: 'bhk', bhk: 2 }, 'en').faqs.map((faq) => faq.a);
    const villaOneBhk = landingCopy(villas, { kind: 'bhk', bhk: 1 }, 'en').faqs.map((faq) => faq.a);

    expect(oneBhk).not.toEqual(twoBhk);
    expect(oneBhk).not.toEqual(villaOneBhk);
  });
});

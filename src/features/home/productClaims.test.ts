import { describe, expect, it } from 'vitest';
import enSite from '@/i18n/locales/en/site.json';
import hiSite from '@/i18n/locales/hi/site.json';
import { COPY } from './copy';
import { MORE } from './more';

/** `COPY` is `as const`, so the two locales are distinct tuple types. Widen them for lookup. */
type HomeTool = { href: string; icon: string; name: string; note: string; stat?: string };
const toolsOf = (locale: 'en' | 'hi'): readonly HomeTool[] =>
  (COPY[locale].toolsets as readonly { tools: readonly HomeTool[] }[]).flatMap((set) => set.tools);

describe('homepage evidence-conscious copy', () => {
  it('does not claim that 360Ghar verifies homes or provides unverified owner services', () => {
    for (const locale of ['en', 'hi'] as const) {
      const c = COPY[locale];
      const affirmativeCopy = JSON.stringify({
        ownersBody: c.ownersBody,
        rail: c.rail,
        steps: [c.steps[0], c.steps[2]].map(({ title, body }) => ({ title, body })),
        owner: c.owner,
      });

      expect(affirmativeCopy).not.toMatch(
        /we photograph|verify|verified|our team visits|relationship manager|tracks rent|tenant|\brent\b|repair|cloud|वेरिफाई|वेरिफाइड|हमारी टीम|रिलेशनशिप मैनेजर|किरायेदार|किराया|मरम्मत|क्लाउड|मुफ़्त/i,
      );
      expect(c.steps[1]!.body).toMatch(/does not independently verify|स्वतंत्र पुष्टि नहीं करती/i);
    }
  });

  it('describes app features from the product requirements without owner-service claims', () => {
    for (const locale of ['en', 'hi'] as const) {
      const app = MORE[locale].app;
      const copy = `${app.lead} ${app.features.join(' ')}`;

      expect(copy).toMatch(/listing|लिस्टिंग/i);
      expect(copy).toMatch(/save|pass|सेव|पास/i);
      expect(copy).toMatch(/tour|टूर/i);
      expect(copy).toMatch(/visit|विज़िट/i);
      expect(copy).not.toMatch(/relationship manager|rent collection|maintenance|tenant|price drops|किराया वसूली|मरम्मत|किरायेदार|रिलेशनशिप मैनेजर/i);
    }
  });

  it('describes MCP prompts as examples and does not promise live results', () => {
    expect(MORE.en.ai.list).toMatch(/example/i);
    expect(MORE.en.ai.lead).toMatch(/does not confirm current server availability/i);
    expect(MORE.hi.ai.list).toMatch(/उदाहरण/);
    expect(MORE.hi.ai.lead).toMatch(/लाइव सर्वर उपलब्धता.*पुष्टि नहीं/);
    expect(MORE.en.ai.lead).not.toMatch(/search works without an account|tools ask you to sign in/i);
  });

  it('keeps MCP examples within property discovery, EMI and visit requests', () => {
    const prompts = Object.values(MORE)
      .flatMap((locale) => locale.ai.prompts.map((prompt) => `${prompt.who}: ${prompt.say}`))
      .join(' ');

    expect(prompts).toMatch(/visit request|विज़िट.*अनुरोध/i);
    expect(prompts).toMatch(/estimate emi|EMI का अनुमान/i);
    expect(prompts).not.toMatch(/rent collection|किराया वसूली/i);
  });

  it('labels withheld home tools and auctions without free claims or counts', () => {
    for (const locale of ['en', 'hi'] as const) {
      const tools = toolsOf(locale);
      const auction = tools.find((tool) => tool.href === '/bank-auctions');
      const stampDuty = tools.find((tool) => tool.href === '/stamp-duty-calculator');

      expect(auction).toBeDefined();
      expect(auction!.note).toMatch(/withheld|review|रोक|समीक्षा/i);
      expect(auction).not.toHaveProperty('stat');
      expect(stampDuty).toBeDefined();
      expect(stampDuty!.note).toMatch(/withheld|review|रोक|समीक्षा/i);
      expect(JSON.stringify(tools)).not.toMatch(/free|no sign-up|मुफ़्त|साइन-अप नहीं/i);
    }
  });

  it('keeps a neutral icon on the RERA tool rather than a verification seal', () => {
    for (const locale of ['en', 'hi'] as const) {
      const rera = toolsOf(locale).find((tool) => tool.href === '/rera-projects');
      expect(rera?.icon).not.toBe('verified');
    }
  });

  it('does not publish a static locality-page total', () => {
    expect(COPY.en.allPlaces).toBe('Browse locality pages');
    expect(COPY.hi.allPlaces).toBe('लोकैलिटी पेज देखें');
  });

  it('does not label the general discovery app as owner-only', () => {
    expect(enSite.home.ownersApp).toBe('Get the 360Ghar app');
    expect(hiSite.home.ownersApp).toBe('360Ghar ऐप पाएँ');
  });

  it('keeps referral rewards qualified by the published terms', () => {
    expect(MORE.en.refer.listed.text).not.toMatch(/verified|verification/i);
    expect(MORE.hi.refer.listed.text).not.toMatch(/वेरिफाई|वेरिफाइड/i);
    expect(MORE.en.refer.deal.text).toMatch(/sale/i);
    expect(MORE.en.refer.note).toMatch(/terms/i);
    expect(MORE.hi.refer.note).toMatch(/शर्त/);
  });
});

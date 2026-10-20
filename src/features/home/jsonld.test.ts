import { describe, expect, it } from 'vitest';
import { faqPage } from '@/lib/seo/site';
import { siteBlocks } from '@/lib/seo/siteSchemas';
import { validateBlocks } from '@/lib/seo/validate';
import { homeFacts } from './facts';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

/** Every full node (an @id with more than @id and @type next to it); a bare { "@id" } is a reference, not a second node. */
function nodeIds(v: unknown, out: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => nodeIds(x, out));
  else if (isObj(v)) {
    if (typeof v['@id'] === 'string' && Object.keys(v).some((k) => k !== '@id' && k !== '@type')) out.push(v['@id']);
    Object.values(v).forEach((x) => nodeIds(x, out));
  }
  return out;
}

// The blocks of `/`: Seo.astro adds siteBlocks() to the blocks that src/pages/index.astro passes (the FAQ and the fact sheet).
const homeBlocks = (locale: 'en' | 'hi') =>
  [
    ...siteBlocks(),
    faqPage([{ q: 'A question?', a: 'An answer.' }]),
    homeFacts(locale, { count: 109, localityTotal: 3215, num: String }).jsonLd,
  ].map((b) => ({ ...(b as Obj), '@context': 'https://schema.org' })); // Seo.astro does the same (withContext)

describe('home page JSON-LD', () => {
  for (const locale of ['en', 'hi'] as const) {
    it(`${locale}: has exactly one node for each @id`, () => {
      const ids = nodeIds(homeBlocks(locale));
      expect(ids).toContain('https://360ghar.com/#organization');
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(dupes).toEqual([]);
    });

    it(`${locale}: has no error in the validator`, () => {
      expect(validateBlocks(homeBlocks(locale), 'home').errors).toEqual([]);
    });
  }
});

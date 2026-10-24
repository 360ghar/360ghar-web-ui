import { describe, expect, it } from 'vitest';
import { extractJsonLd, formatReport, validateBlocks, validateSchema } from './validate';

describe('validateSchema', () => {
  it('reports a missing @type and a missing required field', () => {
    expect(validateSchema({ name: 'x' }).errors[0]?.message).toMatch(/Missing @type/);
    const r = validateSchema({ '@type': 'FAQPage' });
    expect(r.isValid).toBe(false);
    expect(r.errors[0]?.path).toBe('schema.mainEntity');
  });

  it('catches values set to undefined or empty', () => {
    expect(validateSchema({ '@type': 'Person', name: undefined }).isValid).toBe(false);
    expect(validateSchema({ '@type': 'Person', name: '' }).isValid).toBe(false);
  });

  it('checks nested types and gives the path', () => {
    const r = validateSchema({ '@type': 'Organization', name: 'A', address: { '@type': 'PostalAddress' } }, 'org');
    expect(r.errors.map((e) => e.path)).toEqual(['org.address.addressCountry']);
  });

  it('accepts a bare @id reference', () => {
    expect(validateSchema({ '@type': 'Person', name: 'A', worksFor: { '@id': 'https://360ghar.com/#organization' } }).isValid).toBe(true);
    expect(validateSchema({ '@type': 'Person', name: 'A', worksFor: { '@type': 'Organization', '@id': 'https://x/#o' } }).isValid).toBe(true);
  });

  it('rejects KnowledgePanel and a top-level SpeakableSpecification', () => {
    expect(validateSchema({ '@type': 'KnowledgePanel', name: 'x' }).errors[0]?.message).toMatch(/not a schema.org type/);
    const top = validateSchema({ '@context': 'https://schema.org', '@type': 'SpeakableSpecification', cssSelector: ['h1'] }, 'sp', true);
    expect(top.errors[0]?.message).toMatch(/inside WebPage.speakable/);
    const nested = validateSchema({ '@type': 'WebPage', url: 'https://360ghar.com/', speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1'] } });
    expect(nested.isValid).toBe(true);
  });

  it('checks dates, price, rating and product offers', () => {
    expect(validateSchema({ '@type': 'Article', headline: 'h', image: 'i', author: 'a', publisher: 'p', datePublished: 'nope' }).errors.some((e) => e.path.endsWith('datePublished'))).toBe(true);
    expect(validateSchema({ '@type': 'Offer', price: -1 }).isValid).toBe(false);
    expect(validateSchema({ '@type': 'AggregateRating', ratingValue: 6, reviewCount: 1 }).isValid).toBe(false);
    const product = validateSchema({ '@type': 'Product', name: 'n', image: 'https://x/i.jpg', offers: { '@type': 'Offer', price: 1 } });
    expect(product.errors.map((e) => e.path)).toContain('schema.offers[0].priceCurrency');
  });

  it('warns when dateCreated is a date with no timezone, and rejects a date it cannot parse', () => {
    const answer = (dateCreated: string) => validateSchema({ '@type': 'Answer', text: 'a', dateCreated });
    expect(answer('2026-08-12').warnings.map((w) => w.path)).toEqual(['schema.dateCreated']);
    expect(answer('2026-08-12T00:00:00+05:30').warnings).toEqual([]);
    expect(answer('not a date').errors.map((e) => e.path)).toEqual(['schema.dateCreated']);
  });

  it('warns about a missing Organization logo only on the page\'s own Organization, not on nested ones', () => {
    const own = validateSchema({ '@type': 'Organization', name: 'A' });
    expect(own.warnings.map((w) => w.path).sort()).toEqual(['schema.description', 'schema.logo', 'schema.url']);
    const nested = validateSchema({ '@type': 'Article', headline: 'h', image: 'https://x/i.jpg', datePublished: '2026-01-01', author: { '@type': 'Organization', name: 'A' }, publisher: { '@type': 'Organization', name: 'B' } });
    expect(nested.warnings).toEqual([]);
  });

  it('needs name and item on a breadcrumb step, but only one of them on another list item', () => {
    const crumb = (li: object) => validateSchema({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, ...li }] }).errors.map((e) => e.path);
    expect(crumb({ name: 'Home' })).toEqual(['schema.itemListElement[0].item']);
    expect(crumb({ name: 'Home', item: 'https://360ghar.com/' })).toEqual([]);
    expect(validateSchema({ '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'A', description: 'B' }] }).isValid).toBe(true);
    expect(validateSchema({ '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1 }] }).isValid).toBe(false);
  });

  it('warns about relative URLs', () => {
    expect(validateSchema({ '@type': 'ImageObject', url: '/a.png' }).warnings).toHaveLength(1);
  });
});

describe('validateBlocks', () => {
  it('needs @context on top-level blocks but not inside @graph', () => {
    expect(validateBlocks([{ '@type': 'Person', name: 'A' }]).errors[0]?.path).toBe('page[0].@context');
    expect(validateBlocks([{ '@context': 'https://schema.org', '@graph': [{ '@type': 'Person', name: 'A' }] }]).isValid).toBe(true);
  });

  it('flags one @id used for two types', () => {
    const r = validateBlocks([
      { '@context': 'https://schema.org', '@type': 'Person', name: 'A', '@id': 'https://x/#a' },
      { '@context': 'https://schema.org', '@type': 'Organization', name: 'B', '@id': 'https://x/#a' },
    ]);
    expect(r.errors.some((e) => /different types/.test(e.message))).toBe(true);
  });
});

describe('extractJsonLd', () => {
  it('reads blocks and reports broken JSON', () => {
    const html = '<script type="application/ld+json">{"@type":"Person"}</script><script type="application/ld+json">{oops</script><script>1</script>';
    const r = extractJsonLd(html);
    expect(r.blocks).toEqual([{ '@type': 'Person' }]);
    expect(r.parseErrors).toHaveLength(1);
  });
  it('formats a report', () => {
    expect(formatReport('x', validateSchema({ '@type': 'FAQPage' }))).toMatch(/^FAIL x \(1 errors/);
  });
});

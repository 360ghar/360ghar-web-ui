import { describe, expect, it } from 'vitest';
import { ORGANIZATION_ID } from '@/lib/seo/siteSchemas';
import { validateBlocks } from '@/lib/seo/validate';
import { homeFacts } from './facts';

describe('homeFacts', () => {
  it('uses evidence-conscious static rows instead of unsupported counts', () => {
    const f = homeFacts('en');
    const text = f.rows.map((r) => r.value).join('\n');
    expect(f.rows.map((r) => r.label)).toEqual(['Scope', 'Listings', 'Locality pages', 'Data Hub', 'Tools', 'AI and MCP']);
    expect(text).toContain('Details and availability can change.');
    expect(text).not.toMatch(/109 homes listed|3,215 locality and project pages|verified inventory/i);
  });

  it('does not add a live-count row', () => {
    const f = homeFacts('en');
    expect(f.rows.map((r) => r.label)).not.toContain('Homes now');
    expect(f.rows.length).toBe(6);
  });

  it('makes the JSON-LD a WebPage that lists the same rows as the page, and never an Organization', () => {
    const f = homeFacts('en');
    const ld = f.jsonLd;
    expect(ld['@type']).toBe('WebPage');
    expect(ld['@id']).toBe('https://360ghar.com/#facts');
    expect(ld.url).toBe('https://360ghar.com/');
    expect(ld.about).toEqual({ '@id': ORGANIZATION_ID });
    expect(ld.mainEntity['@type']).toBe('ItemList');
    expect(ld.mainEntity.itemListElement).toEqual(f.rows.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.label, description: r.value })));
    expect(JSON.stringify(ld)).not.toMatch(/"Organization"|knowsAbout/);
  });

  it('gives the Hindi page its own url and id', () => {
    const f = homeFacts('hi');
    expect(f.jsonLd.url).toBe('https://360ghar.com/hi');
    expect(f.jsonLd['@id']).toBe('https://360ghar.com/hi#facts');
  });

  it('passes the JSON-LD validator with no error and no warning', () => {
    for (const locale of ['en', 'hi'] as const) {
      const f = homeFacts(locale);
      const r = validateBlocks([f.jsonLd], `facts-${locale}`);
      expect(r.errors).toEqual([]);
      expect(r.warnings).toEqual([]);
    }
  });

  it('has the same rows in Hindi, and states no unchecked claim in either language', () => {
    const en = homeFacts('en');
    const hi = homeFacts('hi');
    expect(hi.rows).toHaveLength(en.rows.length);
    for (const r of [...en.rows, ...hi.rows]) expect(r.value).not.toMatch(/first|पहला|—/);
    const copy = [...en.rows, ...hi.rows].map((r) => r.value).join(' ');
    expect(copy).toMatch(/selected locality pages/i);
    expect(copy).toMatch(/not evidence of live inventory coverage/i);
    expect(copy).toMatch(/do not verify property information/i);
  });
});

import { describe, expect, it } from 'vitest';
import { MCP_TOOLS } from '@/features/content/ai/mcp';
import { ORGANIZATION_ID } from '@/lib/seo/siteSchemas';
import { validateBlocks } from '@/lib/seo/validate';
import { homeFacts } from './facts';

const num = (n: number) => n.toLocaleString('en-IN');

describe('homeFacts', () => {
  it('uses the live home count and the real tool count', () => {
    const f = homeFacts('en', { count: 109, localityTotal: 3215, num });
    const text = f.rows.map((r) => r.value).join('\n');
    expect(text).toContain('109 homes listed');
    expect(text).toContain('3,215 locality and project pages');
    expect(text).toContain(`with ${MCP_TOOLS.length} tools`);
  });

  it('leaves the homes row out when the count is not known', () => {
    const f = homeFacts('en', { count: null, localityTotal: 3215, num });
    expect(f.rows.map((r) => r.label)).not.toContain('Homes now');
    expect(f.rows.length).toBe(9);
  });

  it('makes the JSON-LD a WebPage that lists the same rows as the page, and never an Organization', () => {
    const f = homeFacts('en', { count: 109, localityTotal: 3215, num });
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
    const f = homeFacts('hi', { count: 109, localityTotal: 3215, num });
    expect(f.jsonLd.url).toBe('https://360ghar.com/hi');
    expect(f.jsonLd['@id']).toBe('https://360ghar.com/hi#facts');
  });

  it('passes the JSON-LD validator with no error and no warning', () => {
    for (const locale of ['en', 'hi'] as const) {
      const f = homeFacts(locale, { count: 109, localityTotal: 3215, num });
      const r = validateBlocks([f.jsonLd], `facts-${locale}`);
      expect(r.errors).toEqual([]);
      expect(r.warnings).toEqual([]);
    }
  });

  it('has the same rows in Hindi, and states no unchecked claim in either language', () => {
    const en = homeFacts('en', { count: 109, localityTotal: 3215, num });
    const hi = homeFacts('hi', { count: 109, localityTotal: 3215, num });
    expect(hi.rows).toHaveLength(en.rows.length);
    for (const r of [...en.rows, ...hi.rows]) expect(r.value).not.toMatch(/first|पहला|—/);
    // The only 360° line is the honest tour row: no "every", no "walkthrough".
    const tourLines = en.rows.filter((r) => /360°/.test(r.value));
    expect(tourLines.map((r) => r.label)).toEqual(['Tours']);
    expect(tourLines[0]!.value).toMatch(/for the homes that have one/);
    expect(en.rows.map((r) => r.value).join(' ')).not.toMatch(/walkthrough|every listing|all listings/i);
  });
});

import { describe, expect, it } from 'vitest';
import { APPS } from '../apps';
import { PLAY_STORE_URL, siteBlocks, speakableWebPage } from './siteSchemas';
import { validateBlocks } from './validate';

const withContext = (b: object) => ({ '@context': 'https://schema.org', ...b });

describe('siteBlocks', () => {
  const blocks = siteBlocks();
  const types = blocks.map((b) => JSON.stringify(b['@type']));

  it('holds Organization, WebSite, LocalBusiness, Person and one MobileApplication per app', () => {
    expect(types).toEqual([
      JSON.stringify(['RealEstateAgent', 'Organization']),
      '"WebSite"',
      JSON.stringify(['LocalBusiness', 'RealEstateAgent']),
      '"Person"',
      '"MobileApplication"',
      '"MobileApplication"',
    ]);
  });

  it('is valid schema.org JSON-LD with no errors', () => {
    const r = validateBlocks(blocks.map(withContext), 'site');
    expect(r.errors).toEqual([]);
  });

  it('emits no KnowledgePanel and no stand-alone SpeakableSpecification', () => {
    const json = JSON.stringify(blocks);
    expect(json).not.toContain('KnowledgePanel');
    expect(json).not.toContain('SpeakableSpecification');
  });

  it('merges the old KnowledgePanel fields into the Organization', () => {
    const org = blocks[0]!;
    expect(org.knowsAbout).toContain('Real Estate in Gurugram');
    expect(org.contactPoint).toMatchObject({ '@type': 'ContactPoint' });
    expect(new Set(org.alternateName as string[]).size).toBe((org.alternateName as string[]).length);
    expect(org.founder).toEqual({ '@id': 'https://360ghar.com/#founder' });
  });

  it('links the person and the app to the organization by @id', () => {
    expect(blocks[3]).toMatchObject({ name: 'Saksham Mittal', jobTitle: 'Founder & CEO', worksFor: { '@id': 'https://360ghar.com/#organization' } });
    expect(blocks[3]).not.toHaveProperty('image');
    expect(blocks[4]).toMatchObject({ downloadUrl: PLAY_STORE_URL, operatingSystem: 'Android' });
  });

  it('lists only live store URLs for each app', () => {
    const [ghar, flat] = [blocks[4]!, blocks[5]!];
    // 360Ghar is not on the App Store yet: Play only, Android only.
    expect(APPS.ghar360.ios).toBeNull();
    expect(ghar).toMatchObject({ operatingSystem: 'Android', downloadUrl: APPS.ghar360.play, offers: { price: '0' } });
    expect(JSON.stringify(ghar)).not.toContain('apps.apple.com');
    expect(flat).toMatchObject({ operatingSystem: 'Android, iOS', downloadUrl: [APPS.flatmates.play, APPS.flatmates.ios], applicationCategory: 'LifestyleApplication' });
    expect(new Set(blocks.map((b) => b['@id']).filter(Boolean)).size).toBe(blocks.filter((b) => b['@id']).length);
  });

  it('uses only absolute https URLs for the store link and the sameAs list', () => {
    expect(PLAY_STORE_URL).toMatch(/^https:\/\/play\.google\.com\/store\/apps\/details\?id=/);
    for (const u of blocks[0]!.sameAs as string[]) expect(u).toMatch(/^https:\/\//);
  });
});

describe('speakableWebPage', () => {
  it('nests the specification in a WebPage', () => {
    const b = speakableWebPage('https://360ghar.com/faq', ['#main h1'])!;
    expect(validateBlocks([withContext(b)]).errors).toEqual([]);
    expect(b.speakable).toEqual({ '@type': 'SpeakableSpecification', cssSelector: ['#main h1'] });
  });
  it('emits nothing without selectors', () => {
    expect(speakableWebPage('https://360ghar.com/', [])).toBeNull();
    expect(speakableWebPage('https://360ghar.com/', [''])).toBeNull();
  });
});

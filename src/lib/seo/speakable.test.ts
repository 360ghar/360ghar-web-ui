import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONTENT_SPEAKABLE, contentSpeakable } from './speakable';
import { speakableWebPage } from './siteSchemas';
import { validateBlocks } from './validate';

const layout = readFileSync('src/layouts/Content.astro', 'utf8');
const seo = readFileSync('src/lib/seo/Seo.astro', 'utf8');

describe('contentSpeakable', () => {
  it('uses the h1, and the lead only when the page has one', () => {
    expect(contentSpeakable(true)).toEqual(['.content-h1', '.content-lead']);
    expect(contentSpeakable(false)).toEqual(['.content-h1']);
  });
  it('gives nothing for a noindex page', () => {
    expect(contentSpeakable(true, true)).toBeUndefined();
  });
});

describe('selectors match the Content layout markup', () => {
  it('the h1 carries content-h1 and the lead paragraph carries content-lead', () => {
    expect(layout).toMatch(/<h1 class:list=\{\['content-h1'/);
    expect(layout).toMatch(/lead && <p class="content-lead">/);
    expect(CONTENT_SPEAKABLE.heading).toBe('.content-h1');
    expect(CONTENT_SPEAKABLE.lead).toBe('.content-lead');
  });
  it('the layout passes the selectors on, and Seo.astro emits them', () => {
    expect(layout).toContain('contentSpeakable(Boolean(lead), page.noindex)');
    expect(layout).toMatch(/<Page \{\.\.\.page\} speakable=\{speakable\}>/);
    expect(seo).toContain('speakableWebPage(canonical, speakable)');
  });
});

describe('emitted JSON-LD', () => {
  it('validates: a WebPage with speakable inside, no stand-alone SpeakableSpecification', () => {
    const block: Record<string, unknown> = { '@context': 'https://schema.org', ...speakableWebPage('https://360ghar.com/faq', contentSpeakable(true)!)! };
    expect(validateBlocks([block]).errors).toEqual([]);
    expect((block['speakable'] as { cssSelector: string[] }).cssSelector).toEqual(['.content-h1', '.content-lead']);
  });
});

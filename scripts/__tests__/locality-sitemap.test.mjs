import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalitySitemapXml } from '../lib/localitySitemap.mjs';

test('buildLocalitySitemapXml creates locality URLs with gurgaon suffix', () => {
  const xml = buildLocalitySitemapXml('https://360ghar.com', [
    { slug: 'dlf-phase-1', canonicalUrl: '/locality/dlf-phase-1-gurgaon', lastVerifiedAt: '2026-02-20' },
    { slug: 'sector-56', canonicalUrl: '/locality/sector-56-gurgaon', lastVerifiedAt: '2026-02-19' }
  ]);

  assert.match(xml, /<loc>https:\/\/360ghar.com\/locality\/dlf-phase-1-gurgaon<\/loc>/);
  assert.match(xml, /<loc>https:\/\/360ghar.com\/locality\/sector-56-gurgaon<\/loc>/);
  assert.match(xml, /<lastmod>2026-02-20<\/lastmod>/);
});

test('buildLocalitySitemapXml escapes XML special characters in URLs', () => {
  const xml = buildLocalitySitemapXml('https://360ghar.com', [
    { slug: 'test<special>', canonicalUrl: '/locality/test<special>-gurgaon', lastVerifiedAt: '2026-02-20' },
    { slug: 'test"quote"', canonicalUrl: '/locality/test"quote"-gurgaon', lastVerifiedAt: '2026-02-20' },
    { slug: 'test&ampersand', canonicalUrl: '/locality/test&ampersand-gurgaon', lastVerifiedAt: '2026-02-20' }
  ]);

  // Verify special characters are escaped
  assert.doesNotMatch(xml, /<loc>[^<]*<[^\/][^<]*<\/loc>/, 'Should not contain unescaped < in URL');
  assert.match(xml, /&lt;/, 'Should escape < as &lt;');
  assert.match(xml, /&gt;/, 'Should escape > as &gt;');
  assert.match(xml, /&quot;/, 'Should escape " as &quot;');
  assert.match(xml, /&amp;/, 'Should escape & as &amp;');
});

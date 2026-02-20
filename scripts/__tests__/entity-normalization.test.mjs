import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeName, slugifyEntity, buildCanonicalId, mergeEntityRecords } from '../lib/entityNormalization.mjs';
import { decodeNameFromUrl, isPlaceholderName } from '../ingest-gurgaon-entities.mjs';

test('normalizeName standardizes whitespace and city token variants', () => {
  assert.equal(normalizeName('  DLF   Phase 1, Gurugram '), 'dlf phase 1 gurgaon');
});

test('slugifyEntity strips punctuation and keeps deterministic slug', () => {
  assert.equal(slugifyEntity('DLF Phase 1'), 'dlf-phase-1');
});

test('buildCanonicalId is stable and scoped by city+type+slug', () => {
  assert.equal(buildCanonicalId({ city: 'Gurgaon', entityType: 'Society', slug: 'dlf-camellias' }), 'gurgaon::society::dlf-camellias');
});

test('mergeEntityRecords merges aliases and source coverage without duplicates', () => {
  const merged = mergeEntityRecords([
    {
      name: 'DLF Camellias',
      city: 'Gurgaon',
      entityType: 'Society',
      aliases: ['The Camellias'],
      sourceCoverage: ['hrera'],
      sourceUrls: ['https://example.com/a'],
      confidence: 0.7,
    },
    {
      name: 'DLF The Camellias',
      city: 'Gurgaon',
      entityType: 'Society',
      aliases: ['DLF Camellias'],
      sourceCoverage: ['magicbricks'],
      sourceUrls: ['https://example.com/b'],
      confidence: 0.9,
    }
  ]);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].slug, 'dlf-camellias');
  assert.deepEqual(merged[0].sourceCoverage.sort(), ['hrera', 'magicbricks']);
  assert.ok(merged[0].aliases.includes('The Camellias'));
  assert.ok(merged[0].aliases.includes('DLF The Camellias'));
  assert.equal(merged[0].confidence, 0.9);
});

test('mergeEntityRecords resolves slug collisions across entity types', () => {
  const merged = mergeEntityRecords([
    { name: 'Cyber City', city: 'Gurgaon', entityType: 'Locality', sourceCoverage: ['a'] },
    { name: 'Cyber City', city: 'Gurgaon', entityType: 'Commercial', sourceCoverage: ['b'] }
  ]);

  const slugs = merged.map((m) => m.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('mergeEntityRecords handles 3+ entities with same name via counter suffix', () => {
  const merged = mergeEntityRecords([
    { name: 'Green Park', city: 'Gurgaon', entityType: 'locality', sourceCoverage: ['a'] },
    { name: 'Green Park', city: 'Gurgaon', entityType: 'society', sourceCoverage: ['b'] },
    { name: 'Green Park', city: 'Gurgaon', entityType: 'apartment', sourceCoverage: ['c'] }
  ]);

  // Should have 3 unique slugs
  const slugs = merged.map((m) => m.slug);
  assert.equal(slugs.length, 3);
  assert.equal(new Set(slugs).size, 3, 'All slugs should be unique');

  // First entity keeps original slug
  assert.ok(slugs.includes('green-park'), 'First entity should keep original slug');

  // Second entity gets -{type} suffix
  assert.ok(slugs.includes('green-park-society'), 'Second entity should have -society suffix');

  // Third entity gets -{type}-1 suffix (because -apartment would still collide in some edge cases)
  assert.ok(slugs.includes('green-park-apartment'), 'Third entity should have -apartment suffix');
});

test('decodeNameFromUrl extracts real project slug from commonfloor povp urls', () => {
  const source = { source: 'commonfloor' };
  const url = 'https://www.commonfloor.com/dlf-park-place-park-towers-gurgaon/povp-01y6f0';
  const name = decodeNameFromUrl(url, source);
  assert.equal(name, 'dlf park place park towers');
});

test('isPlaceholderName identifies povp placeholders', () => {
  assert.equal(isPlaceholderName('povp 01y6f0'), true);
  assert.equal(isPlaceholderName('dlf park place'), false);
});

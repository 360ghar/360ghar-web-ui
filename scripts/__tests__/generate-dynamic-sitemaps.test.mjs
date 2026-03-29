import test from 'node:test';
import assert from 'node:assert/strict';

import { getProjectSitemapEntries } from '../generate-dynamic-sitemaps.mjs';
import { getProjectEntries } from '../lib/projectEntries.mjs';

test('getProjectSitemapEntries stays aligned with routable project entries', () => {
  assert.deepEqual(getProjectSitemapEntries(), getProjectEntries());
});

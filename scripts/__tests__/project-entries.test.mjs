import test from 'node:test';
import assert from 'node:assert/strict';

import { getProjectEntries } from '../lib/projectEntries.mjs';

test('getProjectEntries returns only routable project detail entries', () => {
  const entries = getProjectEntries();

  assert.ok(entries.length > 0);
  assert.ok(entries.every((entry) => entry.slug && entry.title));
});

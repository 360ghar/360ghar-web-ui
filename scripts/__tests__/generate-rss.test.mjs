import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { writeFeedOrPreserveExisting } from '../generate-rss.mjs';

test('writeFeedOrPreserveExisting keeps the previous feed when data is stale', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rss-preserve-'));
  const filePath = path.join(tmpDir, 'blog.xml');
  fs.writeFileSync(filePath, '<rss>existing</rss>', 'utf8');

  const result = writeFeedOrPreserveExisting({
    filePath,
    xml: '<rss>new</rss>',
    label: 'blog items',
    isFresh: false,
  });

  assert.equal(result, 'preserved');
  assert.equal(fs.readFileSync(filePath, 'utf8'), '<rss>existing</rss>');
});

test('writeFeedOrPreserveExisting writes new content for fresh data', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rss-write-'));
  const filePath = path.join(tmpDir, 'properties.xml');

  const result = writeFeedOrPreserveExisting({
    filePath,
    xml: '<rss>fresh</rss>',
    label: 'property items',
    isFresh: true,
  });

  assert.equal(result, 'written');
  assert.equal(fs.readFileSync(filePath, 'utf8'), '<rss>fresh</rss>');
});

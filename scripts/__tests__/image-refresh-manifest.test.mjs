import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import {
  buildImageRefreshManifest,
  findMissingLocalImageReferences,
} from '../lib/imageRefreshManifest.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');

test('all local image references in src resolve to files in public', async () => {
  const missing = await findMissingLocalImageReferences({ repoRoot });

  assert.deepEqual(missing, []);
});

test('image refresh manifest covers trust-critical assets with required metadata', async () => {
  const manifest = await buildImageRefreshManifest({ repoRoot });

  assert.ok(manifest.generatedAt);
  assert.ok(Array.isArray(manifest.entries));
  assert.ok(manifest.entries.length >= 20);

  const keyAssets = [
    '/assets/images/thumbs/banner-three.png',
    '/assets/images/thumbs/about-three-img.png',
    '/assets/images/thumbs/cta-img.png',
    '/assets/images/thumbs/login-img.avif',
    '/assets/images/thumbs/team1.png',
    '/assets/images/thumbs/user-img1.png',
    '/assets/images/thumbs/property-details-1.png',
    '/assets/images/blog/gurugram-guide.jpg',
  ];

  for (const assetPath of keyAssets) {
    const entry = manifest.entries.find((item) => item.path === assetPath);

    assert.ok(entry, `Expected manifest entry for ${assetPath}`);
    assert.ok(entry.usage.length > 0, `Expected usage for ${assetPath}`);
    assert.ok(entry.dimensions.width > 0, `Expected width for ${assetPath}`);
    assert.ok(entry.dimensions.height > 0, `Expected height for ${assetPath}`);
    assert.match(entry.aspectRatio, /^\d+:\d+$/);
    assert.ok(['P0', 'P1', 'P2'].includes(entry.priorityTier));
    assert.equal(typeof entry.transparentBackgroundRequired, 'boolean');
    assert.ok(entry.replacementBrief.length > 20);
  }
});

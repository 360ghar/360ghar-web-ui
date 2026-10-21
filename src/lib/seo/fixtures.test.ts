import { describe, expect, it } from 'vitest';
import { fixtureBlocks } from './fixtures';
import { validateBlocks } from './validate';

describe('fixtures pass the validator', () => {
  for (const [name, blocks] of Object.entries(fixtureBlocks())) {
    it(name, () => {
      const r = validateBlocks(blocks, name);
      expect(r.errors, JSON.stringify(r.errors)).toEqual([]);
    });
  }
});

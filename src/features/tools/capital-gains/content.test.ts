import { describe, expect, it } from 'vitest';
import { CG_FAQ, CG_HOWTO, CG_PAGE, CG_UI } from './content';

describe('capital gains copy', () => {
  it('labels the calculation as pre-tax and removes current tax rules', () => {
    for (const locale of ['en', 'hi'] as const) {
      const copy = JSON.stringify([CG_PAGE[locale], CG_UI[locale], CG_FAQ[locale], CG_HOWTO[locale]]);

      expect(CG_PAGE[locale].lead).toMatch(/pre-tax|कर-पूर्व/i);
      expect(copy).not.toMatch(/\d+(\.\d+)?%|₹\s?\d|Section 54|धारा 54/i);
    }
  });
});

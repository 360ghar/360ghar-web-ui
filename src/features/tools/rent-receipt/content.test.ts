import { describe, expect, it } from 'vitest';
import { RR_FAQ, RR_HOWTO, RR_PAGE, RR_UI } from './content';

describe('rent receipt copy', () => {
  it('does not state PAN, stamp or HRA thresholds as rules', () => {
    const copy = JSON.stringify([RR_PAGE.en, RR_PAGE.hi, RR_UI.en, RR_UI.hi, RR_FAQ, RR_HOWTO]);

    expect(copy).not.toMatch(/₹?\s?1,00,000|₹?\s?5,000|₹?\s?3,000|50%|40%/);
    expect('panNeeded' in RR_UI.en).toBe(false);
    expect('stampNote' in RR_UI.en).toBe(false);
  });

  it('provides receipt labels in Hindi', () => {
    expect(RR_UI.hi.paperTitle).toBeTruthy();
    expect(RR_UI.hi.received).toMatch(/किराये/);
    expect(RR_UI.hi.englishNote).toBe('');
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const en = JSON.parse(readFileSync(new URL('../../../i18n/locales/en/tools.json', import.meta.url), 'utf8'));
const hi = JSON.parse(readFileSync(new URL('../../../i18n/locales/hi/tools.json', import.meta.url), 'utf8'));

describe('tool locale claims', () => {
  it('removes unverified tax and rent-receipt rules in both locales', () => {
    for (const copy of [en.capitalGains, hi.capitalGains, en.rentReceipt, hi.rentReceipt]) {
      expect(JSON.stringify(copy)).not.toMatch(/\d+(\.\d+)?%|₹\s?\d|8 years|8 वर्षों/i);
    }
  });

  it('removes fixed MOFA-to-RERA conversion claims in both locales', () => {
    for (const copy of [
      en.mofaToRera,
      hi.mofaToRera,
      en.areaCalculator.faqs.q5,
      en.areaCalculator.faqs.q6,
      hi.areaCalculator.faqs.q5,
      hi.areaCalculator.faqs.q6,
      en.areaCalculator.reraVsMofaDesc,
      hi.areaCalculator.reraVsMofaDesc,
    ]) {
      expect(JSON.stringify(copy)).not.toMatch(/5.?8%|6%|5.?7%|5 से 8/i);
    }
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARPET_UI, CONVERTER_UI, MOFA_UI, PAGES } from './content';

const enTools = JSON.parse(readFileSync(new URL('../../../i18n/locales/en/tools.json', import.meta.url), 'utf8'));
const hiTools = JSON.parse(readFileSync(new URL('../../../i18n/locales/hi/tools.json', import.meta.url), 'utf8'));

describe('MOFA and RERA comparison copy', () => {
  it('requires a user assumption and labels the output illustrative', () => {
    for (const locale of ['en', 'hi'] as const) {
      expect(MOFA_UI[locale].upliftHint).toMatch(/enter|दर्ज|अपनी/i);
      expect(MOFA_UI[locale].estimate).toMatch(/illustrative|illustration|उदाहरण|अनुमान/i);
      expect(JSON.stringify(MOFA_UI[locale])).not.toMatch(/5 to 8|5-8|6%|5 से 8|6%/i);
    }
  });

  it('does not claim a fixed legal MOFA-to-RERA conversion', () => {
    for (const locale of ['en', 'hi'] as const) {
      expect(JSON.stringify(PAGES.mofaToRera[locale])).not.toMatch(/5.?8%|6%|5.?7%|5 से 8/i);
    }
  });
});

describe('area tool evidence claims', () => {
  it('labels carpet-area outputs as scenarios, not official or typical measurements', () => {
    const copy = JSON.stringify([
      CARPET_UI.en,
      CARPET_UI.hi,
      PAGES.sqFt,
      enTools.areaCalculator,
      hiTools.areaCalculator,
    ]);

    expect(copy).not.toMatch(/RERA-compliant|RERA uses|RERA mandates|usually 25|25 to 35%|25-35%|standard loading is|typically 10-15%|actual area you can use|आमतौर पर 25|25 से 35%|RERA.*इस्तेमाल करता/i);
    expect(copy).toMatch(/assumption|illustrative|not.*official|not.*measurement|धारणा|उदाहरण|आधिकारिक.*नहीं|माप.*नहीं/i);
    expect(`${PAGES.sqFt.en.lead} ${PAGES.sqFt.hi.lead}`).not.toMatch(/RERA/i);
  });

  it('does not claim regional conversion factors without qualifying local-unit differences', () => {
    const copy = JSON.stringify([CONVERTER_UI.en, CONVERTER_UI.hi, enTools.areaConverter, hiTools.areaConverter]);

    expect(copy).not.toMatch(/27,220|Haryana.{0,40}27,000|Uttar Pradesh.{0,40}27,220|standard across|commonly used in South India|फ्री|सटीक|accurate area unit conversion/i);
    expect(copy).toMatch(/local|record|document|स्थानीय|रिकॉर्ड|दस्तावेज़/i);
  });
});

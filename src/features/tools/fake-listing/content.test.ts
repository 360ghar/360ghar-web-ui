import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FAKE_FAQ, FAKE_PAGE, FAKE_UI } from './content';

describe('listing link checker copy', () => {
  it.each(['en', 'hi'] as const)('limits %s claims to URL checks', (locale) => {
    const page = FAKE_PAGE[locale];
    const visible = [
      page.heading,
      page.lead,
      page.description,
      page.beforeTitle,
      page.before,
      page.faqTitle,
      JSON.stringify(FAKE_FAQ[locale]),
      JSON.stringify(FAKE_UI[locale]),
      ...Object.values(FAKE_UI[locale].flags).map((flag) => flag('example.test', 'portal')),
    ].join('\n');

    expect(visible).toMatch(locale === 'en' ? /does not verify/i : /पुष्टि नहीं/);
    expect(visible).not.toMatch(/fake|फ़र्ज़ी|verified|वेरिफ़ाइड|MagicBricks|99acres|Housing\.com|NoBroker|CommonFloor/i);
  });

  it('does not emit HowTo schema that is not visible on the page', () => {
    const route = readFileSync('src/pages/check-fake-listing.astro', 'utf8');
    expect(route).not.toMatch(/\bhowTo\b|FAKE_HOWTO/);
  });
});

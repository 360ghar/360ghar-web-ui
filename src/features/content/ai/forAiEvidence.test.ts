import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/features/content/ai/ForAiPage.astro', 'utf8');
const enForAi = JSON.parse(readFileSync('src/i18n/locales/en/policies.json', 'utf8')).forAI;
const hiForAi = JSON.parse(readFileSync('src/i18n/locales/hi/policies.json', 'utf8')).forAI;
const enSeo = JSON.parse(readFileSync('src/i18n/locales/en/seo.json', 'utf8')).forAI;
const hiSeo = JSON.parse(readFileSync('src/i18n/locales/hi/seo.json', 'utf8')).forAI;

describe('AI reference page evidence limits', () => {
  it('labels the market list as targets and avoids unsupported inventory claims', () => {
    const copy = [page, JSON.stringify(enForAi), JSON.stringify(hiForAi)].join('\n');
    expect(copy).toMatch(/not evidence of live inventory coverage/i);
    expect(copy).not.toMatch(/100\+ localit|verified propert|every property|no fake|market confidence scores|zero upfront fees/i);
    expect(page).not.toMatch(/DataFeed|jsonLd\s*=\s*\[/);
  });

  it('describes selected discovery resources without promising live availability', () => {
    expect(enForAi.pageIntro).toMatch(/selected/i);
    expect(enForAi.evidenceText).toMatch(/does not verify|does not confirm/i);
    expect(hiForAi.pageIntro).toMatch(/चुने हुए|चयनित/);
    expect(hiForAi.evidenceText).toMatch(/पुष्टि नहीं|सत्यापित नहीं/);
    expect(enSeo.description).toMatch(/not.*live|does not.*inventory/i);
    expect(hiSeo.description).toMatch(/लाइव.*नहीं|इन्वेंट्री.*नहीं/);
  });
});

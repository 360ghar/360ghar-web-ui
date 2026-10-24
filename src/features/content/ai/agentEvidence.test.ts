import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/features/content/ai/AiAgentPage.astro', 'utf8');
const enAgent = JSON.parse(readFileSync('src/i18n/locales/en/policies.json', 'utf8')).aiAgent;
const hiAgent = JSON.parse(readFileSync('src/i18n/locales/hi/policies.json', 'utf8')).aiAgent;
const enSeo = JSON.parse(readFileSync('src/i18n/locales/en/seo.json', 'utf8')).aiAgent;
const hiSeo = JSON.parse(readFileSync('src/i18n/locales/hi/seo.json', 'utf8')).aiAgent;

describe('AI agent page evidence limits', () => {
  it('does not promise verified listings, guaranteed results, free access or accuracy', () => {
    const copy = [page, JSON.stringify(enAgent), JSON.stringify(hiAgent)].join('\n');
    expect(copy).not.toMatch(/verified propert|all property data is verified|real results|12 matching properties|MCP server access is free|price:\s*['"]0|permanent access|match accuracy/i);
  });

  it('limits the page description and metadata to the listed tools and their caveats', () => {
    expect(enAgent.heroDesc).toMatch(/tool list/i);
    expect(enAgent.mcpInfoText).toMatch(/does not verify|does not confirm/i);
    expect(hiAgent.heroDesc).toMatch(/टूल सूची/);
    expect(hiAgent.mcpInfoText).toMatch(/पुष्टि नहीं|सत्यापित नहीं/);
    expect(enSeo.description).toMatch(/does not confirm|does not verify/i);
    expect(hiSeo.description).toMatch(/पुष्टि नहीं|सत्यापित नहीं/);
  });
});

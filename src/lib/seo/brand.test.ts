import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const LINE = "India's first AI + VR real estate platform";
const read = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8');

describe('brand line', () => {
  it.each(['public/llms.txt', 'public/data/llm-feed.json', 'public/.well-known/ai.txt', 'src/i18n/locales/en/home.json', 'src/i18n/locales/en/seo.json', 'src/lib/seo/legacy/structuredData.js'])('%s says it one way', (file) => {
    const text = read(file).replaceAll("\\'", "'");
    expect(text).toContain(LINE);
    expect(text).not.toMatch(/AI \+ VR-first|AI and VR-first|AI-Enabled and Virtual Tour first/);
  });
});

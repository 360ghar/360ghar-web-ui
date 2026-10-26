import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FILES = [
  'public/llms.txt',
  'public/data/llm-feed.json',
  'public/.well-known/ai.txt',
  'src/i18n/locales/en/home.json',
  'src/i18n/locales/hi/home.json',
  'src/i18n/locales/en/seo.json',
  'src/i18n/locales/hi/seo.json',
  'src/lib/seo/legacy/siteMetadata.js',
  'src/lib/seo/legacy/authors.js',
  'src/lib/seo/legacy/structuredData.js',
];
const UNSUPPORTED_BRAND_CLAIMS =
  /(?:India['’]s first AI|India['’]s AI \+ VR|AI \+ VR real estate platform|भारत का पहला AI|भारत का AI \+ VR|AI \+ VR रियल एस्टेट|VR-First|VR-फर्स्ट)/i;
const read = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8');

describe('public brand copy', () => {
  it.each(FILES)('%s avoids an unsupported first-in-market claim', (file) => {
    const text = read(file).replaceAll("\\'", "'");
    expect(text).not.toMatch(UNSUPPORTED_BRAND_CLAIMS);
  });
});

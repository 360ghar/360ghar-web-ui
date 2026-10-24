import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./sections/FreeAiSection.astro', import.meta.url), 'utf8');
const copy = source.match(/const COPY = \{([\s\S]*?)\n\}\[locale\];/)?.[1] ?? '';

describe('homepage AI tools copy', () => {
  it('does not promise free access, fixed speed or fixed outputs', () => {
    expect(copy).not.toMatch(
      /half a minute|all 360ghar ai tools are free|no sign-up|no credits|no card|made with 360ghar ai models|12 styles|score out of 10|room-by-room fixes|searches live listings|यह लाइव लिस्टिंग खोजता है/i,
    );
  });

  it('qualifies tool output and asks users to verify property details', () => {
    expect(copy).toMatch(/not professional advice/i);
    expect(copy).toMatch(/does not verify property details or availability/i);
    expect(copy).toMatch(/पेशेवर सलाह नहीं/);
    expect(copy).toMatch(/लिस्टिंग देने वाले से जाँचें/);
  });
});

import { describe, expect, it } from 'vitest';
import { siteBlocks } from './siteSchemas';
import { realEstateStructuredData } from './legacy/structuredData.js';
import { generateToolSchema, toolSchemas } from './legacy/toolSchemas.js';

describe('shared structured data claims', () => {
  it('omits unsupported universal verification, tour, first-in-India and superiority claims', () => {
    const serialized = JSON.stringify(siteBlocks());
    expect(serialized).not.toMatch(/India's first|VR-First|eliminate fake|physically verified|every property|every listed property|all properties|all listings|unlike other portals|superior/i);
  });

  it('does not expose the unused legacy FAQ schema with unsupported claims', () => {
    expect(realEstateStructuredData).not.toHaveProperty('faq');
  });

  it('keeps every exported legacy shared block free of absolute trust claims', () => {
    const serialized = JSON.stringify(realEstateStructuredData);
    expect(serialized).not.toMatch(/India's first|VR-First|eliminate fake|physically verified|every property|every listed property|all properties|all listings|unlike other portals|no hidden charges/i);
  });

  it('does not publish a zero-price offer for tools without price evidence', () => {
    for (const config of Object.values(toolSchemas)) {
      expect(generateToolSchema(config)).not.toHaveProperty('offers');
    }
  });

  it('omits unsupported pricing, timing and accuracy claims from tool schema descriptions', () => {
    const descriptions = Object.values(toolSchemas).map((tool) => tool.description).join(' ');
    expect(descriptions).not.toMatch(/\bfree\b|no sign-up|instantly|photorealistic|about half a minute|5-8%|7% male|5% female|6% joint|never miss/i);
  });
});

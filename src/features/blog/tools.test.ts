import { describe, expect, it } from 'vitest';
import { postTools } from './tools';

describe('postTools', () => {
  it('matches the words of the post first, then the category', () => {
    expect(postTools('Understanding Circle Rates in Gurugram').map((t) => t.href)).toEqual(['/circle-rates', '/stamp-duty-calculator', '/emi-calculator']);
    expect(postTools('Vastu tips for a new apartment', '', 'vastu-design').map((t) => t.href)[0]).toBe('/vastu-checker');
    expect(postTools('A short note', '', 'rental-tips').map((t) => t.href)).toEqual(['/rent-receipt', '/property-document-checklist', '/emi-calculator']);
  });

  it('ranks the title above the tags', () => {
    expect(postTools("Understanding RERA: A First-Time Buyer's Guide", 'RERA First-Time Buyer Home Loan', 'legal-rera').map((t) => t.href)).toEqual(['/rera-projects', '/builder-reputation', '/emi-calculator']);
  });

  it('always returns known tools with a label key and never repeats', () => {
    const tools = postTools('RERA lease rent emi loan area vastu', '', 'legal-rera', 10);
    expect(new Set(tools.map((t) => t.href)).size).toBe(tools.length);
    for (const t of tools) expect(t.key).toMatch(/:/);
  });
});

import { describe, expect, it } from 'vitest';
import { splitLabel, splitNumber } from './label';

describe('splitLabel', () => {
  it('splits a short leading label', () => {
    expect(splitLabel('Expected ROI: 8-10% annually')).toEqual({ label: 'Expected ROI', text: '8-10% annually' });
    expect(splitLabel('अपेक्षित ROI: 8-10% सालाना')).toEqual({ label: 'अपेक्षित ROI', text: '8-10% सालाना' });
  });

  it('leaves sentences and empty labels alone', () => {
    expect(splitLabel('No colon here')).toEqual({ label: '', text: 'No colon here' });
    expect(splitLabel('Pro Tip:')).toEqual({ label: '', text: 'Pro Tip:' });
    expect(splitLabel('A very long sentence that goes on and on before a colon: x').label).toBe('');
  });
});

describe('splitNumber', () => {
  it('splits a leading step number', () => {
    expect(splitNumber('1. Buy and Hold Strategy')).toEqual({ n: '1', text: 'Buy and Hold Strategy' });
    expect(splitNumber('Buy')).toEqual({ n: '', text: 'Buy' });
  });
});

describe('undash', () => {
  it('replaces spaced em and en dashes with a comma', async () => {
    const { undash } = await import('./text');
    expect(undash('DLF Phase 1 through 5 — premium sectors')).toBe('DLF Phase 1 through 5, premium sectors');
    expect(undash('2-3 months – market')).toBe('2-3 months, market');
    expect(undash('state-wise')).toBe('state-wise');
  });
});

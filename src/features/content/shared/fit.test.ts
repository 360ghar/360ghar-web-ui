import { describe, expect, it } from 'vitest';
import { titleFit } from './fit';

describe('titleFit', () => {
  it('leaves short titles alone and caps longer ones harder', () => {
    expect(titleFit('Questions and answers')).toBeNull();
    const sizes = [35, 45, 55, 70, 90].map((n) => titleFit('x'.repeat(n))!);
    for (let i = 1; i < sizes.length; i += 1) expect(sizes[i]).toBeLessThan(sizes[i - 1]!);
  });

  it('counts Devanagari by code point, not by bytes', () => {
    expect(titleFit('अ'.repeat(30))).toBeNull();
  });
});

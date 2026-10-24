import { describe, expect, it } from 'vitest';
import { carpetAreas } from './carpet';
import { convertCarpet } from './mofa';

describe('carpetAreas', () => {
  it('matches the old defaults (1000 sq ft, 30% loading, 15% walls)', () => {
    const a = carpetAreas(1000, 30, 15);
    expect(a.carpet).toBe(700);
    expect(a.builtUp).toBeCloseTo(805, 9);
    expect(a.loading).toBe(300);
    expect(a.common).toBeCloseTo(195, 9);
    expect(a.carpet + a.walls + a.common).toBeCloseTo(1000, 9);
  });

  it('caps built-up at the super area', () => {
    const a = carpetAreas(1000, 15, 40);
    expect(a.builtUp).toBe(1000);
    expect(a.common).toBe(0);
  });

  it('treats a negative area as zero', () => {
    expect(carpetAreas(-5, 30, 15).carpet).toBe(0);
  });
});

describe('convertCarpet', () => {
  it('does not calculate without a user-entered assumption', () => {
    expect(Number.isNaN(convertCarpet(1000, 'mofa_to_rera').result)).toBe(true);
  });

  it('uses only the explicit user-entered assumption', () => {
    expect(convertCarpet(1000, 'mofa_to_rera', 8).result).toBe(1080);
    expect(convertCarpet(1000, 'mofa_to_rera', 5).result).toBe(1050);
  });
});

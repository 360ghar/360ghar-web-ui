import { describe, expect, it } from 'vitest';
import * as math from './math';

describe('pre-tax gain', () => {
  it('subtracts purchase price and transfer expenses from sale price', () => {
    expect(math.preTaxGain(5_000_000, 2_000_000, 50_000)).toBe(2_950_000);
  });

  it('keeps a negative result as pre-tax arithmetic', () => {
    expect(math.preTaxGain(1_000_000, 2_000_000, 50_000)).toBe(-1_050_000);
  });
});

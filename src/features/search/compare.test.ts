import { describe, expect, it } from 'vitest';
import { COMPARE_MAX, restoreCompare } from './compare';

describe('restoreCompare', () => {
  it('keeps a valid list', () => {
    expect(restoreCompare({ ids: [3, 9, 12] })).toEqual({ ids: [3, 9, 12] });
  });

  it('drops anything that is not a positive whole number, repeats, and extra homes', () => {
    expect(restoreCompare({ ids: [1, 1, '2', 0, -4, 2.5, null, 7, 8, 9, 10] }).ids).toEqual([1, 7, 8, 9].slice(0, COMPARE_MAX));
  });

  it('turns a damaged or old entry into an empty list', () => {
    for (const bad of [undefined, null, 'x', 5, [], { ids: 'x' }, { ids: { 0: 1 } }, {}]) expect(restoreCompare(bad)).toEqual({ ids: [] });
  });
});

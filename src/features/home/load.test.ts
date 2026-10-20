import { describe, expect, it } from 'vitest';
import { totalOf } from './load';

describe('totalOf', () => {
  it('reads the total of a list call', () => {
    expect(totalOf({ data: { total: 183 } })).toBe(183);
  });

  it('gives null when the call failed or the total is not a usable number', () => {
    expect(totalOf({ data: null })).toBeNull();
    expect(totalOf({})).toBeNull();
    expect(totalOf({ data: { total: null } })).toBeNull();
    expect(totalOf({ data: { total: 0 } })).toBeNull();
  });
});

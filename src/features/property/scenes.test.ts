import { describe, expect, it } from 'vitest';
import { buildingRise } from './scenes';

describe('building rise', () => {
  it('is the height of the home floor above the ground', () => {
    expect(buildingRise(0, 4)).toBe(0);
    expect(buildingRise(2, 4)).toBe(60);
  });

  it('stays inside the building', () => {
    expect(buildingRise(99, 4)).toBe(90);
    expect(buildingRise(-3, 4)).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { amenityIcon, FACT_ICONS } from './amenities';
import { icons } from './paths';

describe('icons', () => {
  it('every icon is a closed path with finite coordinates inside the 24 grid', () => {
    for (const [name, d] of Object.entries(icons)) {
      expect(d, name).toMatch(/^M/);
      expect(d, name).not.toMatch(/NaN|Infinity|undefined/);
      for (const n of d.match(/-?\d+(\.\d+)?/g) ?? []) expect(Math.abs(Number(n)), name).toBeLessThanOrEqual(24);
    }
  });

  it('has the detail page icons and the fact map points at real icons', () => {
    for (const name of ['age', 'balcony', 'moon', 'guests', 'playground', 'track']) expect(icons).toHaveProperty(name);
    for (const name of Object.values(FACT_ICONS)) expect(icons).toHaveProperty(name);
  });

  it('maps the API amenity keys, with a tick for unknown keys', () => {
    expect(amenityIcon('playground')).toBe('playground');
    expect(amenityIcon('running')).toBe('track');
    expect(amenityIcon('elevator')).toBe('lift');
    expect(amenityIcon('no-such-key')).toBe('check');
    expect(amenityIcon(null)).toBe('check');
  });
});

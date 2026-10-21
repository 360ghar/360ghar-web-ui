import { describe, expect, it } from 'vitest';
import type { Property } from '@/lib/api/types';
import { partial } from '@/lib/api/testing';
import { detailRows } from './details';

const base = partial<Property>({ id: 182, purpose: 'buy', is_available: true });
const none = { availableFrom: null, updated: null };

describe('detail rows', () => {
  it('shows the id and drops empty fields and the status of an available home', () => {
    expect(detailRows(base, 'en', none)).toEqual([['Listing ID', '#182']]);
  });

  it('turns enums into words', () => {
    const rows = detailRows({ ...base, kitchen_type: 'non_vegetarian', ventilation_type: 'good' } as Property, 'en', none);
    expect(rows).toContainEqual(['Kitchen rules', 'Non-vegetarian']);
    expect(rows).toContainEqual(['Ventilation', 'Good']);
  });

  it('falls back to spaced words for an unknown enum value', () => {
    expect(detailRows(Object.assign({ ...base }, { kitchen_type: 'jain_only' }), 'en', none)).toContainEqual(['Kitchen rules', 'Jain only']);
  });

  it('says so when the home is not available', () => {
    expect(detailRows({ ...base, is_available: false } as Property, 'en', none)[0]).toEqual(['Status', 'Not available']);
  });
});

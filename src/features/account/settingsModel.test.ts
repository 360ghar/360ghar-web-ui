import { describe, expect, it } from 'vitest';
import { alertParts, prefsToValues, valuesToPatch, type Alert } from './settingsModel';
import { partial } from '@/lib/api/testing';

describe('preferences form values', () => {
  it('maps an empty profile to empty text', () => {
    expect(prefsToValues(undefined)).toEqual({
      purpose: '',
      property_type: [],
      budget_min: '',
      budget_max: '',
      bedrooms_min: '',
      bedrooms_max: '',
      area_min: '',
      area_max: '',
      location_preference: '',
      max_distance_km: '',
    });
  });

  it('round trips stored values', () => {
    const v = prefsToValues({ purpose: 'rent', property_type: ['apartment', 'villa'], budget_max: 50000, bedrooms_min: 2, location_preference: ['Sector 56', 'DLF Phase 2'] });
    expect(v.location_preference).toBe('Sector 56, DLF Phase 2');
    expect(valuesToPatch(v)).toMatchObject({ purpose: 'rent', property_type: ['apartment', 'villa'], budget_max: 50000, bedrooms_min: 2, location_preference: ['Sector 56', 'DLF Phase 2'], budget_min: null, area_max: null });
  });

  it('sends null for every cleared field so the backend removes the key', () => {
    const patch = valuesToPatch(prefsToValues({}));
    expect(Object.keys(patch)).toHaveLength(10);
    expect(Object.values(patch).every((x) => x === null)).toBe(true);
  });

  it('reads Indian digit grouping and trims places', () => {
    const v = { ...prefsToValues({}), budget_min: '12,50,000', location_preference: ' Palam Vihar ,, Sohna ' };
    expect(valuesToPatch(v)).toMatchObject({ budget_min: 1250000, location_preference: ['Palam Vihar', 'Sohna'] });
  });
});

describe('alertParts', () => {
  const money = (n: number) => `₹${n}`;
  const type = (v: string) => v.toUpperCase();
  const a = (f: Partial<Alert>) => partial<Alert>({ id: 1, ...f });
  it('names the filters', () => {
    expect(alertParts(a({ bank_name: 'HDFC', city: 'Gurugram', property_type: 'plot', min_price: 10, max_price: 20, keyword: 'corner' }), type, money, 'Any', 'Keyword')).toEqual({
      title: 'HDFC · Gurugram · PLOT',
      detail: 'Keyword: corner · ₹10 – ₹20',
    });
  });
  it('falls back for an alert with no filter', () => {
    expect(alertParts(a({}), type, money, 'Any auction', 'Keyword')).toEqual({ title: 'Any auction', detail: '' });
  });
  it('handles one-sided prices', () => {
    expect(alertParts(a({ max_price: 5 }), type, money, 'x', 'k').detail).toBe('≤ ₹5');
    expect(alertParts(a({ min_price: 5 }), type, money, 'x', 'k').detail).toBe('≥ ₹5');
  });
});

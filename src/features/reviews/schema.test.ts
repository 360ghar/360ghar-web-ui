import { describe, expect, it } from 'vitest';
import { REVIEW_SOURCE, isSpam, reviewPayload, reviewSchema, type ReviewValues } from './schema';

const errors = { rating: 'rating', textShort: 'short', textLong: 'long', nameLong: 'name' };
const schema = reviewSchema(errors);
const ok = { rating: '4', text: 'The team was on time and the flat matched the photos.', name: '', role: 'tenant', website: '' };
const messages = (input: unknown) => {
  const r = schema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe('reviewSchema', () => {
  it('accepts a review with a rating and a text, with or without a name and role', () => {
    expect(messages(ok)).toEqual([]);
    expect(messages({ ...ok, role: '', name: 'Asha' })).toEqual([]);
  });

  it('needs a rating from 1 to 5', () => {
    expect(messages({ ...ok, rating: undefined })).toEqual(['rating']);
    expect(messages({ ...ok, rating: '' })).toEqual(['rating']);
    expect(messages({ ...ok, rating: '0' })).toEqual(['rating']);
    expect(messages({ ...ok, rating: '6' })).toEqual(['rating']);
  });

  it('needs 20 characters of text, after trimming, and at most 2000', () => {
    expect(messages({ ...ok, text: 'too short' })).toEqual(['short']);
    expect(messages({ ...ok, text: `   ${'x'.repeat(19)}   ` })).toEqual(['short']);
    expect(messages({ ...ok, text: 'x'.repeat(20) })).toEqual([]);
    expect(messages({ ...ok, text: 'x'.repeat(2001) })).toEqual(['long']);
  });

  it('rejects a role outside the four the old form used, and a long name', () => {
    expect(messages({ ...ok, role: 'broker' }).length).toBeGreaterThan(0);
    expect(messages({ ...ok, name: 'x'.repeat(81) })).toEqual(['name']);
  });
});

describe('spam and payload', () => {
  const values = schema.parse(ok) as ReviewValues;

  it('treats a filled honeypot as spam', () => {
    expect(isSpam({ website: '' })).toBe(false);
    expect(isSpam({ website: 'x' })).toBe(true);
  });

  it('marks the mail as a review, keeps the old fields, and says Anonymous without a name', () => {
    const p = reviewPayload(values);
    expect(p).toMatchObject({ source: REVIEW_SOURCE, form_type: REVIEW_SOURCE, rating: '4', role: 'tenant', name: 'Anonymous', platform: 'web' });
    expect(p._subject).toBe('Review: 4 of 5 from a tenant');
    expect(Object.keys(p)).not.toContain('website');
    expect(Object.keys(p)).not.toContain('property_id');
  });

  it('adds the property id when a property page passes one', () => {
    expect(reviewPayload(values, 182).property_id).toBe('182');
    expect(reviewPayload({ ...values, role: '' }, null)._subject).toBe('Review: 4 of 5');
  });
});

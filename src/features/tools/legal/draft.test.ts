import { describe, expect, it } from 'vitest';
import { amountRequired, defaults, parseDraft, schemaFor, toFields } from './draft';

const good = {
  landlord_name: 'Sunita Gupta', landlord_address: 'A-1, DLF Phase 1', tenant_name: 'Rahul Sharma', tenant_address: 'B-2, Sector 57',
  property_address: 'Flat 402, Gurugram', city: 'Gurugram', state: 'Haryana', monthly_rent: '25000', security_deposit: '75000', start_date: '2026-11-01',
  duration_months: '11', rent_due_day: '5', lock_in_months: '0', notice_period_days: '30', annual_increase_percent: '5', furnished: 'false', maintenance_by: 'tenant', additional_terms: '',
};

describe('schemaFor', () => {
  it('accepts a full rent agreement form', () => {
    expect(schemaFor('rent_agreement').safeParse(good).success).toBe(true);
  });
  it('rejects empty required fields, bad numbers, short text and out-of-range values', () => {
    const s = schemaFor('rent_agreement');
    expect(s.safeParse({ ...good, tenant_name: '' }).success).toBe(false);
    expect(s.safeParse({ ...good, tenant_name: 'R' }).success).toBe(false);
    expect(s.safeParse({ ...good, monthly_rent: '12abc' }).success).toBe(false);
    expect(s.safeParse({ ...good, monthly_rent: '2500.5' }).success).toBe(false);
    expect(s.safeParse({ ...good, duration_months: '99' }).success).toBe(false);
    expect(s.safeParse({ ...good, rent_due_day: '29' }).success).toBe(false);
    expect(s.safeParse({ ...good, notice_period_days: '3' }).success).toBe(false);
    expect(s.safeParse({ ...good, maintenance_by: 'bank' }).success).toBe(false);
  });
  it('lets a legal notice leave the optional amount, date and facts empty', () => {
    const ok = { ...defaults('legal_notice'), property_address: 'Flat 1', sender_name: 'Ab', sender_address: 'Sector 1', recipient_name: 'Cd', recipient_address: 'Sector 2' };
    expect(schemaFor('legal_notice').safeParse(ok).success).toBe(true);
  });
});

describe('toFields', () => {
  it('sends numbers as numbers, the furnished choice as a boolean, and drops empty values', () => {
    expect(toFields('rent_agreement', { ...good, furnished: 'true' })).toMatchObject({ monthly_rent: 25000, duration_months: 11, furnished: true, maintenance_by: 'tenant' });
    expect('additional_terms' in toFields('rent_agreement', good)).toBe(false);
    expect(toFields('legal_notice', { ...defaults('legal_notice'), amount: '', facts: ' text ' })).toMatchObject({ facts: 'text', compliance_days: 15, notice_type: 'security_deposit_refund' });
    expect('amount' in toFields('legal_notice', { amount: '' })).toBe(false);
  });
});

describe('amountRequired', () => {
  it('asks for an amount only for unpaid rent and a deposit refund', () => {
    expect(amountRequired('legal_notice', { notice_type: 'rent_arrears', amount: '' })).toBe(true);
    expect(amountRequired('legal_notice', { notice_type: 'security_deposit_refund', amount: '5000' })).toBe(false);
    expect(amountRequired('legal_notice', { notice_type: 'vacate_premises', amount: '' })).toBe(false);
    expect(amountRequired('rent_agreement', { amount: '' })).toBe(false);
  });
});

describe('parseDraft', () => {
  it('reads sections as clauses and keeps the disclaimer', () => {
    expect(parseDraft({ kind: 'rent_agreement', title: 'Agreement', sections: [{ heading: '1. Term', body: 'Eleven months.' }, { heading: 'x', body: '' }], disclaimer: 'Fixed.', narrative_source: 'template' })).toEqual({
      title: 'Agreement',
      clauses: [{ heading: '1. Term', text: 'Eleven months.' }],
      disclaimer: 'Fixed.',
    });
  });
  it('keeps the original text only when the model reworded it', () => {
    const sections = [{ heading: 'A', body: 'B' }];
    expect(parseDraft({ title: 'T', sections, narrative_source: 'model', original_text: 'my words' })?.original).toBe('my words');
    expect(parseDraft({ title: 'T', sections, narrative_source: 'template', original_text: 'my words' })?.original).toBeUndefined();
  });
  it('gives null when there is nothing to show', () => {
    expect(parseDraft({})).toBeNull();
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft({ sections: [] })).toBeNull();
  });
});

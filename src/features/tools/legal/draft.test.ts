import { describe, expect, it } from 'vitest';
import { defaults, parseDraft, schemaFor, toFields } from './draft';

const good = {
  landlord_name: 'Sunita Gupta', landlord_address: 'A-1, DLF Phase 1', tenant_name: 'Rahul Sharma', tenant_address: 'B-2, Sector 57',
  property_address: 'Flat 402, Gurugram', monthly_rent: '25000', security_deposit: '75000', start_date: '2026-11-01',
  term_months: '11', lock_in_months: '3', notice_months: '1', annual_increase_percent: '5', maintenance_paid_by: 'tenant',
};

describe('schemaFor', () => {
  it('accepts a full rent agreement form', () => {
    expect(schemaFor('rent_agreement').safeParse(good).success).toBe(true);
  });
  it('rejects empty required fields, bad numbers and out-of-range values', () => {
    const s = schemaFor('rent_agreement');
    expect(s.safeParse({ ...good, tenant_name: '' }).success).toBe(false);
    expect(s.safeParse({ ...good, monthly_rent: '12abc' }).success).toBe(false);
    expect(s.safeParse({ ...good, term_months: '99' }).success).toBe(false);
    expect(s.safeParse({ ...good, maintenance_paid_by: 'bank' }).success).toBe(false);
  });
  it('lets a legal notice leave the optional amount and date empty', () => {
    const ok = { ...defaults('legal_notice'), property_address: 'Flat 1', facts: 'Deposit not returned.', sender_name: 'A', sender_address: 'B', recipient_name: 'C', recipient_address: 'D' };
    expect(schemaFor('legal_notice').safeParse(ok).success).toBe(true);
  });
});

describe('toFields', () => {
  it('sends numbers as numbers and drops empty values', () => {
    expect(toFields('legal_notice', { ...defaults('legal_notice'), amount: '', facts: ' text ', days_to_comply: '15' })).toMatchObject({ facts: 'text', days_to_comply: 15, reason: 'deposit_refund' });
    expect('amount' in toFields('legal_notice', { amount: '' })).toBe(false);
  });
});

describe('parseDraft', () => {
  it('reads clauses with headings', () => {
    expect(parseDraft({ title: 'Agreement', clauses: [{ heading: '1. Term', text: 'Eleven months.' }, { text: 'Plain.' }, { text: '' }] })).toEqual({
      title: 'Agreement',
      clauses: [{ heading: '1. Term', text: 'Eleven months.' }, { text: 'Plain.' }],
    });
  });
  it('splits one text into paragraphs', () => {
    expect(parseDraft({ text: 'One.\n\nTwo.' })?.clauses).toEqual([{ text: 'One.' }, { text: 'Two.' }]);
  });
  it('gives null when there is nothing to show', () => {
    expect(parseDraft({})).toBeNull();
    expect(parseDraft(null)).toBeNull();
    expect(parseDraft({ clauses: [] })).toBeNull();
  });
});

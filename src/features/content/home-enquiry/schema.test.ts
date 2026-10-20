import { describe, expect, it } from 'vitest';
import { ENQUIRY_SOURCE, enquiryPayload, enquirySchema, isSpam, type EnquiryValues } from './schema';

const errors = { name: 'name', email: 'email', emailInvalid: 'email bad', address: 'address', notesLong: 'long', consent: 'consent' };
const schema = enquirySchema(errors);
const ok = { full_name: ' Asha Rao ', email: 'asha@example.com', address: 'DLF Phase 3, Gurugram', message: '', consent: true, website: '' };
const messages = (input: unknown) => {
  const r = schema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe('enquirySchema', () => {
  it('accepts a full enquiry and trims the text', () => {
    const r = schema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.full_name).toBe('Asha Rao');
  });

  it('needs a name, an email in a valid shape and an address', () => {
    expect(messages({ ...ok, full_name: '  ' })).toEqual(['name']);
    // An empty email fails two rules; the form shows the first message.
    expect(messages({ ...ok, email: '' })[0]).toBe('email');
    expect(messages({ ...ok, email: 'asha@' })).toEqual(['email bad']);
    expect(messages({ ...ok, address: '' })).toEqual(['address']);
  });

  it('lets the notes stay empty but not run past 2000 characters', () => {
    expect(messages({ ...ok, message: '' })).toEqual([]);
    expect(messages({ ...ok, message: 'x'.repeat(2001) })).toEqual(['long']);
  });

  it('needs the terms box ticked', () => {
    expect(messages({ ...ok, consent: false })).toEqual(['consent']);
  });
});

describe('spam and payload', () => {
  const values = schema.parse(ok) as EnquiryValues;

  it('treats a filled honeypot as spam', () => {
    expect(isSpam({ website: '' })).toBe(false);
    expect(isSpam({ website: '   ' })).toBe(false);
    expect(isSpam({ website: 'http://spam.example' })).toBe(true);
  });

  it('marks the mail as a home enquiry and leaves the honeypot out', () => {
    const p = enquiryPayload(values);
    expect(p).toMatchObject({ source: ENQUIRY_SOURCE, form_type: ENQUIRY_SOURCE, full_name: 'Asha Rao', email: 'asha@example.com', address: 'DLF Phase 3, Gurugram', terms_agreement: 'yes' });
    expect(p._subject).toContain('DLF Phase 3');
    expect(Object.keys(p)).not.toContain('website');
    expect(Object.keys(p)).not.toContain('consent');
  });
});

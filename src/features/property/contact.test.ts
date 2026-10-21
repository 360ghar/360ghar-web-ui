import { describe, expect, it } from 'vitest';
import { COMPANY_PHONE } from '@/lib/company';
import { listingContact, normalizePhone, phoneLabel, waLink } from './contact';

describe('contact', () => {
  it('normalises Indian numbers and rejects the rest', () => {
    expect(normalizePhone('98765 43210')).toBe('+919876543210');
    expect(normalizePhone('+91 98765-43210')).toBe('+919876543210');
    expect(normalizePhone('09876543210')).toBe('+919876543210');
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });

  it('uses the agent, else the company, and never the owner', () => {
    const agent = { id: 1, name: 'Asha', contact_number: '9876543210', avatar_url: null };
    expect(listingContact({ agent })).toEqual({ name: 'Asha', phone: '+919876543210', avatar: null });
    expect(listingContact({ agent: null }).phone).toBe(COMPANY_PHONE);
    expect(listingContact({ agent: { ...agent, contact_number: 'n/a' } }).phone).toBe(COMPANY_PHONE);
    // A list item has no `agent`; `owner_contact` is never read.
    expect(listingContact({ owner_contact: '9000000000' } as Parameters<typeof listingContact>[0]).phone).toBe(COMPANY_PHONE);
  });

  it('builds a WhatsApp link and a readable label', () => {
    expect(waLink('+919876543210', 'Flat', 'https://x.test/p/1', 'en')).toMatch(/^https:\/\/wa\.me\/919876543210\?text=Hi%2C/);
    expect(phoneLabel('+919876543210')).toBe('+91 98765 43210');
  });
});

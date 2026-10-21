import { describe, expect, it } from 'vitest';
import { fold, icsText, visitIcs } from './ics';

const v = {
  id: 42,
  start: '2026-09-30T06:00:00.000Z', // 11:30 am in Asia/Kolkata
  booked: '2026-09-27T04:30:00Z',
  title: 'Spacious 3BHK; Builder Floor, Palam Vihar',
  address: 'House 12, Block C; Palam Vihar, Gurugram',
  url: 'https://360ghar.com/property/182',
};

describe('visitIcs', () => {
  const ics = visitIcs(v);

  it('uses CRLF line endings, with one at the end', () => {
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });

  it('writes UTC times with Z and a 1-hour length', () => {
    expect(ics).toContain('\r\nDTSTART:20260930T060000Z\r\n');
    expect(ics).toContain('\r\nDTEND:20260930T070000Z\r\n');
    expect(ics).toContain('\r\nDTSTAMP:20260927T043000Z\r\n');
  });

  it('has a stable UID from the visit id', () => {
    expect(ics).toContain('\r\nUID:visit-42@360ghar.com\r\n');
    expect(visitIcs(v)).toBe(ics);
  });

  it('escapes commas and semicolons in text', () => {
    expect(ics).toContain('SUMMARY:360Ghar visit: Spacious 3BHK\\; Builder Floor\\, Palam Vihar');
    expect(ics).toContain('LOCATION:House 12\\, Block C\\; Palam Vihar\\, Gurugram');
    expect(icsText('a\\b\nc')).toBe('a\\\\b\\nc');
  });

  it('leaves out LOCATION when there is no address', () => {
    expect(visitIcs({ ...v, address: null })).not.toContain('LOCATION:');
  });
});

describe('fold', () => {
  it('keeps every line at 75 octets or less, and unfolds to the original', () => {
    const long = `SUMMARY:${'घर '.repeat(40)}`;
    const folded = fold(long);
    for (const line of folded.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, '')).toBe(long);
  });
});

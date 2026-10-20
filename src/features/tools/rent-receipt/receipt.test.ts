import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { batch, batchNumber, formatDate, fyMonths, fyStart, monthPeriod, numberToWords, PAN_RE, panRequired, receiptBase, rupeesInWords, stampRequired, todayIso } from './receipt';

// The old bug showed in India (UTC+5:30): run these tests in that time zone.
const tz = process.env.TZ;
beforeAll(() => {
  process.env.TZ = 'Asia/Kolkata';
});
afterAll(() => {
  process.env.TZ = tz;
});

describe('dates', () => {
  it('keeps the local day just after midnight in IST', () => {
    const justAfterMidnight = new Date('2026-05-01T00:30:00+05:30');
    expect(justAfterMidnight.toISOString().slice(0, 10)).toBe('2026-04-30'); // the old, wrong way
    expect(todayIso(justAfterMidnight)).toBe('2026-05-01');
  });

  it('gives the first and last day of a month', () => {
    expect(monthPeriod(2026, 4)).toEqual({ start: '2026-04-01', end: '2026-04-30' });
    expect(monthPeriod(2028, 2)).toEqual({ start: '2028-02-01', end: '2028-02-29' });
    expect(monthPeriod(2027, 2).end).toBe('2027-02-28');
    expect(monthPeriod(2026, 12)).toEqual({ start: '2026-12-01', end: '2026-12-31' });
  });

  it('finds the financial year and its months', () => {
    expect(fyStart(new Date(2026, 2, 31))).toBe(2025);
    expect(fyStart(new Date(2026, 3, 1))).toBe(2026);
    const months = fyMonths(2026);
    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ y: 2026, m: 4 });
    expect(months[8]).toEqual({ y: 2026, m: 12 });
    expect(months[9]).toEqual({ y: 2027, m: 1 });
    expect(months[11]).toEqual({ y: 2027, m: 3 });
  });

  it('formats a date without a time zone shift', () => {
    expect(formatDate('2026-04-01')).toBe('01 April 2026');
    expect(formatDate('2027-03-31')).toBe('31 March 2027');
    expect(formatDate('')).toBe('');
  });
});

describe('numbers', () => {
  it('builds a receipt number and batch numbers', () => {
    expect(receiptBase(1_790_000_000_000)).toMatch(/^RR-[0-9A-Z]{5}$/);
    expect(batchNumber('RR-ABCDE', 0)).toBe('RR-ABCDE-01');
    expect(batchNumber('RR-ABCDE', 11)).toBe('RR-ABCDE-12');
  });

  it('makes 12 monthly receipts for April to March', () => {
    const b = batch('RR-ABCDE', 2026);
    expect(b).toHaveLength(12);
    expect(b[0]).toEqual({ number: 'RR-ABCDE-01', start: '2026-04-01', end: '2026-04-30', date: '2026-04-30' });
    expect(b[10]).toEqual({ number: 'RR-ABCDE-11', start: '2027-02-01', end: '2027-02-28', date: '2027-02-28' });
    expect(b[11]!.end).toBe('2027-03-31');
  });
});

describe('rules', () => {
  it('needs PAN only above ₹1 lakh a year', () => {
    expect(panRequired(8_333)).toBe(false);
    expect(panRequired(8_334)).toBe(true);
    expect(PAN_RE.test('ABCPG1234F')).toBe(true);
    expect(PAN_RE.test('ABCPG1234')).toBe(false);
    expect(PAN_RE.test('abcpg1234f')).toBe(false);
  });

  it('needs a revenue stamp only for cash above ₹5,000', () => {
    expect(stampRequired('cash', 5_000)).toBe(false);
    expect(stampRequired('cash', 5_001)).toBe(true);
    expect(stampRequired('upi', 50_000)).toBe(false);
  });
});

describe('amount in words', () => {
  it('uses the Indian system', () => {
    expect(numberToWords(0)).toBe('Zero');
    expect(numberToWords(15)).toBe('Fifteen');
    expect(numberToWords(40)).toBe('Forty');
    expect(numberToWords(105)).toBe('One Hundred and Five');
    expect(numberToWords(25_000)).toBe('Twenty Five Thousand');
    expect(numberToWords(1_00_000)).toBe('One Lakh');
    expect(numberToWords(12_34_567)).toBe('Twelve Lakh Thirty Four Thousand Five Hundred and Sixty Seven');
    expect(numberToWords(1_23_45_678)).toBe('One Crore Twenty Three Lakh Forty Five Thousand Six Hundred and Seventy Eight');
    expect(numberToWords(1234_00_00_000)).toBe('One Thousand Two Hundred and Thirty Four Crore');
  });

  it('writes rupees and paise', () => {
    expect(rupeesInWords(25_000)).toBe('Rupees Twenty Five Thousand Only');
    expect(rupeesInWords(18_500.5)).toBe('Rupees Eighteen Thousand Five Hundred and Fifty Paise Only');
    expect(rupeesInWords(0)).toBe('');
  });
});

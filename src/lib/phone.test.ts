import { describe, expect, it } from 'vitest';
import { EMAIL_RE, MOBILE_RE, normalizeMobile, tenDigits, toE164 } from './phone';

describe('normalizeMobile', () => {
  it('reduces typed numbers to 10 digits', () => {
    for (const v of ['9876543210', '98765 43210', '+91 98765-43210', '919876543210', '09876543210']) expect(normalizeMobile(v)).toBe('9876543210');
  });
  it('returns an empty string for anything else', () => {
    for (const v of ['', '12345', '5876543210', '98765432101', '+1 415 555 0100']) expect(normalizeMobile(v)).toBe('');
  });
});

describe('tenDigits', () => {
  it('does not check the first digit', () => {
    expect(tenDigits('12345 67890')).toBe('1234567890');
    expect(tenDigits('12345')).toBeNull();
    expect(tenDigits(null)).toBeNull();
  });
});

describe('toE164', () => {
  it('adds the country code', () => expect(toE164('9876543210')).toBe('+919876543210'));
});

describe('regexes', () => {
  it('match emails and mobiles', () => {
    expect(EMAIL_RE.test('a@b.co')).toBe(true);
    expect(EMAIL_RE.test('a@b')).toBe(false);
    expect(MOBILE_RE.test('6000000000')).toBe(true);
    expect(MOBILE_RE.test('5000000000')).toBe(false);
  });
});

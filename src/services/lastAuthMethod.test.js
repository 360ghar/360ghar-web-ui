import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTH_METHODS,
  clearLastAuthMethod,
  getLastAuthMethod,
  maskIdentifier,
  setLastAuthMethod,
} from './lastAuthMethod';

describe('lastAuthMethod', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('maskIdentifier', () => {
    it('masks an email keeping the first char + domain', () => {
      expect(maskIdentifier('john.doe@gmail.com')).toBe('j***@gmail.com');
    });

    it('masks a phone keeping the last 4 digits', () => {
      expect(maskIdentifier('+919876543210')).toBe('*****3210');
      expect(maskIdentifier('9876543210')).toBe('*****3210');
    });

    it('returns empty string for empty input', () => {
      expect(maskIdentifier('')).toBe('');
      expect(maskIdentifier(undefined)).toBe('');
    });
  });

  describe('set/get round-trip', () => {
    it('persists and reads back a valid method with masked hint', () => {
      setLastAuthMethod(AUTH_METHODS.PHONE_OTP, '9876543210');
      const stored = getLastAuthMethod();
      expect(stored).toMatchObject({
        method: 'phone_otp',
        identifierHint: '*****3210',
      });
      expect(typeof stored.ts).toBe('number');
    });

    it('records Google with no identifier', () => {
      setLastAuthMethod(AUTH_METHODS.GOOGLE);
      expect(getLastAuthMethod()).toMatchObject({ method: 'google', identifierHint: '' });
    });

    it('ignores invalid methods', () => {
      setLastAuthMethod('totally_invalid', 'x@y.com');
      expect(getLastAuthMethod()).toBeNull();
    });

    it('returns null when nothing is stored', () => {
      expect(getLastAuthMethod()).toBeNull();
    });

    it('clears the stored method', () => {
      setLastAuthMethod(AUTH_METHODS.EMAIL_PASSWORD, 'a@b.com');
      clearLastAuthMethod();
      expect(getLastAuthMethod()).toBeNull();
    });
  });
});

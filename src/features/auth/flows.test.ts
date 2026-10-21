import { describe, expect, it } from 'vitest';
import { dobProblem, parseIdentifier, passwordProblems, pathForStage, safeNext } from './flows';

describe('auth flows', () => {
  it('parses phone numbers and emails', () => {
    expect(parseIdentifier('98104 67231')).toEqual({ kind: 'phone', value: '9810467231', e164: '+919810467231' });
    expect(parseIdentifier('+91-9810467231')?.kind).toBe('phone');
    expect(parseIdentifier('09810467231')?.kind).toBe('phone');
    expect(parseIdentifier('919810467231')?.kind).toBe('phone');
    expect(parseIdentifier('5810467231')).toBeNull();
    expect(parseIdentifier('Asha@Example.com')).toEqual({ kind: 'email', value: 'asha@example.com' });
    expect(parseIdentifier('asha@')).toBeNull();
  });

  it('checks passwords', () => {
    expect(passwordProblems('abc')).toEqual(['length', 'upper', 'digit']);
    expect(passwordProblems('Gurgaon2026')).toEqual([]);
  });

  it('only allows same-site next paths', () => {
    expect(safeNext('https://evil.com', 'en')).toBe('/');
    expect(safeNext('//evil.com', 'en')).toBe('/');
    expect(safeNext('/profile-completion?next=/x', 'en')).toBe('/account');
    expect(safeNext('/property/12?x=1', 'en')).toBe('/property/12?x=1');
    expect(safeNext('/login', 'hi')).toBe('/hi/account');
    expect(safeNext(null, 'hi')).toBe('/hi');
  });

  it('routes by stage', () => {
    expect(pathForStage('profile_completion', '/account', 'en')).toBe('/profile-completion?next=%2Faccount');
    expect(pathForStage('active', '/account', 'en')).toBe('/account');
  });

  it('applies the backend age rule', () => {
    const today = new Date(2026, 8, 27);
    expect(dobProblem('2010-01-01', today)).toBe('young');
    expect(dobProblem('1990-05-10', today)).toBeNull();
    expect(dobProblem('1890-05-10', today)).toBe('old');
    expect(dobProblem('', today)).toBe('required');
  });
});

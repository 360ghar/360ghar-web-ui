import { afterEach, describe, expect, it } from 'vitest';
import { PROFILE_NAME_KEY, peekStoredUser } from './supabase';

const store = new Map<string, string>();
const ls = {
  get length() {
    return store.size;
  },
  key: (i: number) => [...store.keys()][i] ?? null,
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};
Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true });

const session = (id: string) => JSON.stringify({ refresh_token: 'r', user: { id, email: 'a@b.co', user_metadata: { full_name: 'Sign Up Name' } } });

describe('peekStoredUser (header name)', () => {
  afterEach(() => store.clear());

  it('uses the sign-up name when no profile name is known', () => {
    store.set('sb-x-auth-token', session('u1'));
    expect(peekStoredUser()).toEqual({ name: 'Sign Up Name', email: 'a@b.co' });
  });

  it('prefers the profile name of the same user', () => {
    store.set('sb-x-auth-token', session('u1'));
    store.set(PROFILE_NAME_KEY, JSON.stringify({ uid: 'u1', name: 'Asha Verma' }));
    expect(peekStoredUser()?.name).toBe('Asha Verma');
  });

  it('ignores a profile name left by another user', () => {
    store.set('sb-x-auth-token', session('u2'));
    store.set(PROFILE_NAME_KEY, JSON.stringify({ uid: 'u1', name: 'Asha Verma' }));
    expect(peekStoredUser()?.name).toBe('Sign Up Name');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const ensureSupabaseClient = vi.fn();
const apiGet = vi.fn();

vi.mock('./supabaseClient', () => ({ ensureSupabaseClient, setCachedAccessToken: vi.fn() }));
vi.mock('./api', () => ({
  default: { get: apiGet },
  publicApi: {},
}));
vi.mock('./http', () => ({
  SKIP_AUTH_RETRY: Symbol.for('http.skipAuthRetry'),
}));
vi.mock('./lastAuthMethod', () => ({
  setLastAuthMethod: vi.fn(),
  AUTH_METHODS: {
    EMAIL_PASSWORD: 'email_password',
    PHONE_PASSWORD: 'phone_password',
    GOOGLE: 'google',
    EMAIL_OTP: 'email_otp',
    PHONE_OTP: 'phone_otp',
  },
}));

async function loadAuthService() {
  const module = await import('./authService');
  return module.authService;
}

const SESSION = {
  access_token: 'tok',
  refresh_token: 'r',
  expires_in: 3600,
  token_type: 'bearer',
};
const fakeClient = () => ({
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: SESSION }, error: null }),
  },
});

describe('authService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns only the session fields and does NOT fetch the profile', async () => {
    ensureSupabaseClient.mockResolvedValue(fakeClient());

    const authService = await loadAuthService();
    const result = await authService.login('9999999999', 'password');

    // login() returns the raw Supabase session only. The backend profile is
    // fetched exactly once by the auth store (syncUserProfile), not here — so
    // login no longer returns a `user` key and never calls /users/profile/.
    expect(result).toEqual({
      access_token: 'tok',
      refresh_token: 'r',
      expires_in: 3600,
      token_type: 'bearer',
    });
    expect(apiGet).not.toHaveBeenCalled();
  });

  it('throws when Supabase sign-in fails', async () => {
    ensureSupabaseClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi
          .fn()
          .mockResolvedValue({ data: { session: null }, error: { message: 'Invalid login credentials' } }),
      },
    });

    const authService = await loadAuthService();
    await expect(authService.login('9999999999', 'wrong')).rejects.toThrow(/invalid login credentials/i);
    expect(apiGet).not.toHaveBeenCalled();
  });
});

describe('authService.signInWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('strips a leading www. from the redirect origin so it matches the non-www allowlist', async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ data: { url: 'ok' }, error: null });
    ensureSupabaseClient.mockResolvedValue({ auth: { signInWithOAuth } });
    // Simulate a visitor on https://www.360ghar.com.
    const original = window.location.origin;
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://www.360ghar.com' },
      configurable: true,
    });

    const authService = await loadAuthService();
    await authService.signInWithGoogle('/');

    const redirectTo = signInWithOAuth.mock.calls[0][0].options.redirectTo;
    // www. is stripped; the next param is preserved.
    expect(redirectTo.startsWith('https://360ghar.com/auth/callback')).toBe(true);
    expect(redirectTo).not.toContain('www.');

    Object.defineProperty(window, 'location', {
      value: { origin: original },
      configurable: true,
    });
  });

  it('appends an allowlist hint to a redirect/uri mismatch error', async () => {
    const signInWithOAuth = vi
      .fn()
      .mockResolvedValue({ data: { url: null }, error: { message: 'redirect_uri_mismatch' } });
    ensureSupabaseClient.mockResolvedValue({ auth: { signInWithOAuth } });

    const authService = await loadAuthService();
    await expect(authService.signInWithGoogle('/')).rejects.toThrow(/allowlisted/i);
  });
});

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

  it('returns user: null (does not throw) when the profile is missing (401)', async () => {
    ensureSupabaseClient.mockResolvedValue(fakeClient());
    apiGet.mockRejectedValue({ response: { status: 401 } });

    const authService = await loadAuthService();
    const result = await authService.login('9999999999', 'password');

    expect(result).toMatchObject({ access_token: 'tok', user: null });
  });

  it('returns user: null when the profile is missing (404)', async () => {
    ensureSupabaseClient.mockResolvedValue(fakeClient());
    apiGet.mockRejectedValue({ response: { status: 404 } });

    const authService = await loadAuthService();
    const result = await authService.login('9999999999', 'password');

    expect(result).toMatchObject({ access_token: 'tok', user: null });
  });

  it('returns the profile when it exists', async () => {
    ensureSupabaseClient.mockResolvedValue(fakeClient());
    apiGet.mockResolvedValue({ data: { id: 'u1', phone: '+919999999999' } });

    const authService = await loadAuthService();
    const result = await authService.login('9999999999', 'password');

    expect(result).toMatchObject({ access_token: 'tok', user: { id: 'u1' } });
  });

  it('still throws on a genuine (non-401/404) profile error', async () => {
    ensureSupabaseClient.mockResolvedValue(fakeClient());
    apiGet.mockRejectedValue({ response: { status: 500 } });

    const authService = await loadAuthService();
    await expect(authService.login('9999999999', 'password')).rejects.toBeDefined();
  });

  it('passes skipAuthRetry + a shorter timeout to the profile fetch (fresh token)', async () => {
    ensureSupabaseClient.mockResolvedValue(fakeClient());
    apiGet.mockResolvedValue({ data: { id: 'u1' } });

    const authService = await loadAuthService();
    await authService.login('9999999999', 'password');

    const config = apiGet.mock.calls[0][1] || {};
    expect(config.timeout).toBe(10000);
    // skipAuthRetry flag is a Symbol-keyed property.
    const sym = Object.getOwnPropertySymbols(config).find(
      (s) => String(s) === 'Symbol(http.skipAuthRetry)'
    );
    expect(sym && config[sym]).toBe(true);
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

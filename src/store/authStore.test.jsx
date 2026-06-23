import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCurrentUser = vi.fn();
const login = vi.fn();
const logout = vi.fn();
const getSupabaseAccessToken = vi.fn();
const onSupabaseAuthStateChange = vi.fn();
const fetchAuthStage = vi.fn();

vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser,
    login,
    logout,
  },
}));

vi.mock('../services/supabaseClient', () => ({
  getSupabaseAccessToken,
  onSupabaseAuthStateChange,
  setCachedAccessToken: vi.fn(),
}));

vi.mock('../services/http', () => ({
  SKIP_AUTH_RETRY: Symbol.for('http.skipAuthRetry'),
  // api.js calls createAxiosInstance at import time; return a no-op instance.
  createAxiosInstance: () => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }),
}));

vi.mock('../utils/authStage', () => ({
  fetchAuthStage,
}));

async function loadAuthStore() {
  const module = await import('./authStore');
  return module.default;
}

describe('authStore initializeAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    fetchAuthStage.mockResolvedValue('active');
  });

  it('dedupes the immediate initial-session profile sync', async () => {
    const session = { access_token: 'token-123' };

    getCurrentUser.mockResolvedValue({ id: 'user-1', full_name: 'Test User' });
    getSupabaseAccessToken.mockResolvedValue(session.access_token);
    onSupabaseAuthStateChange.mockImplementation(async (callback) => {
      await callback('INITIAL_SESSION', session);
      return { unsubscribe: vi.fn() };
    });

    const useAuthStore = await loadAuthStore();

    await act(async () => {
      await useAuthStore.getState().initializeAuth();
    });

    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({
      token: session.access_token,
      isAuthenticated: true,
      user: { id: 'user-1', full_name: 'Test User' },
      isInitializing: false,
    });
  });

  it('clears the initialization guard when subscription setup fails', async () => {
    const setupError = new Error('subscription failed');

    onSupabaseAuthStateChange
      .mockRejectedValueOnce(setupError)
      .mockResolvedValueOnce({ unsubscribe: vi.fn() });
    getSupabaseAccessToken.mockResolvedValue(null);

    const useAuthStore = await loadAuthStore();

    await expect(useAuthStore.getState().initializeAuth()).rejects.toThrow(setupError);

    await act(async () => {
      await useAuthStore.getState().initializeAuth();
    });

    expect(onSupabaseAuthStateChange).toHaveBeenCalledTimes(2);
    expect(getSupabaseAccessToken).toHaveBeenCalledTimes(1);
  });

  it('does not refetch the profile on TOKEN_REFRESHED even when the profile is missing (loop fix)', async () => {
    // Profile fetch fails → `user` stays null. Under the OLD code, every
    // TOKEN_REFRESHED re-ran syncUserProfile because the guard only skipped
    // when `user` was already loaded — an infinite refresh↔fetch loop.
    const session = { access_token: 'token-1' };
    getCurrentUser.mockRejectedValue({ response: { status: 401 } });
    getSupabaseAccessToken.mockResolvedValue(session.access_token);

    let stateCallback;
    onSupabaseAuthStateChange.mockImplementation(async (callback) => {
      stateCallback = callback;
      return { unsubscribe: vi.fn() };
    });

    const useAuthStore = await loadAuthStore();
    await act(async () => {
      await useAuthStore.getState().initializeAuth();
    });

    // One fetch from the explicit init sync (it failed, so user is null).
    expect(getCurrentUser).toHaveBeenCalledTimes(1);

    await act(async () => {
      // These must NOT trigger another profile fetch.
      await stateCallback('TOKEN_REFRESHED', { access_token: 'token-2' });
      await stateCallback('TOKEN_REFRESHED', { access_token: 'token-3' });
      // SIGNED_IN still legitimately refetches (a real sign-in).
      await stateCallback('SIGNED_IN', { access_token: 'token-4' });
    });

    // init sync (1) + SIGNED_IN (1) = 2. The two TOKEN_REFRESHED events add none.
    expect(getCurrentUser).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().token).toBe('token-4');
  });

  it('routes a missing backend profile to profile_completion without logging out', async () => {
    const session = { access_token: 'token-1' };
    getCurrentUser.mockRejectedValue({ response: { status: 404 } });
    getSupabaseAccessToken.mockResolvedValue(session.access_token);
    onSupabaseAuthStateChange.mockImplementation(async () => ({
      unsubscribe: vi.fn(),
    }));

    const useAuthStore = await loadAuthStore();
    await act(async () => {
      await useAuthStore.getState().initializeAuth();
    });

    expect(logout).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      authStage: 'profile_completion',
      isInitializing: false,
      user: null,
    });
  });
});

describe('authStore login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    fetchAuthStage.mockResolvedValue('active');
  });

  it('succeeds and routes to profile_completion when the backend profile is missing', async () => {
    // authService.login authenticated at Supabase but the profile fetch missed
    // (401/404) → it returns user: null instead of throwing. syncUserProfile's
    // own getCurrentUser also 401s (no profile row), which sets
    // profile_completion; the login() override reinforces it from data.user.
    login.mockResolvedValue({ access_token: 'token-9', user: null });
    getCurrentUser.mockRejectedValue({ response: { status: 401 } });
    getSupabaseAccessToken.mockResolvedValue('token-9');
    onSupabaseAuthStateChange.mockImplementation(async () => ({
      unsubscribe: vi.fn(),
    }));

    const useAuthStore = await loadAuthStore();
    let result;
    await act(async () => {
      result = await useAuthStore.getState().login('9999999999', 'password');
    });

    expect(result).toBe(true);
    expect(logout).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      authStage: 'profile_completion',
      isLoading: false,
      isInitializing: false,
    });
  });
});

import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCurrentUser = vi.fn();
const logout = vi.fn();
const getSupabaseAccessToken = vi.fn();
const onSupabaseAuthStateChange = vi.fn();

vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser,
    logout,
  },
}));

vi.mock('../services/supabaseClient', () => ({
  getSupabaseAccessToken,
  onSupabaseAuthStateChange,
}));

async function loadAuthStore() {
  const module = await import('./authStore');
  return module.default;
}

describe('authStore initializeAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
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
});

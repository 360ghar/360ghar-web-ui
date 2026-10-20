import { useEffect } from 'react';
import { initAuth, useAuthStore } from './store';

type AuthState = ReturnType<typeof useAuthStore.getState>;

/** Starts auth on first use and returns the shared auth state (or a slice of it, with a selector). */
export function useAuth(): AuthState;
export function useAuth<T>(selector: (s: AuthState) => T): T;
export function useAuth<T>(selector?: (s: AuthState) => T) {
  useEffect(() => {
    void initAuth();
  }, []);
  return useAuthStore(selector as (s: AuthState) => T);
}

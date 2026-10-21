/**
 * TanStack Query. In the browser there is one client for the whole page:
 * islands are separate React roots but import this module once, so they share
 * the cache (a favourite saved in one island shows in every other island).
 * On the server every render gets its own client, so nothing leaks between
 * requests or users.
 */
import { QueryClient, QueryClientProvider, type QueryClientConfig } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api/errors';

const config: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      // The fetch layer already retries network and 5xx errors twice.
      retry: (count, error) => error instanceof ApiError && error.retryable && count < 1,
    },
    mutations: { retry: false },
  },
};

const isServer = typeof window === 'undefined';

/** Browser-wide client. Do not use it on the server. */
const queryClient = isServer ? (null as unknown as QueryClient) : new QueryClient(config);

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => (isServer ? new QueryClient(config) : queryClient));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

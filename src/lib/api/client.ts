/**
 * Typed API client (openapi-fetch over the generated schema).
 *
 * - Server (Astro pages): absolute API origin, no auth, short timeout so a
 *   down backend gives an error state instead of a hung page.
 * - Browser (islands): calls the API origin directly in production (CORS allows
 *   https://360ghar.com, preflight cached 24 h). In dev and deploy previews set
 *   PUBLIC_API_BASE="" to use the same-origin /api/v1 proxy (Vite or Netlify).
 *   Adds the Supabase bearer token when an auth provider is registered.
 * - GET requests retry twice on network errors, 429 and 502/503/504.
 * - A 401 on an authenticated request refreshes the session once and retries.
 * - `call()` returns the data or throws a typed ApiError.
 * - Long requests: spread `timeoutMs(ms)` into the call options (default 15 s in
 *   the browser). Uploads: `multipart(formData)`. Images and files: `parseAs: 'blob'`.
 */
import createClient from 'openapi-fetch';
import { ApiError, networkError, toApiError } from './errors';
import type { paths } from './schema';

const isServer = typeof window === 'undefined';
const SERVER_ORIGIN = (import.meta.env.API_ORIGIN as string | undefined) ?? 'https://api.360ghar.com';
const BROWSER_BASE =
  (import.meta.env.PUBLIC_API_BASE as string | undefined) ?? (import.meta.env.DEV ? '' : 'https://api.360ghar.com');

type AuthProvider = {
  token: () => Promise<string | null>;
  /** Refreshes the session. Returns the new token, or null when the session is gone. */
  refresh: () => Promise<string | null>;
};

let auth: AuthProvider | null = null;

/** Called by the auth module. The API layer does not import Supabase itself. */
export function setAuthProvider(provider: AuthProvider | null) {
  auth = provider;
}

const RETRY_STATUS = new Set([429, 502, 503, 504]);
/** A `Retry-After` above this (seconds) is past the retry budget: the caller gets the 429 or 503 and `ApiError.retryAfter`. */
const MAX_RETRY_WAIT_S = 5;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const backoff = (attempt: number) => 400 * 2 ** attempt + Math.random() * 200;

function withTimeout(signal: AbortSignal | null, ms: number): AbortSignal {
  const timeout = AbortSignal.timeout(ms);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function send(request: Request, timeoutMs: number): Promise<Response> {
  const method = request.method.toUpperCase();
  const retries = method === 'GET' ? 2 : 0;
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(request.clone(), { signal: withTimeout(request.signal, timeoutMs) });
      if (attempt < retries && RETRY_STATUS.has(response.status)) {
        const after = Number(response.headers.get('retry-after'));
        // The server said to wait longer than a retry can: a retry now only hits the limit again.
        if (after > MAX_RETRY_WAIT_S) return response;
        await sleep(after > 0 ? after * 1000 : backoff(attempt));
        continue;
      }
      return response;
    } catch (error) {
      if (request.signal?.aborted) throw error;
      if (attempt >= retries) throw networkError(error);
      await sleep(backoff(attempt));
    }
  }
}

const DEFAULT_TIMEOUT_MS = isServer ? 6_000 : 15_000;

let noStoreSeen = false;
/**
 * True once a response on this page said `Cache-Control: no-store` (the backend sends it on signed-in
 * responses). Data of such a response is not written to browser storage.
 */
export const sawNoStore = () => noStoreSeen;

/**
 * Sends a request with the bearer token, the 401 refresh-and-retry and a timeout.
 * Use it for raw calls the typed client cannot make (the SSE chat stream).
 */
export async function authedFetch(input: Request, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const response = await authedSend(input, timeoutMs);
  if (!isServer && /no-store/i.test(response.headers.get('cache-control') ?? '')) noStoreSeen = true;
  return response;
}

async function authedSend(input: Request, timeoutMs: number): Promise<Response> {
  let request = input;
  let token: string | null = null;
  if (!isServer && auth && !request.headers.has('authorization')) {
    token = await auth.token();
    if (token) {
      // Clone first: building a Request from `input` consumes its body, and a 401 retry needs it.
      request = new Request(input.clone(), { headers: new Headers(input.headers) });
      request.headers.set('authorization', `Bearer ${token}`);
    }
  }
  const response = await send(request, timeoutMs);
  if (response.status === 401 && token && auth) {
    const fresh = await auth.refresh();
    if (fresh) {
      const retry = new Request(input, { headers: new Headers(input.headers) });
      retry.headers.set('authorization', `Bearer ${fresh}`);
      return send(retry, timeoutMs);
    }
  }
  return response;
}

export const api = createClient<paths>({
  baseUrl: isServer ? SERVER_ORIGIN : BROWSER_BASE,
  fetch: (request) => authedFetch(request),
});

/** Per-request timeout for `api` calls: `api.POST(path, { ...timeoutMs(180_000) })`. Auth and retries stay the same. */
export const timeoutMs = (ms: number) => ({ fetch: (request: Request) => authedFetch(request, ms) });

/** Timeout for photo and file uploads (browser default is 15 s). */
export const UPLOAD_TIMEOUT_MS = 120_000;

/** Multipart mode: the schema types binary fields as `string`, so the FormData needs a cast. */
export const multipart = (form: FormData) => ({ body: form as never });

/** Absolute or same-origin URL for a raw fetch (streams, uploads). */
export function apiUrl(path: string): string {
  return `${isServer ? SERVER_ORIGIN : BROWSER_BASE}${path}`;
}

/** The current bearer token, if signed in (for raw fetches). */
export async function currentToken(): Promise<string | null> {
  return auth ? auth.token() : null;
}

type Result<T> = { data?: T; error?: unknown; response: Response };

/** Awaits an openapi-fetch call. Returns the data or throws ApiError. */
export async function call<T>(promise: Promise<Result<T>>): Promise<T> {
  let result: Result<T>;
  try {
    result = await promise;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw networkError(error);
  }
  const { data, error, response } = result;
  if (!response.ok || error !== undefined) throw await toApiError(response, error);
  return data as T;
}

/**
 * For server pages: returns the data, or null plus the error, so the page can
 * render an error state (and pick a status code) instead of throwing.
 */
export async function attempt<T>(promise: Promise<Result<T>>): Promise<{ data: T; error: null } | { data: null; error: ApiError }> {
  try {
    return { data: await call(promise), error: null };
  } catch (error) {
    return { data: null, error: error instanceof ApiError ? error : networkError(error) };
  }
}

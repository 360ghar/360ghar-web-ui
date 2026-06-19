import axios from 'axios';
import { getSupabaseAccessToken, refreshSupabaseSession } from './supabaseClient';
import { shouldShortCircuitDataFetch } from '../utils/prerender';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1'];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_STATUS_CODES = [408, 429, 502, 503, 504];

// Determine if a given host (or URL) is localhost
export const isLocalhost = (hostOrUrl) => {
  if (!hostOrUrl) return false;
  try {
    const hostname = hostOrUrl.includes('://')
      ? new URL(hostOrUrl).hostname
      : hostOrUrl;
    return LOCAL_HOSTNAMES.includes(hostname);
  } catch {
    return false;
  }
};

// Ensure HTTPS for non-localhost absolute URLs
export const enforceHttpsExceptLocal = (absoluteUrl) => {
  if (!absoluteUrl || typeof absoluteUrl !== 'string') return absoluteUrl;
  if (!absoluteUrl.startsWith('http://')) return absoluteUrl;
  try {
    const parsed = new URL(absoluteUrl);
    if (isLocalhost(parsed.hostname)) return absoluteUrl;
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    // If it's not a valid absolute URL, leave as-is
    return absoluteUrl;
  }
};

// Get API base URL - use /api to leverage Vite/Netlify proxy (no CORS, no preflight)
export const getApiBaseUrl = () => {
  // Prefer explicit env var when configured, otherwise use /api proxy.
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

// Retry helper function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Prerender short-circuit ──────────────────────────────────────────────────
// During prerender (local build / Netlify preview build), every axios call is
// resolved locally with an empty payload so neither the backend API nor
// Supabase receives traffic. Live users never see this because the
// short-circuit is AND-gated with the runtime `isPrerendering()` window flag
// (set only by the Puppeteer capture script).
const SHORT_CIRCUIT_LOGGED = new Set();
const logShortCircuitOnce = (config) => {
  const key = `${(config.method || 'get').toUpperCase()} ${config.url || ''}`;
  if (SHORT_CIRCUIT_LOGGED.has(key)) return;
  SHORT_CIRCUIT_LOGGED.add(key);
  console.log(`[prerender:short-circuit] ${key}`);
};

const buildEmptyPrerenderBody = (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (method === 'get' || method === 'delete' || method === 'head') {
    // Matches the cursor-paginated envelope the API normally returns for list
    // endpoints. Components already handle empty `items` gracefully.
    return { items: [], next_cursor: null, has_more: false, limit: 0 };
  }
  return {};
};

const prerenderShortCircuitAdapter = (fallbackAdapter) => (config) => {
  if (!shouldShortCircuitDataFetch()) {
    return fallbackAdapter(config);
  }
  logShortCircuitOnce(config);
  return Promise.resolve({
    data: buildEmptyPrerenderBody(config),
    status: 200,
    statusText: 'OK (prerender short-circuit)',
    headers: {},
    config,
    request: {},
  });
};

const resolveFallbackAdapter = () => {
  if (typeof axios.getAdapter === 'function') {
    return axios.getAdapter(axios.defaults.adapter);
  }
  // Older axios versions (<1.6) expose adapters on defaults; fall through
  // to the xhr adapter if nothing else is wired up.
  return axios.defaults.adapter;
};

// Create a configured axios instance
export const createAxiosInstance = ({ withAuth = false, enableRetry = true } = {}) => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  });

  // Wrap the request adapter so prerender captures never hit the network.
  // The wrapper forwards to the real adapter verbatim for live traffic.
  instance.defaults.adapter = prerenderShortCircuitAdapter(resolveFallbackAdapter());

  // Request interceptor: enforce HTTPS (non-local) and attach auth when needed
  instance.interceptors.request.use(
    async (config) => {
      if (config.baseURL && typeof config.baseURL === 'string') {
        config.baseURL = enforceHttpsExceptLocal(config.baseURL);
      }
      if (config.url && typeof config.url === 'string' && config.url.startsWith('http://')) {
        config.url = enforceHttpsExceptLocal(config.url);
      }

      if (withAuth) {
        const token = await getSupabaseAccessToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle retries and common errors
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;

      // Retry logic for failed GET requests.
      // CRITICAL FIX (audit 5.2): the retry counter previously lived on the
      // shared `config` object, which axios may reuse across requests via
      // interceptors, leaking the count between unrelated requests. We key
      // the counter on a per-request Symbol so it can never collide, and we
      // clone the config before retrying so no other interceptor state is
      // mutated.
      const RETRY_KEY = Symbol.for('http.retryCount');

      if (
        enableRetry &&
        config &&
        config.method?.toLowerCase() === 'get' &&
        RETRY_STATUS_CODES.includes(error.response?.status)
      ) {
        const current = config[RETRY_KEY] || 0;
        if (current < MAX_RETRIES) {
          const retryConfig = { ...config, [RETRY_KEY]: current + 1 };
          await sleep(RETRY_DELAY * (current + 1));
          return instance(retryConfig);
        }
      }

      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        if (withAuth && config && !config[Symbol.for('http.authRetry')]) {
          const retryConfig = {
            ...config,
            [Symbol.for('http.authRetry')]: true,
          };
          const refreshedSession = await refreshSupabaseSession();
          if (refreshedSession?.access_token) {
            retryConfig.headers = retryConfig.headers || {};
            retryConfig.headers.Authorization = `Bearer ${refreshedSession.access_token}`;
            return instance(retryConfig);
          }
        }

        // Check if this is a public endpoint (property viewing)
        const publicEndpoints = ['/properties/?', '/properties/', '/properties/recommendations/'];
        const isPublicEndpoint = publicEndpoints.some(endpoint =>
          error.config?.url?.includes(endpoint)
        );

        // Let route guards and calling components handle re-authentication.
        if (!isPublicEndpoint && error.config?.headers?.Authorization) {
          localStorage.removeItem('user');
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default createAxiosInstance;

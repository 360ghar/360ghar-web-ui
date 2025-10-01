import axios from 'axios';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1'];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

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

// Get API base URL with HTTPS enforced except on localhost
export const getApiBaseUrl = () => {
  // Use direct access so Vite inlines correctly at build time
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // Prefer environment variable when available
  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      if (isLocalhost(parsed.hostname)) return envUrl;
      if (parsed.protocol === 'http:') {
        parsed.protocol = 'https:';
        return parsed.toString();
      }
      return envUrl;
    } catch {
      // Non-absolute or invalid URL; return as-is
      return envUrl;
    }
  }

  // Fallback to hosted API with HTTPS
  return 'https://api.360ghar.com/api/v1';
};

// Retry helper function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create a configured axios instance
export const createAxiosInstance = ({ withAuth = false, enableRetry = true } = {}) => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  });

  // Request interceptor: enforce HTTPS (non-local) and attach auth when needed
  instance.interceptors.request.use(
    (config) => {
      if (config.baseURL && typeof config.baseURL === 'string') {
        config.baseURL = enforceHttpsExceptLocal(config.baseURL);
      }
      if (config.url && typeof config.url === 'string' && config.url.startsWith('http://')) {
        config.url = enforceHttpsExceptLocal(config.url);
      }

      if (withAuth) {
        const token = localStorage.getItem('token');
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

      // Retry logic for failed requests
      if (enableRetry &&
          config &&
          !config._retryCount &&
          RETRY_STATUS_CODES.includes(error.response?.status) &&
          config.method?.toLowerCase() === 'get') {

        config._retryCount = 0;
      }

      if (enableRetry &&
          config &&
          config._retryCount < MAX_RETRIES &&
          RETRY_STATUS_CODES.includes(error.response?.status) &&
          config.method?.toLowerCase() === 'get') {

        config._retryCount += 1;
        await sleep(RETRY_DELAY * config._retryCount);
        return instance(config);
      }

      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        // Check if this is a public endpoint (property viewing)
        const publicEndpoints = ['/properties/?', '/properties/', '/properties/recommendations/'];
        const isPublicEndpoint = publicEndpoints.some(endpoint =>
          error.config?.url?.includes(endpoint)
        );

        // Only redirect to login if it's not a public endpoint and user was actually logged in
        if (!isPublicEndpoint && localStorage.getItem('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default createAxiosInstance;

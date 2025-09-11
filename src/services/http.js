import axios from 'axios';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1'];

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
  return 'https://360ghar.up.railway.app/api/v1';
};

// Create a configured axios instance
export const createAxiosInstance = ({ withAuth = false } = {}) => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
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

  return instance;
};

export default createAxiosInstance;

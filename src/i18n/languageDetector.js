/**
 * Custom i18next language detector that reads language from the URL path.
 * /hi/* → 'hi', everything else → 'en'
 */
const URL_PATH_DETECTOR = {
  name: 'urlPath',

  lookup() {
    if (typeof window === 'undefined') return 'en';
    const path = window.location.pathname;
    // Match /hi/ prefix or exact /hi
    if (path === '/hi' || path.startsWith('/hi/')) {
      return 'hi';
    }
    return 'en';
  },

  cacheUserLanguage(lng) {
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch {
      // localStorage unavailable (SSR, privacy mode)
    }
  },
};

export default URL_PATH_DETECTOR;

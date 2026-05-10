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

  // No cacheUserLanguage — the URL path is the sole source of truth for locale
  // detection. This ensures SEO-correct canonical URLs and avoids localStorage
  // diverging from the actual detected language.
};

export default URL_PATH_DETECTOR;

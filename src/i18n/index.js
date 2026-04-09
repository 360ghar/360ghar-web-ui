import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import urlPathDetector from './languageDetector';

// All namespace names
const namespaces = [
  'common',
  'home',
  'properties',
  'projects',
  'tools',
  'data-hub',
  'account',
  'seo',
  'forms',
  'landing',
  'compare',
  'truth',
  'policies',
  'blog',
];

// Statically import English translations so they're bundled at build time
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enProperties from './locales/en/properties.json';
import enProjects from './locales/en/projects.json';
import enTools from './locales/en/tools.json';
import enDataHub from './locales/en/data-hub.json';
import enAccount from './locales/en/account.json';
import enSeo from './locales/en/seo.json';
import enForms from './locales/en/forms.json';
import enLanding from './locales/en/landing.json';
import enCompare from './locales/en/compare.json';
import enTruth from './locales/en/truth.json';
import enPolicies from './locales/en/policies.json';
import enBlog from './locales/en/blog.json';

const enResources = {
  common: enCommon,
  home: enHome,
  properties: enProperties,
  projects: enProjects,
  tools: enTools,
  'data-hub': enDataHub,
  account: enAccount,
  seo: enSeo,
  forms: enForms,
  landing: enLanding,
  compare: enCompare,
  truth: enTruth,
  policies: enPolicies,
  blog: enBlog,
};

// Map of lazy-loaded Hindi translation modules
const hiLoaders = {
  common: () => import('./locales/hi/common.json'),
  home: () => import('./locales/hi/home.json'),
  properties: () => import('./locales/hi/properties.json'),
  projects: () => import('./locales/hi/projects.json'),
  tools: () => import('./locales/hi/tools.json'),
  'data-hub': () => import('./locales/hi/data-hub.json'),
  account: () => import('./locales/hi/account.json'),
  seo: () => import('./locales/hi/seo.json'),
  forms: () => import('./locales/hi/forms.json'),
  landing: () => import('./locales/hi/landing.json'),
  compare: () => import('./locales/hi/compare.json'),
  truth: () => import('./locales/hi/truth.json'),
  policies: () => import('./locales/hi/policies.json'),
  blog: () => import('./locales/hi/blog.json'),
};

// Cache for loaded Hindi translations
const hiCache = {};

/**
 * Load a Hindi namespace on demand via dynamic import().
 * Vite splits each JSON into its own chunk for lazy loading.
 */
async function loadHindiNamespace(ns) {
  if (hiCache[ns]) return hiCache[ns];
  const loader = hiLoaders[ns];
  if (!loader) return {};
  const mod = await loader();
  hiCache[ns] = mod.default || mod;
  return hiCache[ns];
}

i18n
  .use({
    type: 'languageDetector',
    async: false,
    init: () => {},
    detect: urlPathDetector.lookup,
    cacheUserLanguage: urlPathDetector.cacheUserLanguage,
  })
  .use({
    type: 'backend',
    init: () => {},
    read: async (language, namespace, callback) => {
      if (language === 'en') {
        // English is bundled statically — should already be in resources
        return callback(null, {});
      }
      if (language === 'hi') {
        try {
          const data = await loadHindiNamespace(namespace);
          return callback(null, data);
        } catch (err) {
          return callback(err, null);
        }
      }
      return callback(null, {});
    },
  })
  .use(initReactI18next)
  .init({
    resources: {
      en: enResources,
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    ns: namespaces,
    defaultNS: 'common',

    load: 'currentOnly',

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },

    // Dev mode: log missing keys
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => {
      console.warn(`[i18n] Missing key: ${ns}:${key} for [${lngs.join(', ')}]`);
    },
  });

export default i18n;

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

// Statically import English translations
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

// Statically import Hindi translations so crawlers see Hindi content on /hi/* pages
import hiCommon from './locales/hi/common.json';
import hiHome from './locales/hi/home.json';
import hiProperties from './locales/hi/properties.json';
import hiProjects from './locales/hi/projects.json';
import hiTools from './locales/hi/tools.json';
import hiDataHub from './locales/hi/data-hub.json';
import hiAccount from './locales/hi/account.json';
import hiSeo from './locales/hi/seo.json';
import hiForms from './locales/hi/forms.json';
import hiLanding from './locales/hi/landing.json';
import hiCompare from './locales/hi/compare.json';
import hiTruth from './locales/hi/truth.json';
import hiPolicies from './locales/hi/policies.json';
import hiBlog from './locales/hi/blog.json';

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

const hiResources = {
  common: hiCommon,
  home: hiHome,
  properties: hiProperties,
  projects: hiProjects,
  tools: hiTools,
  'data-hub': hiDataHub,
  account: hiAccount,
  seo: hiSeo,
  forms: hiForms,
  landing: hiLanding,
  compare: hiCompare,
  truth: hiTruth,
  policies: hiPolicies,
  blog: hiBlog,
};

i18n
  .use({
    type: 'languageDetector',
    async: false,
    init: () => {},
    detect: urlPathDetector.lookup,
    cacheUserLanguage: urlPathDetector.cacheUserLanguage,
  })
  .use(initReactI18next)
  .init({
    resources: {
      en: enResources,
      hi: hiResources,
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

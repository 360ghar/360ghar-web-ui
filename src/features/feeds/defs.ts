/** The three RSS feeds: title and description per language. /rss.xml lists them, /rss/[feed].xml serves them. */
export const FEED_DEFS = {
  blog: {
    en: ['360Ghar Blog', 'Real estate guides, buying tips, locality deep-dives, and market updates from 360Ghar'],
    hi: ['360Ghar ब्लॉग', '360Ghar से रियल एस्टेट गाइड, खरीद टिप्स, लोकैलिटी गाइड और बाज़ार अपडेट'],
  },
  properties: {
    en: ['360Ghar Properties', 'Latest verified property listings in Gurugram and Delhi NCR from 360Ghar'],
    hi: ['360Ghar प्रॉपर्टी', 'गुरुग्राम और दिल्ली NCR में 360Ghar से नवीनतम वेरिफाइड प्रॉपर्टी लिस्टिंग'],
  },
  localities: {
    en: ['360Ghar Localities', 'Locality guides and neighbourhood intelligence for Gurugram and Delhi NCR'],
    hi: ['360Ghar लोकैलिटी', 'गुरुग्राम और दिल्ली NCR के लिए लोकैलिटी गाइड और पड़ोस इंटेलिजेंस'],
  },
} as const satisfies Record<string, { en: readonly [string, string]; hi: readonly [string, string] }>;

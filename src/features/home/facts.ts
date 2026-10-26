import type { Locale } from '@/lib/i18n/locale';
import { canonicalFor } from '@/lib/seo/site';
import { ORGANIZATION_ID } from '@/lib/seo/siteSchemas';

export type Fact = { label: string; value: string };

const COPY: Record<Locale, { title: string; rows: [label: string, value: string][] }> = {
  en: {
    title: 'About 360Ghar',
    rows: [
      ['Scope', '360Ghar is a real estate website with property listings, selected locality pages and online tools.'],
      ['Listings', 'Details and availability can change. Confirm the property, owner, terms and documents with the relevant parties before paying.'],
      ['Locality pages', 'Selected locality pages are not a complete directory and are not evidence of live inventory coverage.'],
      ['Data Hub', 'Some source-dependent records are withheld while evidence, source terms and update dates are reviewed.'],
      ['Tools', 'Calculators and checklists do not replace qualified legal, tax or financial advice.'],
      ['AI and MCP', 'AI answers and tool results may be incomplete and do not verify property information. Confirm important facts with the relevant parties.'],
    ],
  },
  hi: {
    title: '360Ghar के बारे में',
    rows: [
      ['दायरा', '360Ghar प्रॉपर्टी लिस्टिंग, चुने हुए लोकैलिटी पेज और ऑनलाइन टूल वाली रियल एस्टेट वेबसाइट है।'],
      ['लिस्टिंग', 'विवरण और उपलब्धता बदल सकती है। भुगतान से पहले संबंधित पक्षों से प्रॉपर्टी, मालिक, शर्तों और दस्तावेज़ की पुष्टि करें।'],
      ['लोकैलिटी पेज', 'ये चुने हुए पेज पूरी डायरेक्टरी या लाइव इन्वेंट्री कवरेज का प्रमाण नहीं हैं।'],
      ['डेटा हब', 'कुछ स्रोत-आधारित रिकॉर्ड साक्ष्य, स्रोत की शर्तों और अपडेट तारीखों की समीक्षा तक रोके गए हैं।'],
      ['टूल', 'कैलकुलेटर और चेकलिस्ट योग्य कानूनी, कर या वित्तीय सलाह की जगह नहीं लेते।'],
      ['AI और MCP', 'AI जवाब और टूल नतीजे अधूरे हो सकते हैं। वे प्रॉपर्टी की जानकारी सत्यापित नहीं करते; ज़रूरी तथ्यों की पुष्टि संबंधित पक्षों से करें।'],
    ],
  },
};

/**
 * A short, visible fact sheet. Avoids counts, verification claims and service
 * promises that do not have current, page-level evidence.
 */
export function homeFacts(locale: Locale) {
  const c = COPY[locale];
  const rows = c.rows.map(([label, value]) => ({ label, value }));
  const url = canonicalFor('/', locale);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#facts`,
    url,
    about: { '@id': ORGANIZATION_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.label, description: r.value })),
    },
  };
  return { title: c.title, rows, jsonLd };
}

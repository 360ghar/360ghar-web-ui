import { MCP_TOOLS, MCP_URL } from '@/features/content/ai/mcp';
import { COMPANY_EMAIL, COMPANY_PHONE_DISPLAY } from '@/lib/company';
import type { Locale } from '@/lib/i18n/locale';
import { canonicalFor } from '@/lib/seo/site';
import { ORGANIZATION_ID } from '@/lib/seo/siteSchemas';

export type Fact = { label: string; value: string };
type Input = { count: number | null; localityTotal: number; num: (n: number) => string };

const COPY = {
  en: {
    title: 'About 360Ghar',
    what: ['What it is', 'A real estate website and app for Gurugram: homes to rent and buy, PGs, projects, property data and free tools.'],
    homes: (n: string) => ['Homes now', `${n} homes listed. Our team verifies each one.`],
    places: (n: string) => ['Places', `${n} locality and project pages, most of them in Gurugram.`],
    tours: ['Tours', 'Homes show their photos. A 360° tour is shown for the homes that have one.'],
    checks: ['Checks', 'Our team visits each home before it goes live and checks the owner’s papers.'],
    cost: ['Cost', 'Listing a home is free. Owners pay no upfront fee.'],
    help: ['Help', 'A relationship manager helps with visits and papers.'],
    data: ['Data and tools', 'Circle rates, RERA projects and bank auctions. Free calculators for EMI, stamp duty, capital gains tax and area.'],
    ai: (n: number) => ['AI access', `MCP server at ${MCP_URL} with ${n} tools. Search works without an account.`],
    company: ['Company', `Founded in 2025 in Gurugram. Office: Sector 50, Gurugram. Email ${COMPANY_EMAIL}. Phone ${COMPANY_PHONE_DISPLAY}.`],
  },
  hi: {
    title: '360Ghar के बारे में',
    what: ['यह क्या है', 'गुरुग्राम के लिए रियल एस्टेट वेबसाइट और ऐप: किराए और खरीद के घर, PG, प्रोजेक्ट, प्रॉपर्टी डेटा और मुफ़्त टूल।'],
    homes: (n: string) => ['अभी के घर', `${n} घर लिस्ट हैं। हमारी टीम हर घर को वेरिफाई करती है।`],
    places: (n: string) => ['इलाके', `${n} इलाकों और प्रोजेक्ट के पेज, ज़्यादातर गुरुग्राम में।`],
    tours: ['टूर', 'घरों की फ़ोटो दिखती हैं। जिन घरों का 360° टूर है, उनका टूर दिखता है।'],
    checks: ['जाँच', 'लाइव होने से पहले हमारी टीम हर घर पर जाती है और मालिक के कागज़ जाँचती है।'],
    cost: ['खर्च', 'घर लिस्ट करना मुफ़्त है। मालिकों से कोई अग्रिम शुल्क नहीं।'],
    help: ['मदद', 'रिलेशनशिप मैनेजर विज़िट और कागज़ों में मदद करते हैं।'],
    data: ['डेटा और टूल', 'सर्कल रेट, RERA प्रोजेक्ट और बैंक नीलामी। EMI, स्टाम्प ड्यूटी, कैपिटल गेन टैक्स और एरिया के मुफ़्त कैलकुलेटर।'],
    ai: (n: number) => ['AI एक्सेस', `${MCP_URL} पर MCP सर्वर, ${n} टूल के साथ। खोज बिना खाते के चलती है।`],
    company: ['कंपनी', `2025 में गुरुग्राम में शुरू हुई। ऑफ़िस: सेक्टर 50, गुरुग्राम। ईमेल ${COMPANY_EMAIL}। फ़ोन ${COMPANY_PHONE_DISPLAY}।`],
  },
} as const;

/**
 * The fact sheet: short, true lines that people, search engines and AI
 * assistants can read as plain text. Every number is live or counted in code.
 * The v1 lines "360° walkthroughs for every listing" and "India's first" are
 * left out on purpose. The tour row says only what is true: on 2026-09-29, 1 of 109
 * listings had a tour (id 75, a Kuula link) and none had a video.
 */
export function homeFacts(locale: Locale, { count, localityTotal, num }: Input) {
  const c = COPY[locale];
  const rows: Fact[] = [c.what, ...(count ? [c.homes(num(count))] : []), c.places(num(localityTotal)), c.checks, c.tours, c.cost, c.help, c.data, c.ai(MCP_TOOLS.length), c.company].map(
    ([label, value]) => ({ label, value }),
  );
  // A WebPage that points at the site Organization (built once in lib/seo/siteSchemas.ts) and lists the same rows as the page.
  // It must not be an Organization: that @id is already on every page, and `knowsAbout` is for topics, not sentences.
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

/** The data hub pages, for the "More local data" links at the end of each page. */
import type { Locale } from '@/lib/i18n/locale';

type Entry = { route: string; name: [string, string]; desc: [string, string] };

export const HUB = {
  circleRates: { route: '/circle-rates', name: ['Circle rates', 'सर्कल रेट'], desc: ['Government rates for every Gurugram sector', 'गुरुग्राम के हर सेक्टर के सरकारी रेट'] },
  stampDuty: { route: '/stamp-duty-calculator', name: ['Stamp duty calculator', 'स्टैंप ड्यूटी कैलकुलेटर'], desc: ['Duty and registration fee for a deal', 'किसी सौदे की ड्यूटी और रजिस्ट्रेशन फ़ीस'] },
  rera: { route: '/rera-projects', name: ['RERA projects', 'RERA प्रोजेक्ट'], desc: ['Registered projects and their status', 'पंजीकृत प्रोजेक्ट और उनकी स्थिति'] },
  auctions: { route: '/bank-auctions', name: ['Bank auctions', 'बैंक नीलामी'], desc: ['Bank and court auctions with reserve prices', 'रिज़र्व कीमत के साथ बैंक और कोर्ट नीलामी'] },
  sources: { route: '/auction-sources', name: ['Auction portals', 'नीलामी पोर्टल'], desc: ['Where banks and authorities list auctions', 'बैंक और प्राधिकरण नीलामी कहाँ लिस्ट करते हैं'] },
  ownership: { route: '/verify-ownership', name: ['Verify ownership', 'मालिकाना हक जाँचें'], desc: ['Jamabandi land records by khasra number', 'खसरा नंबर से जमाबंदी रिकॉर्ड'] },
  zones: { route: '/zone-checker', name: ['Zone checker', 'ज़ोन चेकर'], desc: ['Land use, FAR and height by sector', 'सेक्टर के हिसाब से ज़मीन का उपयोग, FAR और ऊँचाई'] },
  gazette: { route: '/regulatory-updates', name: ['Gazette notices', 'गज़ट नोटिस'], desc: ['Haryana notices that affect property', 'प्रॉपर्टी पर असर वाले हरियाणा के नोटिस'] },
  builders: { route: '/builder-reputation', name: ['Builder reputation', 'बिल्डर की साख'], desc: ['Scores from HRERA projects and complaints', 'HRERA प्रोजेक्ट और शिकायतों से स्कोर'] },
  builderScore: { route: '/builder-reputation-score', name: ['Builder guide 2026', 'बिल्डर गाइड 2026'], desc: ['Eight large Gurugram builders compared', 'गुरुग्राम के आठ बड़े बिल्डरों की तुलना'] },
  tenant: { route: '/tenant-demand-heatmap', name: ['Tenant demand', 'किरायेदारों की माँग'], desc: ['Where renters want to live', 'किरायेदार कहाँ रहना चाहते हैं'] },
  bestSectors: { route: '/best-sectors-investment-2026', name: ['Best sectors 2026', 'सबसे अच्छे सेक्टर 2026'], desc: ['Five micro-markets for investment', 'निवेश के लिए पाँच माइक्रो-मार्केट'] },
  priceIndex: { route: '/price-index/gurgaon', name: ['Price index', 'प्राइस इंडेक्स'], desc: ['Price ranges by property type', 'प्रॉपर्टी के प्रकार के हिसाब से कीमतें'] },
} satisfies Record<string, Entry>;

export type HubKey = keyof typeof HUB;

export function hubLinks(keys: HubKey[], locale: Locale) {
  const i = locale === 'hi' ? 1 : 0;
  return keys.map((k) => ({ route: HUB[k].route, name: HUB[k].name[i], desc: HUB[k].desc[i] }));
}

export const hubName = (k: HubKey, locale: Locale) => HUB[k].name[locale === 'hi' ? 1 : 0];

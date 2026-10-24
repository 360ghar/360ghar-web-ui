/** The data hub pages, for the "More local data" links at the end of each page. */
import type { Locale } from '@/lib/i18n/locale';

type Entry = { route: string; name: [string, string]; desc: [string, string] };

export const HUB = {
  circleRates: { route: '/circle-rates', name: ['Circle rates', 'सर्कल रेट'], desc: ['Rate values are withheld while source records are reviewed', 'स्रोत रिकॉर्ड की समीक्षा तक दरें रोकी गई हैं'] },
  stampDuty: { route: '/stamp-duty-calculator', name: ['Stamp duty estimate', 'स्टैंप ड्यूटी अनुमान'], desc: ['Unavailable until an official schedule is verified', 'आधिकारिक दर-सूची की पुष्टि तक उपलब्ध नहीं'] },
  rera: { route: '/rera-projects', name: ['RERA projects', 'RERA प्रोजेक्ट'], desc: ['Registered projects and their status', 'पंजीकृत प्रोजेक्ट और उनकी स्थिति'] },
  auctions: { route: '/bank-auctions', name: ['Bank auction listings', 'बैंक नीलामी लिस्टिंग'], desc: ['Listings are withheld while source checks are reviewed', 'स्रोत जाँच की समीक्षा तक लिस्टिंग रोकी गई हैं'] },
  sources: { route: '/auction-sources', name: ['Auction source directory', 'नीलामी स्रोत निर्देशिका'], desc: ['Portal links are under review', 'पोर्टल लिंक समीक्षा के अधीन हैं'] },
  ownership: { route: '/verify-ownership', name: ['Jamabandi record lookup', 'जमाबंदी रिकॉर्ड खोज'], desc: ['Look up a record; this does not verify legal title', 'रिकॉर्ड खोजें; इससे कानूनी टाइटल की पुष्टि नहीं होती'] },
  zones: { route: '/zone-checker', name: ['Zoning data', 'ज़ोनिंग डेटा'], desc: ['Sector records are under review', 'सेक्टर रिकॉर्ड समीक्षा के अधीन हैं'] },
  gazette: { route: '/regulatory-updates', name: ['Regulatory records', 'नियामक रिकॉर्ड'], desc: ['Notification records are under review', 'अधिसूचना रिकॉर्ड समीक्षा के अधीन हैं'] },
  builders: { route: '/builder-reputation', name: ['Builder reputation', 'बिल्डर की साख'], desc: ['Scores from the RERA projects and complaints on our records', 'हमारे रिकॉर्ड के RERA प्रोजेक्ट और शिकायतों से स्कोर'] },
  projectMap: { route: '/map-discovery', name: ['Project map', 'प्रोजेक्ट मैप'], desc: ['No filing on record carries coordinates yet', 'अभी किसी फ़ाइलिंग में निर्देशांक दर्ज नहीं हैं'] },
  marketPulse: { route: '/market-pulse', name: ['Market pulse', 'मार्केट पल्स'], desc: ['Registrations and complaints by city', 'शहर के हिसाब से रजिस्ट्री और शिकायतें'] },
  watchlist: { route: '/account/watchlist', name: ['My watchlist', 'मेरी वॉचलिस्ट'], desc: ['Projects you saved, on your 360Ghar account', 'आपके सेव किए प्रोजेक्ट, आपके 360Ghar अकाउंट पर'] },
  builderScore: { route: '/builder-reputation-score', name: ['Builder guide 2026', 'बिल्डर गाइड 2026'], desc: ['Eight large Gurugram builders compared', 'गुरुग्राम के आठ बड़े बिल्डरों की तुलना'] },
  tenant: { route: '/tenant-demand-heatmap', name: ['Rental-demand research', 'किराया मांग रिसर्च'], desc: ['Demand figures are withheld while sources and methods are reviewed', 'स्रोतों और तरीकों की समीक्षा तक मांग के आंकड़े रोके गए हैं'] },
  bestSectors: { route: '/best-sectors-investment-2026', name: ['Investment research', 'निवेश रिसर्च'], desc: ['Forecasts and rankings are withheld while sources are reviewed', 'स्रोत की समीक्षा तक पूर्वानुमान और रैंकिंग रोकी गई हैं'] },
  priceIndex: { route: '/price-index/gurgaon', name: ['Property price data', 'प्रॉपर्टी कीमत डेटा'], desc: ['Price ranges are withheld while sources and methods are reviewed', 'स्रोतों और तरीकों की समीक्षा तक कीमतें रोकी गई हैं'] },
} satisfies Record<string, Entry>;

export type HubKey = keyof typeof HUB;

export function hubLinks(keys: HubKey[], locale: Locale) {
  const i = locale === 'hi' ? 1 : 0;
  return keys.map((k) => ({ route: HUB[k].route, name: HUB[k].name[i], desc: HUB[k].desc[i] }));
}

export const hubName = (k: HubKey, locale: Locale) => HUB[k].name[locale === 'hi' ? 1 : 0];

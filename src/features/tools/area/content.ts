/**
 * Text for the five area tools. FAQs, HowTo steps, SEO text, unit names and
 * the long explanations come from tools.json (old site, en + hi) through the
 * helpers below. New strings are here.
 */
import type { Locale } from '@/lib/i18n/locale';
import type { Faq, HowTo } from '../seo';
import type { Unit } from './units';

type T = (key: string) => string;

/** Old copy uses em dashes; show a comma instead. */
export const noDash = (s: string) => s.replace(/\s*—\s*/g, ', ').replace(/,\s*,/g, ',');

export function jsonFaqs(t: T, ns: string, n: number): Faq[] {
  return Array.from({ length: n }, (_, i) => ({
    q: noDash(t(`tools:${ns}.faqs.q${i + 1}.question`)),
    a: noDash(t(`tools:${ns}.faqs.q${i + 1}.answer`)),
  })).filter((f) => f.q && f.a);
}

export function jsonHowTo(t: T, ns: string, name: string, description: string): HowTo {
  return {
    name,
    description,
    steps: [1, 2, 3, 4]
      .map((i) => ({ name: noDash(t(`tools:${ns}.howToSteps.step${i}.name`)), text: noDash(t(`tools:${ns}.howToSteps.step${i}.text`)) }))
      .filter((s) => s.name),
  };
}

/** Long unit names from tools.json (areaConverter.*). */
const UNIT_KEY: Record<Unit, string> = {
  sq_ft: 'sqFt',
  sq_mt: 'sqMt',
  sq_yd: 'sqYd',
  gaj: 'gaj',
  acre: 'acre',
  hectare: 'hectare',
  bigha: 'bigha',
  guntha: 'guntha',
  ground: 'ground',
  cent: 'cent',
  kanal: 'kanal',
  marla: 'marla',
};

export const unitLabels = (t: T, units: readonly Unit[]) =>
  Object.fromEntries(units.map((u) => [u, t(`tools:areaConverter.${UNIT_KEY[u]}`)])) as Record<Unit, string>;

/** Short unit names for figures and tables. */
export const SHORT: Record<Locale, Record<Unit, string>> = {
  en: {
    sq_ft: 'sq ft',
    sq_mt: 'sq m',
    sq_yd: 'sq yd',
    gaj: 'gaj',
    acre: 'acre',
    hectare: 'hectare',
    bigha: 'bigha',
    guntha: 'guntha',
    ground: 'ground',
    cent: 'cent',
    kanal: 'kanal',
    marla: 'marla',
  },
  hi: {
    sq_ft: 'वर्ग फ़ुट',
    sq_mt: 'वर्ग मीटर',
    sq_yd: 'वर्ग गज',
    gaj: 'गज',
    acre: 'एकड़',
    hectare: 'हेक्टेयर',
    bigha: 'बीघा',
    guntha: 'गुंठा',
    ground: 'ग्राउंड',
    cent: 'सेंट',
    kanal: 'कनाल',
    marla: 'मरला',
  },
};

export const CONVERTER_UI = {
  en: {
    title: 'Convert',
    value: 'Area',
    from: 'From',
    to: 'To',
    swap: 'Swap units',
    is: (v: string, unit: string) => `${v} ${unit} is`,
    rate: (from: string, v: string, to: string) => `1 ${from} = ${v} ${to}`,
    sizes: 'Size of one unit',
    oneIs: (unit: string, v: string) => `1 ${unit} = ${v} sq ft`,
    plot: 'As a square plot',
    side: (ft: string, m: string) => `Each side ${ft} ft (${m}).`,
    all: 'The same area in every unit',
    unit: 'Unit',
    amount: 'Area',
    bighaNote: 'A bigha is not the same in every state. This tool uses 27,000 sq ft. Check the local value in your land record.',
  },
  hi: {
    title: 'बदलें',
    value: 'एरिया',
    from: 'से',
    to: 'में',
    swap: 'इकाइयाँ आपस में बदलें',
    is: (v: string, unit: string) => `${v} ${unit} बराबर`,
    rate: (from: string, v: string, to: string) => `1 ${from} = ${v} ${to}`,
    sizes: 'एक इकाई का आकार',
    oneIs: (unit: string, v: string) => `1 ${unit} = ${v} वर्ग फ़ुट`,
    plot: 'वर्गाकार प्लॉट के रूप में',
    side: (ft: string, m: string) => `हर तरफ़ ${ft} फ़ुट (${m})।`,
    all: 'यही एरिया हर इकाई में',
    unit: 'इकाई',
    amount: 'एरिया',
    bighaNote: 'बीघा हर राज्य में अलग होता है। यह टूल 27,000 वर्ग फ़ुट मानता है। अपने भूमि रिकॉर्ड में स्थानीय मान जाँचें।',
  },
};

export const MOFA_UI = {
  en: {
    title: 'Your carpet area',
    area: 'Carpet area',
    direction: 'Convert',
    toRera: 'MOFA to RERA',
    toMofa: 'RERA to MOFA',
    uplift: 'RERA is larger by',
    upliftHint: 'Usually 5 to 8%, based on the number and thickness of internal walls. The default is 6%.',
    mofa: 'MOFA carpet area',
    rera: 'RERA carpet area',
    delta: 'Difference',
    sqft: 'sq ft',
    estimate: 'This is an estimate. Check the figure in the registered sale agreement.',
  },
  hi: {
    title: 'आपका कार्पेट एरिया',
    area: 'कार्पेट एरिया',
    direction: 'बदलें',
    toRera: 'MOFA से RERA',
    toMofa: 'RERA से MOFA',
    uplift: 'RERA कितना बड़ा',
    upliftHint: 'आमतौर पर 5 से 8%, अंदर की दीवारों की संख्या और मोटाई के हिसाब से। डिफ़ॉल्ट 6% है।',
    mofa: 'MOFA कार्पेट एरिया',
    rera: 'RERA कार्पेट एरिया',
    delta: 'अंतर',
    sqft: 'वर्ग फ़ुट',
    estimate: 'यह अनुमान है। रजिस्टर्ड सेल एग्रीमेंट में आंकड़ा जाँचें।',
  },
};

export const CARPET_UI = {
  en: {
    title: 'Your flat',
    super: 'Super built-up area',
    superHint: 'The total area the builder advertises.',
    loading: 'Loading factor',
    loadingHint: 'The share of super area that is common area. Usually 25 to 35%.',
    walls: 'Walls and balconies',
    wallsHint: 'Built-up area over carpet area. The default is 15%.',
    sqft: 'sq ft',
    carpet: 'Carpet area',
    carpetSub: 'The floor you can use inside your walls.',
    builtUp: 'Built-up area',
    loadingArea: 'Loading area',
    split: 'How the super area splits',
    partCarpet: 'Carpet',
    partWalls: 'Walls and balconies',
    partCommon: 'Common areas',
  },
  hi: {
    title: 'आपका फ़्लैट',
    super: 'सुपर बिल्ट-अप एरिया',
    superHint: 'बिल्डर जो कुल एरिया बताता है।',
    loading: 'लोडिंग फ़ैक्टर',
    loadingHint: 'सुपर एरिया का वह हिस्सा जो साझा जगह है। आमतौर पर 25 से 35%।',
    walls: 'दीवारें और बालकनी',
    wallsHint: 'कार्पेट एरिया के ऊपर बिल्ट-अप एरिया। डिफ़ॉल्ट 15% है।',
    sqft: 'वर्ग फ़ुट',
    carpet: 'कार्पेट एरिया',
    carpetSub: 'दीवारों के अंदर की वह ज़मीन जो आप इस्तेमाल करते हैं।',
    builtUp: 'बिल्ट-अप एरिया',
    loadingArea: 'लोडिंग एरिया',
    split: 'सुपर एरिया कैसे बँटता है',
    partCarpet: 'कार्पेट',
    partWalls: 'दीवारें और बालकनी',
    partCommon: 'साझा जगह',
  },
};

/** Page headings, leads and the few new prose strings. */
export const PAGES = {
  areaConverter: {
    en: {
      heading: 'Land area converter',
      lead: 'Convert between 12 Indian and standard units: sq ft, gaj, acre, bigha, kanal, marla and more.',
      regional: 'Indian land units',
      where: 'Used in',
      sqm: 'sq m',
      varies: 'Varies by state',
      howTo: 'How to use the area converter',
      howToDesc: 'Convert between Indian and international area units step by step.',
    },
    hi: {
      heading: 'भूमि क्षेत्रफल कन्वर्टर',
      lead: '12 भारतीय और मानक इकाइयों में बदलें: वर्ग फ़ुट, गज, एकड़, बीघा, कनाल, मरला और अन्य।',
      regional: 'भारत की भूमि इकाइयाँ',
      where: 'कहाँ चलती है',
      sqm: 'वर्ग मीटर',
      varies: 'राज्य के हिसाब से अलग',
      howTo: 'एरिया कन्वर्टर कैसे इस्तेमाल करें',
      howToDesc: 'भारतीय और अंतरराष्ट्रीय इकाइयों में एरिया बदलने का आसान तरीका।',
    },
  },
  sqFt: {
    en: {
      heading: 'Carpet area to sq ft calculator',
      lead: 'Convert square metres, square yards, gaj and acres to square feet, the unit RERA uses.',
      howToDesc: 'Convert carpet area, sq m, sq yd, gaj or acres to square feet step by step.',
    },
    hi: {
      heading: 'कार्पेट एरिया से वर्ग फ़ुट कैलकुलेटर',
      lead: 'वर्ग मीटर, वर्ग गज, गज और एकड़ को वर्ग फ़ुट में बदलें, जिस इकाई का RERA इस्तेमाल करता है।',
      howToDesc: 'कार्पेट एरिया, वर्ग मीटर, वर्ग गज, गज या एकड़ को वर्ग फ़ुट में बदलने का तरीका।',
    },
  },
  acreInGaj: {
    en: {
      heading: '1 acre in gaj converter',
      lead: '1 acre is 4,840 gaj, which is also 43,560 sq ft. Convert any value below.',
      howToDesc: 'Convert acres to gaj and square feet step by step.',
    },
    hi: {
      heading: '1 एकड़ में गज कन्वर्टर',
      lead: '1 एकड़ में 4,840 गज होते हैं, यानी 43,560 वर्ग फ़ुट। नीचे कोई भी मान बदलें।',
      howToDesc: 'एकड़ को गज और वर्ग फ़ुट में बदलने का तरीका।',
    },
  },
  mofaToRera: {
    en: {
      heading: 'MOFA to RERA converter',
      lead: 'Estimate the RERA carpet area of a Maharashtra flat from its MOFA carpet area, or the other way.',
    },
    hi: {
      heading: 'MOFA से RERA कन्वर्टर',
      lead: 'महाराष्ट्र के फ़्लैट के लिए MOFA कार्पेट एरिया से RERA कार्पेट एरिया का अनुमान, या उल्टा।',
    },
  },
  areaCalculator: {
    en: {
      heading: 'Carpet area calculator',
      lead: 'Find the carpet and built-up area inside the super built-up area a builder quotes.',
      howTo: 'How to calculate property area',
      howToDesc: 'Calculate carpet area, built-up area and super built-up area step by step.',
    },
    hi: {
      heading: 'कार्पेट एरिया कैलकुलेटर',
      lead: 'बिल्डर के बताए सुपर बिल्ट-अप एरिया में से कार्पेट और बिल्ट-अप एरिया जानें।',
      howTo: 'प्रॉपर्टी का एरिया कैसे निकालें',
      howToDesc: 'कार्पेट, बिल्ट-अप और सुपर बिल्ट-अप एरिया निकालने का तरीका।',
    },
  },
};

/** Where the regional units are used (old site table). Bigha is left out: it varies. */
export const REGIONS: Record<Locale, Partial<Record<Unit, string>>> = {
  en: {
    guntha: 'Maharashtra, Karnataka',
    ground: 'Tamil Nadu',
    cent: 'Kerala, Andhra Pradesh',
    kanal: 'Punjab, J&K',
    marla: 'Punjab, J&K',
    acre: 'All India',
    hectare: 'All India (metric)',
  },
  hi: {
    guntha: 'महाराष्ट्र, कर्नाटक',
    ground: 'तमिलनाडु',
    cent: 'केरल, आंध्र प्रदेश',
    kanal: 'पंजाब, जम्मू-कश्मीर',
    marla: 'पंजाब, जम्मू-कश्मीर',
    acre: 'पूरा भारत',
    hectare: 'पूरा भारत (मीट्रिक)',
  },
};

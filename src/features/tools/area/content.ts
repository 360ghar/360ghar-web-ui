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
    unitNote: 'These are the conversion factors used by this tool. Local land-unit definitions may differ; check your source document. The tool does not verify a property measurement.',
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
    unitNote: 'ये इस टूल में इस्तेमाल होने वाले रूपांतरण मान हैं। स्थानीय भूमि-इकाइयों की परिभाषा अलग हो सकती है; अपने दस्तावेज़ में जाँचें। टूल प्रॉपर्टी का माप सत्यापित नहीं करता।',
  },
};

export const MOFA_UI = {
  en: {
    title: 'Illustrative area comparison',
    area: 'Carpet area',
    direction: 'Convert',
    toRera: 'MOFA to RERA',
    toMofa: 'RERA to MOFA',
    uplift: 'Your assumed difference (%)',
    upliftHint: 'Enter your own percentage assumption. No default is used.',
    assumptionError: 'Enter a value from 0 to 100.',
    enterAssumption: 'Enter an assumption to see an illustrative result.',
    result: 'Illustrative result',
    inputArea: 'Entered area',
    mofa: 'MOFA carpet area',
    rera: 'RERA carpet area',
    delta: 'Difference',
    sqft: 'sq ft',
    estimate: 'This is an illustration using your assumption, not a legal conversion. Check the applicable area definition for your property.',
  },
  hi: {
    title: 'एरिया की उदाहरणात्मक तुलना',
    area: 'कार्पेट एरिया',
    direction: 'बदलें',
    toRera: 'MOFA से RERA',
    toMofa: 'RERA से MOFA',
    uplift: 'आपकी मानी हुई अंतर दर (%)',
    upliftHint: 'अपनी प्रतिशत धारणा दर्ज करें। कोई डिफ़ॉल्ट दर नहीं है।',
    assumptionError: '0 से 100 के बीच मान दर्ज करें।',
    enterAssumption: 'उदाहरणात्मक परिणाम देखने के लिए अपनी धारणा दर्ज करें।',
    result: 'उदाहरणात्मक परिणाम',
    inputArea: 'दर्ज किया गया एरिया',
    mofa: 'MOFA कार्पेट एरिया',
    rera: 'RERA कार्पेट एरिया',
    delta: 'अंतर',
    sqft: 'वर्ग फ़ुट',
    estimate: 'यह आपकी धारणा पर आधारित उदाहरण है, कानूनी रूपांतरण नहीं। अपनी प्रॉपर्टी पर लागू एरिया परिभाषा जाँचें।',
  },
};

export const CARPET_UI = {
  en: {
    title: 'Your flat',
    super: 'Super built-up area input',
    superHint: 'Enter the value shown in your source document. The tool does not verify it.',
    loading: 'Loading assumption',
    loadingHint: 'The default is an example input, not a usual or official share. Choose a value to test.',
    walls: 'Walls and balconies assumption',
    wallsHint: 'The default is an example input, not an official rate. Choose a value to test.',
    sqft: 'sq ft',
    carpet: 'Illustrative carpet-area estimate',
    carpetSub: 'Scenario output only, not a measured usable area or official figure.',
    builtUp: 'Built-up area estimate',
    loadingArea: 'Super minus carpet estimate',
    split: 'How this scenario splits the area',
    partCarpet: 'Carpet',
    partWalls: 'Walls and balconies',
    partCommon: 'Common areas',
  },
  hi: {
    title: 'आपका फ़्लैट',
    super: 'सुपर बिल्ट-अप एरिया इनपुट',
    superHint: 'अपने स्रोत दस्तावेज़ में दिया मान दर्ज करें। टूल इसकी पुष्टि नहीं करता।',
    loading: 'लोडिंग की धारणा',
    loadingHint: 'डिफ़ॉल्ट केवल उदाहरण है, सामान्य या आधिकारिक दर नहीं। जाँचने के लिए मान चुनें।',
    walls: 'दीवार और बालकनी की धारणा',
    wallsHint: 'डिफ़ॉल्ट केवल उदाहरण है, आधिकारिक दर नहीं। जाँचने के लिए मान चुनें।',
    sqft: 'वर्ग फ़ुट',
    carpet: 'कार्पेट एरिया का उदाहरणात्मक अनुमान',
    carpetSub: 'यह परिदृश्य का नतीजा है, मापा हुआ उपयोगी क्षेत्र या आधिकारिक मान नहीं।',
    builtUp: 'बिल्ट-अप एरिया का अनुमान',
    loadingArea: 'सुपर और कार्पेट के बीच का अनुमान',
    split: 'यह परिदृश्य एरिया को कैसे बाँटता है',
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
      lead: 'Convert using the factors shown by this tool. Local land-unit definitions may differ; check your source document before relying on a result.',
      howTo: 'How to use the area converter',
      howToDesc: 'Choose units, enter an area and review the result against the definitions in your source document.',
    },
    hi: {
      heading: 'भूमि क्षेत्रफल कन्वर्टर',
      lead: 'इस टूल में दिखाए गए मानों से रूपांतरण करें। स्थानीय भूमि-इकाइयों की परिभाषा अलग हो सकती है; नतीजे पर भरोसा करने से पहले अपने दस्तावेज़ में जाँचें।',
      howTo: 'एरिया कन्वर्टर कैसे इस्तेमाल करें',
      howToDesc: 'इकाइयाँ चुनें, क्षेत्रफल दर्ज करें और अपने स्रोत दस्तावेज़ की परिभाषा से नतीजा जाँचें।',
    },
  },
  sqFt: {
    en: {
      heading: 'Carpet area to sq ft calculator',
      lead: 'Convert square metres, square yards, gaj and acres to square feet using this tool’s displayed factors. Check the unit definition in your source document.',
      howToDesc: 'Convert carpet area, sq m, sq yd, gaj or acres to square feet step by step.',
    },
    hi: {
      heading: 'कार्पेट एरिया से वर्ग फ़ुट कैलकुलेटर',
      lead: 'इस टूल में दिखाए गए मानों से वर्ग मीटर, वर्ग गज, गज और एकड़ को वर्ग फ़ुट में बदलें। अपने स्रोत दस्तावेज़ में इकाई की परिभाषा जाँचें।',
      howToDesc: 'कार्पेट एरिया, वर्ग मीटर, वर्ग गज, गज या एकड़ को वर्ग फ़ुट में बदलने का तरीका।',
    },
  },
  acreInGaj: {
    en: {
      heading: '1 acre in gaj converter',
      lead: 'Using this tool’s unit factors, 1 acre is 4,840 gaj or 43,560 sq ft. Check local unit definitions in your source document.',
      howToDesc: 'Convert acres to gaj and square feet step by step.',
    },
    hi: {
      heading: '1 एकड़ में गज कन्वर्टर',
      lead: 'इस टूल के इकाई-मानों के अनुसार, 1 एकड़ 4,840 गज या 43,560 वर्ग फ़ुट है। अपने स्रोत दस्तावेज़ में स्थानीय इकाई की परिभाषा जाँचें।',
      howToDesc: 'एकड़ को गज और वर्ग फ़ुट में बदलने का तरीका।',
    },
  },
  mofaToRera: {
    en: {
      heading: 'MOFA and RERA area comparison',
      lead: 'Compare entered area figures with your own assumption. This is an illustration, not a legal conversion.',
    },
    hi: {
      heading: 'MOFA और RERA एरिया की तुलना',
      lead: 'अपनी धारणा से दर्ज एरिया की तुलना करें। यह उदाहरण है, कानूनी रूपांतरण नहीं।',
    },
  },
  areaCalculator: {
    en: {
      heading: 'Carpet area scenario calculator',
      lead: 'Explore an illustrative carpet and built-up area scenario from entered values. The result is not a measurement, official area figure or property assessment.',
      howTo: 'How to use the area scenario calculator',
      howToDesc: 'Enter an area and choose assumptions to review an illustrative result, not an official measurement.',
    },
    hi: {
      heading: 'कार्पेट एरिया परिदृश्य कैलकुलेटर',
      lead: 'दर्ज मानों से कार्पेट और बिल्ट-अप एरिया का उदाहरण देखें। यह नतीजा माप, आधिकारिक एरिया या प्रॉपर्टी का आकलन नहीं है।',
      howTo: 'एरिया परिदृश्य कैलकुलेटर कैसे इस्तेमाल करें',
      howToDesc: 'उदाहरणात्मक नतीजा देखने के लिए एरिया और धारणाएँ दर्ज करें; यह आधिकारिक माप नहीं है।',
    },
  },
};

import type { Faq, HowTo } from '../seo';

export const CG_UI = {
  en: {
    details: 'Sale details',
    sale: 'Sale price',
    purchase: 'Purchase price',
    expenses: 'Transfer expenses',
    expensesHint: 'Enter transfer expenses to subtract from the sale price.',
    result: 'Pre-tax gain',
    note: 'Arithmetic only. This tool does not estimate income tax.',
  },
  hi: {
    details: 'बिक्री का विवरण',
    sale: 'बिक्री मूल्य',
    purchase: 'खरीद मूल्य',
    expenses: 'ट्रांसफ़र खर्च',
    expensesHint: 'बिक्री मूल्य से घटाने के लिए ट्रांसफ़र खर्च दर्ज करें।',
    result: 'कर-पूर्व लाभ',
    note: 'यह केवल गणित है। यह टूल आयकर का अनुमान नहीं लगाता।',
  },
};

export const CG_PAGE = {
  en: {
    heading: 'Property sale gain worksheet',
    lead: 'Enter sale price, purchase price and transfer expenses to calculate pre-tax gain. This tool does not estimate tax.',
    rulesTitle: 'Pre-tax calculation',
    rules: ['Pre-tax gain = sale price - purchase price - transfer expenses.'],
    taxNote: 'This worksheet does not calculate tax. Check current official guidance or a qualified tax adviser for your situation.',
    faqTitle: 'About the pre-tax calculation',
  },
  hi: {
    heading: 'प्रॉपर्टी बिक्री लाभ वर्कशीट',
    lead: 'कर-पूर्व लाभ निकालने के लिए बिक्री मूल्य, खरीद मूल्य और ट्रांसफ़र खर्च दर्ज करें। यह टूल टैक्स का अनुमान नहीं लगाता।',
    rulesTitle: 'कर-पूर्व गणना',
    rules: ['कर-पूर्व लाभ = बिक्री मूल्य - खरीद मूल्य - ट्रांसफ़र खर्च।'],
    taxNote: 'यह वर्कशीट टैक्स की गणना नहीं करती। अपने मामले के लिए मौजूदा आधिकारिक जानकारी या योग्य टैक्स सलाहकार से पुष्टि करें।',
    faqTitle: 'कर-पूर्व गणना के बारे में',
  },
};

export const CG_FAQ: Record<'en' | 'hi', Faq[]> = { en: [], hi: [] };

export const CG_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: 'How to calculate pre-tax gain',
    description: 'Subtract purchase price and transfer expenses from sale price.',
    steps: [
      { name: 'Enter sale price', text: 'Enter the sale price.' },
      { name: 'Enter purchase price', text: 'Enter the purchase price.' },
      { name: 'Enter transfer expenses', text: 'Enter transfer expenses to subtract.' },
    ],
  },
  hi: {
    name: 'कर-पूर्व लाभ कैसे निकालें',
    description: 'बिक्री मूल्य में से खरीद मूल्य और ट्रांसफ़र खर्च घटाएँ।',
    steps: [
      { name: 'बिक्री मूल्य दर्ज करें', text: 'बिक्री मूल्य दर्ज करें।' },
      { name: 'खरीद मूल्य दर्ज करें', text: 'खरीद मूल्य दर्ज करें।' },
      { name: 'ट्रांसफ़र खर्च दर्ज करें', text: 'घटाने के लिए ट्रांसफ़र खर्च दर्ज करें।' },
    ],
  },
};

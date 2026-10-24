/**
 * Loan scenario copy. The calculator uses a visible, fixed 50% income-share
 * assumption. It does not estimate a lender's eligibility or offer.
 */
import type { Faq } from '../seo';

export const LOAN_UI = {
  en: {
    details: 'Your income and costs',
    income: 'Net monthly income',
    emis: 'EMIs you already pay',
    expenses: 'Other monthly expenses',
    result: 'Illustrative loan amount',
    sub: (rate: number, years: number) => `scenario at ${rate}% for ${years} ${years === 1 ? 'year' : 'years'}`,
    none: 'This scenario leaves no monthly amount for another EMI.',
    maxEmi: 'Available EMI in this scenario',
    incomeShare: 'Income-share assumption',
    note: 'Illustrative only. The calculation assigns 50% of income after entered expenses to all EMIs. It is not a lender offer or approval; lenders use their own criteria and terms.',
    split: 'Where your income goes',
    splitLead: (share: number, base: string, cap: string) => `This scenario assigns ${share}% of income after expenses (${base}) to all EMIs, or ${cap} a month.`,
    cap: (cap: string) => `Scenario EMI limit ${cap}`,
    partExpenses: 'Other expenses',
    partEmis: 'EMIs you pay now',
    partNew: 'EMI for the new loan',
    partFree: 'Left for you',
  },
  hi: {
    details: 'आपकी आय और खर्च',
    income: 'नेट मासिक आय',
    emis: 'पहले से चल रही EMI',
    expenses: 'अन्य मासिक खर्च',
    result: 'इस परिदृश्य में अनुमानित राशि',
    sub: (rate: number, years: number) => `${rate}% पर ${years} साल का परिदृश्य`,
    none: 'इस परिदृश्य में नई EMI के लिए मासिक राशि नहीं बचती।',
    maxEmi: 'इस परिदृश्य में EMI की उपलब्ध राशि',
    incomeShare: 'आय के हिस्से की धारणा',
    note: 'यह केवल उदाहरण है। गणना दर्ज किए गए खर्च के बाद की आय का 50% सभी EMI के लिए मानती है। यह बैंक का ऑफ़र या मंज़ूरी नहीं है; हर lender के अपने नियम और शर्तें होती हैं।',
    split: 'आपकी आय कहाँ जाती है',
    splitLead: (share: number, base: string, cap: string) => `इस परिदृश्य में खर्च के बाद की आय (${base}) का ${share}% सभी EMI के लिए माना गया है, यानी हर महीने ${cap}।`,
    cap: (cap: string) => `परिदृश्य की EMI सीमा ${cap}`,
    partExpenses: 'अन्य खर्च',
    partEmis: 'अभी चल रही EMI',
    partNew: 'नए लोन की EMI',
    partFree: 'आपके लिए बचा',
  },
};

export const LOAN_PAGE = {
  en: {
    heading: 'Home loan estimate scenario',
    lead: 'Enter monthly income, expenses, current EMIs, rate and tenure to see an illustrative amount. This is not a lender offer or loan approval.',
    howTitle: 'How this scenario works',
    how: 'The calculator assigns 50% of income after entered expenses to all EMIs, then subtracts current EMIs. This fixed share is a model assumption, not a lender rule.',
    formula1: 'Available EMI in this scenario = max(0, (income − expenses) × 50% − current EMIs)',
    formula2: 'Loan amount = eligible EMI × ((1 + r)^n − 1) ÷ (r × (1 + r)^n)',
    formulaNote: 'r is the monthly interest rate and n is the number of monthly instalments.',
    tipsTitle: 'What to confirm with a lender',
    tips: [
      'Ask the lender to assess your application and the income and obligations it will consider.',
      'Confirm the current interest rate, tenure, fees and repayment terms.',
      'Ask how the lender treats other income, expenses, debts and property details.',
    ],
    docsTitle: 'Document requirements',
    docs: [
      'This calculator does not collect or verify documents.',
      'Ask the lender for the current document list that applies to your application.',
    ],
    emiLink: 'Work out the EMI for a loan amount',
    faqTitle: 'Loan eligibility: questions people ask',
    howToName: 'How to run a home loan scenario',
    howToDesc: 'Enter your values and read an illustrative scenario, not a lender offer or approval.',
  },
  hi: {
    heading: 'होम लोन अनुमान परिदृश्य',
    lead: 'अनुमानित राशि देखने के लिए मासिक आय, खर्च, मौजूदा EMI, ब्याज दर और अवधि दर्ज करें। यह बैंक का ऑफ़र या लोन मंज़ूरी नहीं है।',
    howTitle: 'यह परिदृश्य कैसे काम करता है',
    how: 'कैलकुलेटर दर्ज किए गए खर्च के बाद की आय का 50% सभी EMI के लिए मानता है, फिर मौजूदा EMI घटाता है। यह एक तय मॉडल-धारणा है, बैंक का नियम नहीं।',
    formula1: 'इस परिदृश्य में उपलब्ध EMI = max(0, (आय − खर्च) × 50% − मौजूदा EMI)',
    formula2: 'लोन राशि = पात्र EMI × ((1 + r)^n − 1) ÷ (r × (1 + r)^n)',
    formulaNote: 'r मासिक ब्याज दर है और n मासिक किस्तों की संख्या है।',
    tipsTitle: 'लेंडर से क्या पुष्टि करें',
    tips: [
      'लेंडर से पूछें कि आवेदन में कौन-सी आय और देनदारियाँ मानी जाएँगी।',
      'मौजूदा ब्याज दर, अवधि, शुल्क और भुगतान की शर्तें पूछें।',
      'पूछें कि अन्य आय, खर्च, कर्ज़ और प्रॉपर्टी की जानकारी को कैसे देखा जाएगा।',
    ],
    docsTitle: 'दस्तावेज़ की ज़रूरतें',
    docs: [
      'यह कैलकुलेटर दस्तावेज़ नहीं माँगता या सत्यापित करता।',
      'अपने आवेदन के लिए मौजूदा दस्तावेज़ों की सूची लेंडर से लें।',
    ],
    emiLink: 'किसी लोन राशि की EMI निकालें',
    faqTitle: 'लोन पात्रता: अक्सर पूछे जाने वाले सवाल',
    howToName: 'होम लोन परिदृश्य कैसे देखें',
    howToDesc: 'अपने मान दर्ज कर उदाहरण देखें। यह बैंक का ऑफ़र या मंज़ूरी नहीं है।',
  },
};

export const LOAN_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What does this estimate assume?',
      a: 'It assigns 50% of income after entered expenses to all EMIs, subtracts current EMIs and uses your entered rate and tenure. The share is a model assumption, not a lender policy.',
    },
    {
      q: 'Is this a loan offer or approval?',
      a: 'No. It is a mathematical scenario from the values you enter. A lender decides whether to offer a loan and sets its terms.',
    },
  ],
  hi: [
    {
      q: 'यह अनुमान किन मान्यताओं पर आधारित है?',
      a: 'यह दर्ज किए गए खर्च के बाद की आय का 50% सभी EMI के लिए मानता है, मौजूदा EMI घटाता है और आपकी दर्ज ब्याज दर व अवधि का उपयोग करता है। यह मॉडल की धारणा है, लेंडर की नीति नहीं।',
    },
    {
      q: 'क्या यह लोन ऑफ़र या मंज़ूरी है?',
      a: 'नहीं। यह दर्ज की गई जानकारी पर आधारित गणितीय परिदृश्य है। लेंडर तय करता है कि लोन देना है या नहीं और उसकी शर्तें क्या होंगी।',
    },
  ],
};

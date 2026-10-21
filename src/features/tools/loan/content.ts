/**
 * Loan eligibility text. SEO title, description, keywords, two FAQ items and
 * the HowTo steps come from tools.json (old site). The old answers that gave
 * numbers the calculator does not use ("60 times your salary", "40-50% FOIR")
 * are replaced by answers that match the calculator.
 */
import type { Faq } from '../seo';

export const LOAN_UI = {
  en: {
    details: 'Your income and costs',
    income: 'Net monthly income',
    emis: 'EMIs you already pay',
    expenses: 'Other monthly expenses',
    result: 'You can borrow up to',
    sub: (rate: number, years: number) => `at ${rate}% for ${years} ${years === 1 ? 'year' : 'years'}`,
    none: 'Your EMIs and expenses already use the part of your income that banks allow for EMIs.',
    maxEmi: 'Largest EMI banks allow',
    foir: 'FOIR used',
    note: 'An estimate from standard bank rules (FOIR). Banks also look at your age, credit score, employer and the property value.',
    banks: 'Estimate per bank',
    banksLead: 'Each bank allows a different share of income for EMIs. These FOIR values are typical figures, not bank offers.',
    bank: 'Bank',
    bankFoir: 'FOIR',
    bankEmi: 'EMI',
    bankLoan: 'Estimated loan',
    split: 'Where your income goes',
    splitLead: (foir: number, base: string, cap: string) => `Banks let ${foir}% of your income after expenses (${base}) go to EMIs. That is ${cap} a month.`,
    cap: (cap: string) => `EMI limit ${cap}`,
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
    result: 'आपको इतना लोन मिल सकता है',
    sub: (rate: number, years: number) => `${rate}% पर ${years} साल के लिए`,
    none: 'आपकी EMI और खर्च पहले ही आय का वह हिस्सा ले रहे हैं जो बैंक EMI के लिए मानते हैं।',
    maxEmi: 'बैंक जितनी EMI मानते हैं',
    foir: 'लिया गया FOIR',
    note: 'यह बैंकों के आम नियम (FOIR) पर आधारित अनुमान है। बैंक आपकी उम्र, क्रेडिट स्कोर, नियोक्ता और प्रॉपर्टी की कीमत भी देखते हैं।',
    banks: 'हर बैंक का अनुमान',
    banksLead: 'हर बैंक EMI के लिए आय का अलग हिस्सा मानता है। ये FOIR आम आँकड़े हैं, बैंक के ऑफ़र नहीं।',
    bank: 'बैंक',
    bankFoir: 'FOIR',
    bankEmi: 'EMI',
    bankLoan: 'अनुमानित लोन',
    split: 'आपकी आय कहाँ जाती है',
    splitLead: (foir: number, base: string, cap: string) => `खर्च के बाद की आय (${base}) का ${foir}% बैंक EMI के लिए मानते हैं। यानी हर महीने ${cap}।`,
    cap: (cap: string) => `EMI सीमा ${cap}`,
    partExpenses: 'अन्य खर्च',
    partEmis: 'अभी चल रही EMI',
    partNew: 'नए लोन की EMI',
    partFree: 'आपके लिए बचा',
  },
};

export const LOAN_PAGE = {
  en: {
    heading: 'Home loan eligibility calculator',
    lead: 'Enter your income and what you already pay each month. See the largest home loan banks are likely to give you.',
    howTitle: 'How eligibility is calculated',
    how: 'Banks let only part of your income go to EMIs. This share is the FOIR (fixed obligation to income ratio). This calculator uses 50% up to ₹50,000 a month, 55% up to ₹1 lakh, 60% up to ₹2 lakh and 65% above that.',
    formula1: 'Eligible EMI = (income − other expenses) × FOIR − existing EMIs',
    formula2: 'Loan amount = eligible EMI × ((1 + r)^n − 1) ÷ (r × (1 + r)^n)',
    formulaNote: 'r is the monthly interest rate and n is the number of monthly instalments.',
    tipsTitle: 'How to raise your eligibility',
    tips: [
      'Add a co-applicant with an income, such as your spouse or a parent.',
      'Close small loans and clear credit card dues before you apply.',
      'Choose a longer tenure. The EMI falls, so the loan you can get goes up.',
      'Show all regular income, such as rent and fixed allowances.',
      'Keep your credit score above 750.',
    ],
    docsTitle: 'Papers the bank asks for',
    docs: [
      'Identity and address proof: Aadhaar, PAN, passport or voter ID.',
      'Income proof: salary slips for 3 to 6 months, ITR for 2 to 3 years, bank statements for 6 months.',
      'Property papers: sale agreement, approved building plan, builder NOC and tax receipts.',
    ],
    emiLink: 'Work out the EMI for a loan amount',
    faqTitle: 'Loan eligibility: questions people ask',
    howToName: 'How to check your home loan eligibility',
    howToDesc: 'Calculate how much home loan you can get from your income and obligations.',
  },
  hi: {
    heading: 'होम लोन पात्रता कैलकुलेटर',
    lead: 'अपनी आय और हर महीने के मौजूदा भुगतान डालें। देखें कि बैंक आपको ज़्यादा से ज़्यादा कितना होम लोन दे सकते हैं।',
    howTitle: 'पात्रता कैसे निकलती है',
    how: 'बैंक आपकी आय का केवल एक हिस्सा EMI के लिए मानते हैं। इस हिस्से को FOIR (फ़िक्स्ड ऑब्लिगेशन टू इनकम रेशियो) कहते हैं। यह कैलकुलेटर ₹50,000 महीने तक 50%, ₹1 लाख तक 55%, ₹2 लाख तक 60% और उससे ऊपर 65% लेता है।',
    formula1: 'पात्र EMI = (आय − अन्य खर्च) × FOIR − मौजूदा EMI',
    formula2: 'लोन राशि = पात्र EMI × ((1 + r)^n − 1) ÷ (r × (1 + r)^n)',
    formulaNote: 'r मासिक ब्याज दर है और n मासिक किस्तों की संख्या है।',
    tipsTitle: 'पात्रता कैसे बढ़ाएँ',
    tips: [
      'आय वाले सह-आवेदक को जोड़ें, जैसे पति/पत्नी या माता-पिता।',
      'आवेदन से पहले छोटे लोन बंद करें और क्रेडिट कार्ड का बकाया चुकाएँ।',
      'लंबी अवधि चुनें। EMI घटती है, तो मिलने वाला लोन बढ़ता है।',
      'सारी नियमित आय दिखाएँ, जैसे किराया और तय भत्ते।',
      'अपना क्रेडिट स्कोर 750 से ऊपर रखें।',
    ],
    docsTitle: 'बैंक कौन से कागज़ माँगता है',
    docs: [
      'पहचान और पते का प्रमाण: आधार, PAN, पासपोर्ट या वोटर आईडी।',
      'आय का प्रमाण: 3 से 6 महीने की सैलरी स्लिप, 2 से 3 साल का ITR, 6 महीने का बैंक स्टेटमेंट।',
      'प्रॉपर्टी के कागज़: बिक्री अनुबंध, स्वीकृत बिल्डिंग प्लान, बिल्डर की NOC और टैक्स रसीदें।',
    ],
    emiLink: 'किसी लोन राशि की EMI निकालें',
    faqTitle: 'लोन पात्रता: अक्सर पूछे जाने वाले सवाल',
    howToName: 'अपनी होम लोन पात्रता कैसे जाँचें',
    howToDesc: 'अपनी आय और देनदारियों से जानें कि आपको कितना होम लोन मिल सकता है।',
  },
};

/** New FAQ items. Two more come from tools.json (loanEligibility.faqs.q3, q4). */
export const LOAN_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What is FOIR and how does it affect my loan?',
      a: 'FOIR (fixed obligation to income ratio) is the share of your income that can go to EMIs. If a bank allows 50% of a ₹1 lakh income and you already pay ₹20,000 in EMIs, the new home loan EMI can be up to ₹30,000.',
    },
    {
      q: 'How much home loan can I get on a ₹50,000 salary?',
      a: 'With no other EMIs, a 50% FOIR, 8.5% interest and a 20-year tenure, the EMI can be up to ₹25,000. That supports a loan of about ₹28.8 lakh. Your age, credit score and employer change the final amount.',
    },
    {
      q: 'Can I add rental income to my eligibility?',
      a: 'Many banks count a part of regular rental income. You need the rent agreement and bank statements that show the rent coming in. Ask your bank how much of it they count.',
    },
  ],
  hi: [
    {
      q: 'FOIR क्या है और यह लोन पर कैसे असर डालता है?',
      a: 'FOIR (फ़िक्स्ड ऑब्लिगेशन टू इनकम रेशियो) आय का वह हिस्सा है जो EMI में जा सकता है। अगर बैंक ₹1 लाख आय का 50% मानता है और आप पहले से ₹20,000 की EMI भरते हैं, तो नए होम लोन की EMI ₹30,000 तक हो सकती है।',
    },
    {
      q: '₹50,000 सैलरी पर कितना होम लोन मिल सकता है?',
      a: 'कोई और EMI न हो, FOIR 50%, ब्याज 8.5% और अवधि 20 साल हो, तो EMI ₹25,000 तक हो सकती है। इस पर लगभग ₹28.8 लाख का लोन बनता है। आपकी उम्र, क्रेडिट स्कोर और नियोक्ता से अंतिम राशि बदलती है।',
    },
    {
      q: 'क्या किराये की आय पात्रता में जुड़ सकती है?',
      a: 'कई बैंक नियमित किराये की आय का एक हिस्सा गिनते हैं। इसके लिए किराया अनुबंध और किराया आने वाले बैंक स्टेटमेंट चाहिए। बैंक से पूछें कि वे कितना हिस्सा गिनते हैं।',
    },
  ],
};

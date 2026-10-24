/** EMI page text. The sample figures are covered by math.test.ts. */
import type { Faq, HowTo } from '../seo';

export const EMI_UI = {
  en: {
    details: 'Your loan',
    amount: 'Loan amount',
    emi: 'Monthly EMI',
    forTenure: (y: number, m: number) => `for ${y} ${y === 1 ? 'year' : 'years'} (${m} months)`,
    totalInterest: 'Total interest',
    totalPayment: 'Total payment',
    principal: 'Principal',
    interest: 'Interest',
    prepay: 'Prepay once',
    prepayLead: 'This scenario keeps the EMI unchanged after the lump-sum payment and shortens the modeled tenure. Your lender may use different rules or fees.',
    prepayAmount: 'Prepayment amount',
    prepayMonth: 'Paid with EMI number',
    prepayNone: 'Enter an amount to see the modeled result.',
    monthsSaved: 'EMIs saved in this scenario',
    interestSaved: 'Modeled interest difference',
    newTenure: 'Modeled tenure',
    ym: (m: number) => {
      const y = Math.floor(m / 12);
      const r = m % 12;
      return [y ? `${y} yr` : '', r ? `${r} mo` : ''].filter(Boolean).join(' ') || '0 mo';
    },
    schedule: 'Year-by-year schedule',
    year: 'Year',
    balance: 'Balance at year end',
    chart: 'Where your EMIs go, year by year',
    chartLead: (interest: string, total: string, cross: number | null) =>
      `In this calculation, ${interest} of the ${total} paid in year 1 is interest. ${cross ? `In year ${cross}, the modeled annual principal total exceeds annual interest.` : ''}`,
    chartPrepay: (end: number, was: number) => `In this model, the lump sum shortens the estimated tenure from year ${was} to year ${end}.`,
    chartYear: (n: number) => `Year ${n}`,
    chartCross: 'Year when annual principal exceeds interest',
    chartSaved: 'Modeled years reduced',
    chartLump: (amount: string) => `${amount} lump sum in model`,
  },
  hi: {
    details: 'आपका लोन',
    amount: 'लोन राशि',
    emi: 'मासिक EMI',
    forTenure: (y: number, m: number) => `${y} साल (${m} महीने) के लिए`,
    totalInterest: 'कुल ब्याज',
    totalPayment: 'कुल भुगतान',
    principal: 'मूलधन',
    interest: 'ब्याज',
    prepay: 'एक बार प्रीपेमेंट',
    prepayLead: 'इस परिदृश्य में एकमुश्त भुगतान के बाद EMI वही रहती है और मॉडल की अवधि घटती है। लेंडर के नियम या शुल्क अलग हो सकते हैं।',
    prepayAmount: 'प्रीपेमेंट राशि',
    prepayMonth: 'किस EMI के साथ',
    prepayNone: 'मॉडल का नतीजा देखने के लिए राशि डालें।',
    monthsSaved: 'इस परिदृश्य में कम EMI',
    interestSaved: 'मॉडल में ब्याज का अंतर',
    newTenure: 'मॉडल की अवधि',
    ym: (m: number) => {
      const y = Math.floor(m / 12);
      const r = m % 12;
      return [y ? `${y} साल` : '', r ? `${r} महीने` : ''].filter(Boolean).join(' ') || '0 महीने';
    },
    schedule: 'साल-दर-साल शेड्यूल',
    year: 'साल',
    balance: 'साल के अंत में बकाया',
    chart: 'आपकी EMI कहाँ जाती है, साल-दर-साल',
    chartLead: (interest: string, total: string, cross: number | null) =>
      `इस गणना में पहले साल के ${total} में से ${interest} ब्याज है। ${cross ? `साल ${cross} में मॉडल का सालाना मूलधन, सालाना ब्याज से ज़्यादा है।` : ''}`,
    chartPrepay: (end: number, was: number) => `इस मॉडल में एकमुश्त भुगतान से अनुमानित अवधि साल ${was} से साल ${end} होती है।`,
    chartYear: (n: number) => `साल ${n}`,
    chartCross: 'जिस साल सालाना मूलधन ब्याज से ज़्यादा हो',
    chartSaved: 'मॉडल में कम साल',
    chartLump: (amount: string) => `${amount} एकमुश्त राशि (मॉडल)`,
  },
};

export const EMI_PAGE = {
  en: {
    heading: 'Home loan EMI calculator',
    lead: 'Enter a loan amount, annual rate and tenure to see an EMI estimate and yearly schedule. This model does not include lender fees or terms. It is not a lender quote, approval or affordability check.',
    formulaTitle: 'How the EMI is calculated',
    formula:
      'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). P is the loan amount, r is the yearly rate divided by 12 and by 100, and n is the number of months.',
    example: 'Example: ₹50 lakh at 8.5% for 20 years gives a modeled EMI of about ₹43,391 and about ₹54.1 lakh in modeled interest.',
    faqTitle: 'Home loan EMI: questions people ask',
  },
  hi: {
    heading: 'होम लोन EMI कैलकुलेटर',
    lead: 'लोन राशि, सालाना दर और अवधि डालकर EMI का अनुमान और सालाना शेड्यूल देखें। इस मॉडल में लेंडर के शुल्क या शर्तें शामिल नहीं हैं। यह लेंडर का ऑफर, मंज़ूरी या भुगतान-क्षमता की जाँच नहीं है।',
    formulaTitle: 'EMI कैसे निकलती है',
    formula:
      'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)। P लोन राशि है, r सालाना दर को 12 और 100 से भाग देकर मिलती है, और n महीनों की संख्या है।',
    example: 'उदाहरण: ₹50 लाख, 8.5% पर 20 साल के लिए, मॉडल की EMI लगभग ₹43,391 और ब्याज लगभग ₹54.1 लाख है।',
    faqTitle: 'होम लोन EMI: अक्सर पूछे जाने वाले सवाल',
  },
};

export const EMI_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What does this EMI estimate calculate?',
      a: 'It calculates a monthly payment from the principal, annual rate and tenure using the formula above. The model uses a fixed rate and regular monthly payments. It does not include lender fees, insurance or taxes.',
    },
    {
      q: 'What does the year-by-year schedule show?',
      a: 'It splits the modeled payments into principal and interest and shows the estimated balance at each year end. It uses your inputs and does not reproduce a lender statement.',
    },
    {
      q: 'How does tenure change the estimate?',
      a: 'For the same principal and rate, a shorter tenure raises the modeled EMI and reduces modeled total interest. This is a calculation, not a recommendation about which tenure to choose.',
    },
    {
      q: 'Does this tool assess affordability or loan eligibility?',
      a: 'No. It calculates payments from the values you enter. It does not assess income, credit, eligibility or affordability and does not provide a lender offer.',
    },
    {
      q: 'Does the prepayment result match my lender’s policy?',
      a: 'No. This scenario applies a lump sum with the selected EMI, keeps the EMI unchanged and shortens the modeled tenure. Your lender may use different rules or fees. Check your loan terms.',
    },
    {
      q: 'Does the estimate include other loan costs?',
      a: 'No. It models principal and interest only. It excludes lender charges, insurance, taxes and other contract-specific costs.',
    },
  ],
  hi: [
    {
      q: 'यह EMI अनुमान क्या निकालता है?',
      a: 'यह ऊपर दिए फ़ॉर्मूले से मूलधन, सालाना दर और अवधि के आधार पर मासिक भुगतान निकालता है। मॉडल स्थिर दर और नियमित मासिक भुगतान मानता है। इसमें लेंडर के शुल्क, बीमा या टैक्स शामिल नहीं हैं।',
    },
    {
      q: 'सालाना शेड्यूल में क्या दिखता है?',
      a: 'यह मॉडल के भुगतान को मूलधन और ब्याज में बाँटता है और हर साल के अंत का अनुमानित बकाया दिखाता है। यह आपके दर्ज मानों पर आधारित है, लेंडर का स्टेटमेंट नहीं।',
    },
    {
      q: 'अवधि बदलने से अनुमान पर क्या असर पड़ता है?',
      a: 'एक ही मूलधन और दर पर, छोटी अवधि से मॉडल की EMI बढ़ती है और कुल मॉडल ब्याज घटता है। यह गणना है, अवधि चुनने की सलाह नहीं।',
    },
    {
      q: 'क्या यह टूल भुगतान-क्षमता या लोन पात्रता जाँचता है?',
      a: 'नहीं। यह आपके दर्ज मानों से भुगतान निकालता है। यह आय, क्रेडिट, पात्रता या भुगतान-क्षमता नहीं जाँचता और लेंडर का ऑफर नहीं देता।',
    },
    {
      q: 'क्या प्रीपेमेंट का नतीजा मेरे लेंडर की नीति से मेल खाता है?',
      a: 'नहीं। यह परिदृश्य एक चुनी हुई EMI के साथ एकमुश्त राशि जोड़ता है, EMI वही रखता है और मॉडल की अवधि घटाता है। लेंडर के नियम या शुल्क अलग हो सकते हैं। अपने लोन की शर्तें जाँचें।',
    },
    {
      q: 'क्या अनुमान में लोन के अन्य खर्च शामिल हैं?',
      a: 'नहीं। यह केवल मूलधन और ब्याज का मॉडल है। इसमें लेंडर के शुल्क, बीमा, टैक्स और अनुबंध से जुड़े अन्य खर्च शामिल नहीं हैं।',
    },
  ],
};

export const EMI_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: 'How to calculate home loan EMI',
    description: 'Use entered values to calculate an EMI estimate. This is not a lender quote or financial advice.',
    steps: [
      { name: 'Enter the principal', text: 'Enter the loan amount you want to model.' },
      { name: 'Enter an annual rate', text: 'Enter a rate for the scenario. Confirm the actual rate and how it is applied with your lender.' },
      { name: 'Choose the tenure', text: 'Choose a period in years. The model uses a fixed rate and regular monthly payments.' },
      { name: 'Review the estimate', text: 'Review the EMI, modeled interest, total payment and year-by-year schedule. These are not lender figures.' },
      { name: 'Model a prepayment', text: 'Enter a lump sum and EMI number. The model keeps the EMI unchanged; your lender may use different rules or fees.' },
    ],
  },
  hi: {
    name: 'होम लोन EMI कैसे निकालें',
    description: 'दर्ज मानों से EMI का अनुमान निकालें। यह लेंडर का ऑफर या वित्तीय सलाह नहीं है।',
    steps: [
      { name: 'मूलधन डालें', text: 'जिस लोन राशि का मॉडल बनाना है, वह डालें।' },
      { name: 'सालाना दर डालें', text: 'परिदृश्य के लिए दर डालें। असली दर और उसके लागू होने का तरीका लेंडर से पक्का करें।' },
      { name: 'अवधि चुनें', text: 'अवधि साल में चुनें। मॉडल स्थिर दर और नियमित मासिक भुगतान मानता है।' },
      { name: 'अनुमान देखें', text: 'EMI, मॉडल का ब्याज, कुल भुगतान और सालाना शेड्यूल देखें। ये लेंडर के आँकड़े नहीं हैं।' },
      { name: 'प्रीपेमेंट का मॉडल बनाएँ', text: 'एकमुश्त राशि और EMI नंबर डालें। मॉडल EMI वही रखता है; लेंडर के नियम या शुल्क अलग हो सकते हैं।' },
    ],
  },
};

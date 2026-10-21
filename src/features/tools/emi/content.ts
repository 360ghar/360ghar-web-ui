/**
 * EMI page text. SEO title, description and the "What is EMI" text come from
 * tools.json (old site). The FAQ is the old page FAQ, shortened; the sample
 * numbers are recomputed with math.ts (the old answers had wrong figures).
 */
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
    prepayLead: 'Pay a lump sum with one EMI. Your EMI stays the same and the loan ends sooner.',
    prepayAmount: 'Prepayment amount',
    prepayMonth: 'Paid with EMI number',
    prepayNone: 'Enter an amount to see the effect.',
    monthsSaved: 'EMIs you skip',
    interestSaved: 'Interest you save',
    newTenure: 'New tenure',
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
      `In year 1, ${interest} of the ${total} you pay goes to interest. ${cross === 1 ? 'Even so, most of each EMI repays the loan.' : cross ? `From year ${cross}, most of each EMI repays the loan.` : ''}`,
    chartPrepay: (end: number, was: number) => `With the prepayment, the loan ends in year ${end} instead of year ${was}.`,
    chartYear: (n: number) => `Year ${n}`,
    chartCross: 'Principal overtakes interest',
    chartSaved: 'Years you no longer pay',
    chartLump: (amount: string) => `${amount} prepaid`,
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
    prepayLead: 'किसी एक EMI के साथ एकमुश्त राशि दें। EMI वही रहती है और लोन जल्दी खत्म होता है।',
    prepayAmount: 'प्रीपेमेंट राशि',
    prepayMonth: 'किस EMI के साथ',
    prepayNone: 'असर देखने के लिए राशि डालें।',
    monthsSaved: 'कम हुई EMI',
    interestSaved: 'बचा ब्याज',
    newTenure: 'नई अवधि',
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
      `पहले साल आप जो ${total} देते हैं, उसमें से ${interest} ब्याज में जाता है। ${cross === 1 ? 'फिर भी हर EMI का बड़ा हिस्सा लोन चुकाता है।' : cross ? `साल ${cross} से हर EMI का बड़ा हिस्सा लोन चुकाता है।` : ''}`,
    chartPrepay: (end: number, was: number) => `प्रीपेमेंट से लोन साल ${was} की जगह साल ${end} में खत्म होता है।`,
    chartYear: (n: number) => `साल ${n}`,
    chartCross: 'मूलधन ब्याज से आगे',
    chartSaved: 'जिन सालों की EMI नहीं देनी',
    chartLump: (amount: string) => `${amount} प्रीपेमेंट`,
  },
};

export const EMI_PAGE = {
  en: {
    heading: 'Home loan EMI calculator',
    lead: 'Move the sliders to see your monthly EMI, the total interest and how a prepayment shortens the loan.',
    formulaTitle: 'How the EMI is calculated',
    formula:
      'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). P is the loan amount, r is the yearly rate divided by 12 and by 100, and n is the number of months.',
    example: 'Example: ₹50 lakh at 8.5% for 20 years gives an EMI of ₹43,391. You pay ₹54.1 lakh in interest over the loan.',
    faqTitle: 'Home loan EMI: questions people ask',
  },
  hi: {
    heading: 'होम लोन EMI कैलकुलेटर',
    lead: 'स्लाइडर बदलें और देखें आपकी मासिक EMI, कुल ब्याज और प्रीपेमेंट से लोन कितना जल्दी खत्म होगा।',
    formulaTitle: 'EMI कैसे निकलती है',
    formula:
      'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)। P लोन राशि है, r सालाना दर को 12 और 100 से भाग देकर मिलती है, और n महीनों की संख्या है।',
    example: 'उदाहरण: ₹50 लाख, 8.5% पर 20 साल के लिए, EMI ₹43,391 बनती है। पूरे लोन में ₹54.1 लाख ब्याज जाता है।',
    faqTitle: 'होम लोन EMI: अक्सर पूछे जाने वाले सवाल',
  },
};

export const EMI_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'How is home loan EMI calculated?',
      a: 'EMI = [P × R × (1+R)^N] / [(1+R)^N − 1], where P is the loan amount, R is the monthly rate (annual rate / 12 / 100) and N is the number of months. For example, a ₹50 lakh loan at 8.5% for 20 years has an EMI of about ₹43,391.',
    },
    {
      q: 'What is an amortization schedule?',
      a: 'It is a table that splits each EMI into principal and interest over the tenure. In the first years most of the EMI is interest: in year 1 of a ₹50 lakh, 20-year loan at 8.5%, about 81% of what you pay is interest. Later the principal part grows.',
    },
    {
      q: 'Should I choose a shorter or longer tenure?',
      a: 'A shorter tenure means a higher EMI but much less interest. For ₹50 lakh at 8.5%, 20 years gives an EMI of ₹43,391 and ₹54.1 lakh of interest; 30 years gives ₹38,446 and ₹88.4 lakh of interest.',
    },
    {
      q: 'How can I reduce my home loan EMI?',
      a: 'Ask for a lower rate (even 0.25% matters over 20 years), make a larger down payment, prepay when you can, or choose a longer tenure. A longer tenure lowers the EMI but raises the total interest.',
    },
    {
      q: 'What is a safe EMI to income ratio?',
      a: 'Many advisers suggest that all your EMIs together stay below 40% of your monthly income. Banks check this with FOIR (fixed obligation to income ratio). See the loan eligibility calculator for an estimate.',
    },
    {
      q: 'Can I pay more than my EMI?',
      a: 'Yes. Most banks allow part prepayment on floating-rate home loans without a penalty. A prepayment reduces the principal, so the loan ends sooner or the EMI falls. Use the prepayment box above to see the effect.',
    },
    {
      q: 'What happens if I miss an EMI?',
      a: 'The bank charges a late fee and reports the delay to credit bureaus, which lowers your credit score. Repeated misses can make the loan a non-performing asset. Tell your bank early if you expect a problem.',
    },
  ],
  hi: [
    {
      q: 'होम लोन की EMI कैसे निकाली जाती है?',
      a: 'EMI = [P × R × (1+R)^N] / [(1+R)^N − 1], जहाँ P लोन राशि है, R मासिक दर (सालाना दर / 12 / 100) है और N महीनों की संख्या है। उदाहरण: ₹50 लाख का लोन 8.5% पर 20 साल के लिए, EMI लगभग ₹43,391।',
    },
    {
      q: 'अमॉर्टाइज़ेशन शेड्यूल क्या है?',
      a: 'यह एक टेबल है जो हर EMI को मूलधन और ब्याज में बाँटती है। शुरुआती सालों में EMI का ज़्यादातर हिस्सा ब्याज होता है: ₹50 लाख, 20 साल, 8.5% के लोन के पहले साल में लगभग 81% भुगतान ब्याज होता है। बाद में मूलधन का हिस्सा बढ़ता है।',
    },
    {
      q: 'छोटी अवधि चुनें या लंबी?',
      a: 'छोटी अवधि में EMI ज़्यादा पर ब्याज बहुत कम होता है। ₹50 लाख, 8.5% पर: 20 साल में EMI ₹43,391 और ब्याज ₹54.1 लाख; 30 साल में EMI ₹38,446 और ब्याज ₹88.4 लाख।',
    },
    {
      q: 'होम लोन की EMI कैसे कम करें?',
      a: 'कम ब्याज दर माँगें (20 साल में 0.25% भी मायने रखता है), ज़्यादा डाउन पेमेंट दें, जब हो सके प्रीपेमेंट करें, या लंबी अवधि चुनें। लंबी अवधि से EMI घटती है पर कुल ब्याज बढ़ता है।',
    },
    {
      q: 'आय के मुकाबले कितनी EMI ठीक है?',
      a: 'कई सलाहकार कहते हैं कि सभी EMI मिलाकर मासिक आय के 40% से कम रहें। बैंक इसे FOIR (फ़िक्स्ड ऑब्लिगेशन टू इनकम रेशियो) से जाँचते हैं। अनुमान के लिए लोन पात्रता कैलकुलेटर देखें।',
    },
    {
      q: 'क्या मैं EMI से ज़्यादा भुगतान कर सकता हूँ?',
      a: 'हाँ। ज़्यादातर बैंक फ़्लोटिंग रेट होम लोन पर बिना पेनल्टी पार्ट प्रीपेमेंट की अनुमति देते हैं। इससे मूलधन घटता है, तो लोन जल्दी खत्म होता है या EMI घटती है। ऊपर प्रीपेमेंट बॉक्स में असर देखें।',
    },
    {
      q: 'EMI छूट जाए तो क्या होता है?',
      a: 'बैंक लेट फ़ीस लेता है और देरी की जानकारी क्रेडिट ब्यूरो को देता है, जिससे क्रेडिट स्कोर घटता है। बार-बार चूकने पर लोन NPA बन सकता है। दिक्कत की आशंका हो तो बैंक को पहले बताएँ।',
    },
  ],
};

export const EMI_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: 'How to calculate home loan EMI',
    description: 'Step-by-step guide to calculating your monthly EMI for a home loan in India.',
    steps: [
      { name: 'Enter the loan amount', text: 'Type or slide to the amount you want to borrow, for example ₹50,00,000.' },
      { name: 'Set the interest rate', text: 'Enter the yearly rate your bank offers. Check the bank website for the current rate.' },
      { name: 'Choose the tenure', text: 'Pick the repayment period in years. A longer tenure lowers the EMI but raises the total interest.' },
      { name: 'Read the result', text: 'See the monthly EMI, the total interest and the total payment, and open the yearly schedule.' },
      { name: 'Try a prepayment', text: 'Enter a lump sum and the EMI number to see how many EMIs and how much interest you save.' },
    ],
  },
  hi: {
    name: 'होम लोन EMI कैसे निकालें',
    description: 'भारत में होम लोन की मासिक EMI निकालने का आसान तरीका।',
    steps: [
      { name: 'लोन राशि डालें', text: 'जितना उधार लेना है वह राशि लिखें या स्लाइड करें, जैसे ₹50,00,000।' },
      { name: 'ब्याज दर चुनें', text: 'बैंक की सालाना दर डालें। मौजूदा दर बैंक की वेबसाइट पर देखें।' },
      { name: 'अवधि चुनें', text: 'चुकाने की अवधि साल में चुनें। लंबी अवधि से EMI घटती है पर कुल ब्याज बढ़ता है।' },
      { name: 'नतीजा देखें', text: 'मासिक EMI, कुल ब्याज और कुल भुगतान देखें, और सालाना शेड्यूल खोलें।' },
      { name: 'प्रीपेमेंट आज़माएँ', text: 'एकमुश्त राशि और EMI नंबर डालें, और देखें कितनी EMI और कितना ब्याज बचता है।' },
    ],
  },
};

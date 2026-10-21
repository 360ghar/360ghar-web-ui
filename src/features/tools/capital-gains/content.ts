/**
 * Capital gains text. SEO title, description and keywords come from
 * tools.json. The old FAQ is kept but corrected: the 12.5% rule from 23 July
 * 2024, the CII for 2025-26 (376, not 380) and the ₹10 crore cap on 54/54F.
 */
import type { Faq, HowTo } from '../seo';
import { fyLabel } from './math';

type Pick2 = 'plain' | 'indexed';

export const CG_UI = {
  en: {
    details: 'The sale',
    asset: 'What did you sell?',
    house: 'A house or flat',
    land: 'Land, a plot or a shop',
    sale: 'Sale price',
    purchase: 'Purchase price',
    purchaseHint: 'Bought before 1 April 2001? Enter the fair market value on 1 April 2001, and that date.',
    bought: 'Date of purchase',
    sold: 'Date of sale',
    expenses: 'Transfer expenses',
    expensesHint: 'Brokerage, legal fees and other costs of the sale.',
    slab: 'Your income tax slab',
    slabHint: 'Used only for a short-term gain.',
    cii: (fy: number) => `Cost Inflation Index for FY ${fyLabel(fy)}`,
    ciiHint: 'This year is not in the table yet. Enter the index notified by CBDT. Until then we use 376 (FY 2025-26).',
    dateError: 'The sale date must be after the purchase date.',
    result: 'Estimated tax',
    why: {
      short: 'You held the property for 24 months or less, so the gain is short term and taxed at your slab rate.',
      old: 'You sold before 23 July 2024, so 20% with indexation applies.',
      new: 'You bought on or after 23 July 2024, so only 12.5% without indexation applies.',
      choice: (p: Pick2) =>
        `You bought before 23 July 2024 and sold on or after it, so a resident individual or HUF pays the lower of the two. Here that is ${p === 'plain' ? '12.5% without indexation' : '20% with indexation'}.`,
    },
    gain: 'Capital gain',
    held: 'Held for',
    heldValue: (m: number) => {
      const y = Math.floor(m / 12);
      const r = m % 12;
      return [y ? `${y} yr` : '', r ? `${r} mo` : ''].filter(Boolean).join(' ') || '0 mo';
    },
    longTerm: 'long term',
    shortTerm: 'short term',
    saved: 'Tax saved by exemptions',
    cess: 'Add 4% health and education cess, and surcharge if your income is high. This estimate leaves them out.',
    compare: 'Both ways, side by side',
    compareShort: 'How the tax is worked out',
    plainCol: '12.5% without indexation',
    indexedCol: '20% with indexation',
    slabCol: (s: number) => `Slab rate ${s}%`,
    pays: 'You pay this',
    higher: 'Higher, not used',
    na: 'Does not apply to this sale',
    net: 'Net sale price',
    cost: 'Cost used',
    costIndexed: (a: number, b: number) => `CII ${a} to ${b}`,
    exemptions: 'Exemptions',
    taxable: 'Taxable gain',
    tax: 'Tax',
    barsLead: 'Each bar is your net sale price. The dark end is the tax.',
    barPurchase: 'Purchase price',
    barIndexed: 'Added by indexation',
    barExempt: 'Exempt',
    barRest: 'Gain after tax',
    reinvest: 'Save tax by reinvesting',
    reinvestLead: 'These exemptions apply only to long-term gains. Enter what you invest to see the tax fall.',
    s54: 'Section 54: cost of the new house',
    s54Hint: 'Buy within 1 year before or 2 years after the sale, or build within 3 years. Cost above ₹10 crore does not count.',
    s54f: 'Section 54F: money put into a new house',
    s54fHint: 'The exemption is in proportion to the net sale price you invest. It needs you to own no more than one other house.',
    s54ec: 'Section 54EC: capital gain bonds',
    s54ecHint: 'NHAI, REC, PFC or IRFC bonds bought within 6 months of the sale. Up to ₹50 lakh.',
  },
  hi: {
    details: 'बिक्री',
    asset: 'आपने क्या बेचा?',
    house: 'मकान या फ़्लैट',
    land: 'ज़मीन, प्लॉट या दुकान',
    sale: 'बिक्री मूल्य',
    purchase: 'खरीद मूल्य',
    purchaseHint: '1 अप्रैल 2001 से पहले खरीदा? 1 अप्रैल 2001 का उचित बाज़ार मूल्य और वही तारीख डालें।',
    bought: 'खरीद की तारीख',
    sold: 'बिक्री की तारीख',
    expenses: 'ट्रांसफ़र खर्च',
    expensesHint: 'ब्रोकरेज, कानूनी फ़ीस और बिक्री के अन्य खर्च।',
    slab: 'आपका इनकम टैक्स स्लैब',
    slabHint: 'केवल अल्पकालिक लाभ के लिए उपयोग होता है।',
    cii: (fy: number) => `वित्त वर्ष ${fyLabel(fy)} का कॉस्ट इन्फ़्लेशन इंडेक्स`,
    ciiHint: 'यह साल अभी टेबल में नहीं है। CBDT का अधिसूचित इंडेक्स डालें। तब तक हम 376 (वित्त वर्ष 2025-26) लेते हैं।',
    dateError: 'बिक्री की तारीख खरीद की तारीख के बाद होनी चाहिए।',
    result: 'अनुमानित टैक्स',
    why: {
      short: 'आपने प्रॉपर्टी 24 महीने या उससे कम रखी, इसलिए लाभ अल्पकालिक है और आपके स्लैब पर टैक्स लगता है।',
      old: 'आपने 23 जुलाई 2024 से पहले बेचा, इसलिए इंडेक्सेशन के साथ 20% लागू है।',
      new: 'आपने 23 जुलाई 2024 या उसके बाद खरीदा, इसलिए केवल बिना इंडेक्सेशन 12.5% लागू है।',
      choice: (p: Pick2) =>
        `आपने 23 जुलाई 2024 से पहले खरीदा और उसके बाद बेचा, इसलिए निवासी व्यक्ति या HUF दोनों में से कम टैक्स देता है। यहाँ वह ${p === 'plain' ? 'बिना इंडेक्सेशन 12.5%' : 'इंडेक्सेशन के साथ 20%'} है।`,
    },
    gain: 'कैपिटल गेन',
    held: 'कितने समय रखी',
    heldValue: (m: number) => {
      const y = Math.floor(m / 12);
      const r = m % 12;
      return [y ? `${y} साल` : '', r ? `${r} महीने` : ''].filter(Boolean).join(' ') || '0 महीने';
    },
    longTerm: 'दीर्घकालिक',
    shortTerm: 'अल्पकालिक',
    saved: 'छूट से बचा टैक्स',
    cess: '4% हेल्थ और एजुकेशन सेस जोड़ें, और आय ज़्यादा हो तो सरचार्ज भी। यह अनुमान इन्हें नहीं जोड़ता।',
    compare: 'दोनों तरीके, साथ-साथ',
    compareShort: 'टैक्स कैसे निकला',
    plainCol: 'बिना इंडेक्सेशन 12.5%',
    indexedCol: 'इंडेक्सेशन के साथ 20%',
    slabCol: (s: number) => `स्लैब दर ${s}%`,
    pays: 'आप यह देंगे',
    higher: 'ज़्यादा, लागू नहीं',
    na: 'इस बिक्री पर लागू नहीं',
    net: 'शुद्ध बिक्री मूल्य',
    cost: 'ली गई लागत',
    costIndexed: (a: number, b: number) => `CII ${a} से ${b}`,
    exemptions: 'छूट',
    taxable: 'टैक्स योग्य लाभ',
    tax: 'टैक्स',
    barsLead: 'हर पट्टी आपका शुद्ध बिक्री मूल्य है। गहरा सिरा टैक्स है।',
    barPurchase: 'खरीद मूल्य',
    barIndexed: 'इंडेक्सेशन से जुड़ा',
    barExempt: 'छूट',
    barRest: 'टैक्स के बाद लाभ',
    reinvest: 'दोबारा निवेश करके टैक्स बचाएँ',
    reinvestLead: 'ये छूट केवल दीर्घकालिक लाभ पर मिलती हैं। निवेश की राशि डालें और देखें टैक्स कितना घटता है।',
    s54: 'धारा 54: नए मकान की लागत',
    s54Hint: 'बिक्री से 1 साल पहले या 2 साल बाद तक खरीदें, या 3 साल में बनवाएँ। ₹10 करोड़ से ऊपर की लागत नहीं गिनी जाती।',
    s54f: 'धारा 54F: नए मकान में लगाई राशि',
    s54fHint: 'छूट उतने अनुपात में मिलती है जितना शुद्ध बिक्री मूल्य आप लगाते हैं। शर्त: आपके पास एक से ज़्यादा दूसरा मकान न हो।',
    s54ec: 'धारा 54EC: कैपिटल गेन बॉन्ड',
    s54ecHint: 'बिक्री के 6 महीने में NHAI, REC, PFC या IRFC बॉन्ड। ₹50 लाख तक।',
  },
};

export const SLABS = [0, 5, 10, 15, 20, 25, 30] as const;

export const CG_PAGE = {
  en: {
    heading: 'Capital gains tax calculator for property',
    lead: 'Enter the sale and purchase details. See the tax at 12.5% without indexation and at 20% with indexation, and which one you pay.',
    rulesTitle: 'Which rate applies',
    rules: [
      'Held for 24 months or less: the gain is short term and is added to your income at your slab rate.',
      'Sold before 23 July 2024: 20% on the gain after indexation.',
      'Bought on or after 23 July 2024: 12.5% on the gain, without indexation.',
      'Bought before 23 July 2024 and sold on or after it: a resident individual or HUF can pay the lower of 12.5% without indexation and 20% with indexation. Others pay 12.5%.',
    ],
    indexTitle: 'How indexation works',
    index:
      'Indexation raises your purchase price for inflation with the Cost Inflation Index (CII). Indexed cost = purchase price × CII of the sale year ÷ CII of the purchase year.',
    example: [
      'Bought in FY 2010-11 for ₹30,00,000 (CII 167) and sold in October 2024 for ₹1,20,00,000 (CII 363).',
      'Indexed cost = ₹30,00,000 × 363 ÷ 167 = ₹65,20,958.',
      'With indexation: gain ₹54,79,042, tax at 20% = ₹10,95,808.',
      'Without indexation: gain ₹90,00,000, tax at 12.5% = ₹11,25,000.',
      'A resident individual pays the lower amount, ₹10,95,808.',
    ],
    exTitle: 'Exemptions: Section 54, 54EC and 54F',
    ex: [
      { h: 'Section 54', t: 'You sell a house and buy or build another house. The exemption is up to the capital gain; the cost of the new house counts up to ₹10 crore. Buy within 1 year before or 2 years after the sale, or build within 3 years. Keep the new house for 3 years.' },
      { h: 'Section 54EC', t: 'You sell land or a building and buy NHAI, REC, PFC or IRFC bonds within 6 months. Up to ₹50 lakh in a financial year. The bonds are locked for 5 years.' },
      { h: 'Section 54F', t: 'You sell an asset that is not a house, such as a plot, and put the net sale money into a house. The exemption is in proportion to the amount invested, with the new house counted up to ₹10 crore.' },
    ],
    actNote: 'The section numbers are those of the Income-tax Act, 1961. The Income-tax Act, 2025 applies from 1 April 2026 and numbers these rules differently. Check your case with a tax adviser.',
    ciiTitle: 'Cost Inflation Index by year',
    fy: 'Financial year',
    ciiCol: 'CII',
    faqTitle: 'Capital gains tax: questions people ask',
  },
  hi: {
    heading: 'प्रॉपर्टी पर कैपिटल गेन्स टैक्स कैलकुलेटर',
    lead: 'बिक्री और खरीद की जानकारी डालें। बिना इंडेक्सेशन 12.5% और इंडेक्सेशन के साथ 20% पर टैक्स देखें, और जानें कौन सा देना है।',
    rulesTitle: 'कौन सी दर लागू है',
    rules: [
      '24 महीने या उससे कम रखी: लाभ अल्पकालिक है और आपकी आय में जुड़कर स्लैब दर पर टैक्स लगता है।',
      '23 जुलाई 2024 से पहले बेची: इंडेक्सेशन के बाद के लाभ पर 20%।',
      '23 जुलाई 2024 या उसके बाद खरीदी: लाभ पर बिना इंडेक्सेशन 12.5%।',
      '23 जुलाई 2024 से पहले खरीदी और उसके बाद बेची: निवासी व्यक्ति या HUF बिना इंडेक्सेशन 12.5% और इंडेक्सेशन के साथ 20% में से कम टैक्स दे सकता है। बाकी 12.5% देते हैं।',
    ],
    indexTitle: 'इंडेक्सेशन कैसे काम करता है',
    index:
      'इंडेक्सेशन कॉस्ट इन्फ़्लेशन इंडेक्स (CII) से आपकी खरीद कीमत को महँगाई के हिसाब से बढ़ाता है। इंडेक्स्ड लागत = खरीद मूल्य × बिक्री वर्ष का CII ÷ खरीद वर्ष का CII।',
    example: [
      'वित्त वर्ष 2010-11 में ₹30,00,000 में खरीदी (CII 167) और अक्टूबर 2024 में ₹1,20,00,000 में बेची (CII 363)।',
      'इंडेक्स्ड लागत = ₹30,00,000 × 363 ÷ 167 = ₹65,20,958।',
      'इंडेक्सेशन के साथ: लाभ ₹54,79,042, 20% पर टैक्स = ₹10,95,808।',
      'बिना इंडेक्सेशन: लाभ ₹90,00,000, 12.5% पर टैक्स = ₹11,25,000।',
      'निवासी व्यक्ति कम राशि, ₹10,95,808, देता है।',
    ],
    exTitle: 'छूट: धारा 54, 54EC और 54F',
    ex: [
      { h: 'धारा 54', t: 'आप मकान बेचकर दूसरा मकान खरीदते या बनवाते हैं। छूट कैपिटल गेन तक मिलती है; नए मकान की लागत ₹10 करोड़ तक गिनी जाती है। बिक्री से 1 साल पहले या 2 साल बाद तक खरीदें, या 3 साल में बनवाएँ। नया मकान 3 साल रखें।' },
      { h: 'धारा 54EC', t: 'आप ज़मीन या इमारत बेचकर 6 महीने में NHAI, REC, PFC या IRFC बॉन्ड खरीदते हैं। एक वित्त वर्ष में ₹50 लाख तक। बॉन्ड 5 साल लॉक रहते हैं।' },
      { h: 'धारा 54F', t: 'आप मकान के अलावा कोई संपत्ति, जैसे प्लॉट, बेचते हैं और शुद्ध बिक्री राशि मकान में लगाते हैं। छूट लगाई गई राशि के अनुपात में मिलती है, नया मकान ₹10 करोड़ तक गिना जाता है।' },
    ],
    actNote: 'धारा संख्याएँ आयकर अधिनियम, 1961 की हैं। 1 अप्रैल 2026 से आयकर अधिनियम, 2025 लागू है, जिसमें इन नियमों की संख्या अलग है। अपने मामले की जाँच टैक्स सलाहकार से कराएँ।',
    ciiTitle: 'साल के हिसाब से कॉस्ट इन्फ़्लेशन इंडेक्स',
    fy: 'वित्त वर्ष',
    ciiCol: 'CII',
    faqTitle: 'कैपिटल गेन्स टैक्स: अक्सर पूछे जाने वाले सवाल',
  },
};

export const CG_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What is capital gains tax on property in India?',
      a: 'It is the tax on the profit from selling a property. If you held it for more than 24 months, the gain is long term. From 23 July 2024 a long-term gain is taxed at 12.5% without indexation; for property bought before that date, a resident individual or HUF can choose 20% with indexation if that is lower. A short-term gain is added to your income and taxed at your slab rate.',
    },
    {
      q: 'Which rate applies to a sale after 23 July 2024?',
      a: 'If you bought the property on or after 23 July 2024, only 12.5% without indexation applies. If you bought it before that date, a resident individual or HUF pays the lower of 12.5% without indexation and 20% with indexation. The calculator shows both.',
    },
    {
      q: 'What is indexation benefit?',
      a: 'Indexation raises the purchase price for inflation with the Cost Inflation Index: indexed cost = purchase price × CII of the sale year ÷ CII of the purchase year. Example: bought in 2015-16 for ₹50 lakh (CII 254) and sold in 2025-26 for ₹1.5 crore (CII 376). The indexed cost is ₹74,01,575, so the gain falls from ₹1 crore to ₹75,98,425. Here 12.5% on ₹1 crore (₹12.5 lakh) is still less than 20% on ₹75,98,425 (₹15,19,685).',
    },
    {
      q: 'How can I save capital gains tax on a property sale?',
      a: 'Section 54: put the gain into another house (new-house cost counted up to ₹10 crore). Section 54EC: buy NHAI, REC, PFC or IRFC bonds within 6 months, up to ₹50 lakh. Section 54F: if you sold something other than a house, put the net sale money into a house. Each has conditions and time limits.',
    },
    {
      q: 'What is the difference between LTCG and STCG on property?',
      a: 'LTCG (long-term capital gain) applies when you held the property for more than 24 months, at 12.5% or 20% as explained above. STCG (short-term capital gain) applies when you held it for 24 months or less; the gain is added to your income and taxed at your slab rate.',
    },
    {
      q: 'What is the CII for 2025-26?',
      a: 'The Cost Inflation Index for FY 2025-26 is 376. It was 363 for 2024-25, 348 for 2023-24 and 331 for 2022-23. CBDT notifies a new value each year.',
    },
    {
      q: 'Do I pay tax if I sell and do not buy another property?',
      a: 'Yes, unless you claim an exemption. To save tax without buying a house, you can buy 54EC bonds (up to ₹50 lakh) within 6 months of the sale.',
    },
  ],
  hi: [
    {
      q: 'भारत में प्रॉपर्टी पर कैपिटल गेन्स टैक्स क्या है?',
      a: 'यह प्रॉपर्टी बेचने के मुनाफ़े पर टैक्स है। 24 महीने से ज़्यादा रखी हो तो लाभ दीर्घकालिक है। 23 जुलाई 2024 से दीर्घकालिक लाभ पर बिना इंडेक्सेशन 12.5% टैक्स है; उस तारीख से पहले खरीदी प्रॉपर्टी पर निवासी व्यक्ति या HUF कम होने पर इंडेक्सेशन के साथ 20% चुन सकता है। अल्पकालिक लाभ आय में जुड़कर स्लैब दर पर टैक्स होता है।',
    },
    {
      q: '23 जुलाई 2024 के बाद की बिक्री पर कौन सी दर लागू है?',
      a: 'अगर प्रॉपर्टी 23 जुलाई 2024 या उसके बाद खरीदी, तो केवल बिना इंडेक्सेशन 12.5% लागू है। अगर उससे पहले खरीदी, तो निवासी व्यक्ति या HUF बिना इंडेक्सेशन 12.5% और इंडेक्सेशन के साथ 20% में से कम टैक्स देता है। कैलकुलेटर दोनों दिखाता है।',
    },
    {
      q: 'इंडेक्सेशन का लाभ क्या है?',
      a: 'इंडेक्सेशन कॉस्ट इन्फ़्लेशन इंडेक्स से खरीद मूल्य को महँगाई के हिसाब से बढ़ाता है: इंडेक्स्ड लागत = खरीद मूल्य × बिक्री वर्ष का CII ÷ खरीद वर्ष का CII। उदाहरण: 2015-16 में ₹50 लाख में खरीदी (CII 254) और 2025-26 में ₹1.5 करोड़ में बेची (CII 376)। इंडेक्स्ड लागत ₹74,01,575 है, तो लाभ ₹1 करोड़ से घटकर ₹75,98,425 होता है। यहाँ ₹1 करोड़ पर 12.5% (₹12.5 लाख) फिर भी ₹75,98,425 पर 20% (₹15,19,685) से कम है।',
    },
    {
      q: 'प्रॉपर्टी बेचने पर कैपिटल गेन्स टैक्स कैसे बचाएँ?',
      a: 'धारा 54: लाभ को दूसरे मकान में लगाएँ (नए मकान की लागत ₹10 करोड़ तक गिनी जाती है)। धारा 54EC: 6 महीने में NHAI, REC, PFC या IRFC बॉन्ड खरीदें, ₹50 लाख तक। धारा 54F: मकान के अलावा कुछ बेचा हो तो शुद्ध बिक्री राशि मकान में लगाएँ। हर छूट की शर्तें और समय सीमा हैं।',
    },
    {
      q: 'प्रॉपर्टी पर LTCG और STCG में क्या अंतर है?',
      a: 'LTCG (दीर्घकालिक पूंजीगत लाभ) तब है जब प्रॉपर्टी 24 महीने से ज़्यादा रखी हो, ऊपर बताए अनुसार 12.5% या 20% पर। STCG (अल्पकालिक पूंजीगत लाभ) तब है जब 24 महीने या उससे कम रखी हो; लाभ आय में जुड़कर स्लैब दर पर टैक्स होता है।',
    },
    {
      q: '2025-26 का CII कितना है?',
      a: 'वित्त वर्ष 2025-26 का कॉस्ट इन्फ़्लेशन इंडेक्स 376 है। 2024-25 में यह 363, 2023-24 में 348 और 2022-23 में 331 था। CBDT हर साल नया मान अधिसूचित करता है।',
    },
    {
      q: 'बेचकर दूसरी प्रॉपर्टी न खरीदूँ तो क्या टैक्स देना होगा?',
      a: 'हाँ, जब तक आप कोई छूट न लें। मकान खरीदे बिना टैक्स बचाने के लिए बिक्री के 6 महीने में 54EC बॉन्ड (₹50 लाख तक) खरीद सकते हैं।',
    },
  ],
};

export const CG_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: 'How to calculate capital gains tax on a property sale',
    description: 'Step-by-step guide to the tax on a property sale in India, with and without indexation.',
    steps: [
      { name: 'Enter the sale and purchase prices', text: 'Use the amounts in the sale deed and the purchase deed.' },
      { name: 'Enter the purchase and sale dates', text: 'The dates decide if the gain is long term (more than 24 months) and which rate applies.' },
      { name: 'Add transfer expenses', text: 'Brokerage, legal fees and other costs of the sale come off the sale price.' },
      { name: 'Compare both rates', text: 'See the tax at 12.5% without indexation and at 20% with indexation, and which one you pay.' },
      { name: 'Try the exemptions', text: 'Enter what you put into a new house or 54EC bonds to see how much tax you save.' },
    ],
  },
  hi: {
    name: 'प्रॉपर्टी बिक्री पर कैपिटल गेन्स टैक्स कैसे निकालें',
    description: 'भारत में प्रॉपर्टी बिक्री पर इंडेक्सेशन के साथ और बिना टैक्स निकालने का आसान तरीका।',
    steps: [
      { name: 'बिक्री और खरीद मूल्य डालें', text: 'बिक्री डीड और खरीद डीड की राशि लें।' },
      { name: 'खरीद और बिक्री की तारीख डालें', text: 'तारीखों से तय होता है कि लाभ दीर्घकालिक (24 महीने से ज़्यादा) है या नहीं, और कौन सी दर लागू है।' },
      { name: 'ट्रांसफ़र खर्च जोड़ें', text: 'ब्रोकरेज, कानूनी फ़ीस और बिक्री के अन्य खर्च बिक्री मूल्य से घटते हैं।' },
      { name: 'दोनों दरों की तुलना करें', text: 'बिना इंडेक्सेशन 12.5% और इंडेक्सेशन के साथ 20% पर टैक्स देखें, और जानें कौन सा देना है।' },
      { name: 'छूट आज़माएँ', text: 'नए मकान या 54EC बॉन्ड में लगाई राशि डालें और देखें कितना टैक्स बचता है।' },
    ],
  },
};

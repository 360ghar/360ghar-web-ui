/**
 * 3D floor planner page text. SEO title, description, keywords, the loading
 * text and the iframe title come from tools.json (tools:designBlueprint).
 * The FAQ and steps are the old page's, shortened, with Hindi added.
 */
import type { Faq, HowTo } from '../seo';

export const BP_UI = {
  en: {
    failTitle: 'The 3D planner did not load',
    failBody: 'Check your connection, then try again. The planner needs a few megabytes the first time.',
    retry: 'Try again',
    full: 'Open the planner in a full window',
    vastu: 'Check the Vastu of your design',
  },
  hi: {
    failTitle: '3D प्लानर लोड नहीं हुआ',
    failBody: 'अपना कनेक्शन जाँचें, फिर दोबारा कोशिश करें। पहली बार प्लानर को कुछ MB डाउनलोड करने होते हैं।',
    retry: 'दोबारा कोशिश करें',
    full: 'प्लानर को पूरी विंडो में खोलें',
    vastu: 'अपने डिज़ाइन का वास्तु जाँचें',
  },
};

export const BP_PAGE = {
  en: {
    heading: '3D floor planner',
    lead: 'Draw your floor plan, add doors and furniture, then walk through it in 3D. Free, in your browser, with no sign-up.',
    stepsTitle: 'How to use the planner',
    tipsTitle: 'Tips for an Indian home layout',
    tips: [
      'Start with the exact plot size, so the plan fits the land and the setbacks in the local building bylaws.',
      'Place living rooms and bedrooms for cross ventilation. Good airflow cuts the need for air conditioning.',
      'Leave room to grow: space for one more room, a terrace or a larger kitchen later.',
      'If Vastu matters to you, plan the entrance, kitchen, bedrooms and toilets first, then check the plan with the Vastu checker.',
    ],
    faqTitle: '3D floor planner: questions people ask',
    howToName: 'How to design a 3D floor plan',
    howToDesc: 'Create a 2D floor plan with walls, rooms and furniture, then see it in 3D with the free planner.',
  },
  hi: {
    heading: '3D फ़्लोर प्लानर',
    lead: 'अपना फ़्लोर प्लान बनाएँ, दरवाज़े और फ़र्नीचर जोड़ें, फिर उसे 3D में देखें। मुफ़्त, ब्राउज़र में, बिना साइन-अप।',
    stepsTitle: 'प्लानर कैसे इस्तेमाल करें',
    tipsTitle: 'भारतीय घर के लेआउट के सुझाव',
    tips: [
      'प्लॉट के सही नाप से शुरू करें, ताकि प्लान ज़मीन और स्थानीय बिल्डिंग नियमों के सेटबैक में फ़िट हो।',
      'लिविंग रूम और बेडरूम ऐसे रखें कि हवा आर-पार आए। अच्छी हवा से AC की ज़रूरत कम होती है।',
      'आगे बढ़ाने की जगह छोड़ें: बाद में एक और कमरा, छत या बड़ी रसोई के लिए।',
      'अगर वास्तु ज़रूरी है, तो पहले प्रवेश, रसोई, बेडरूम और टॉयलेट तय करें, फिर वास्तु चेकर से प्लान जाँचें।',
    ],
    faqTitle: '3D फ़्लोर प्लानर: अक्सर पूछे जाने वाले सवाल',
    howToName: '3D फ़्लोर प्लान कैसे बनाएँ',
    howToDesc: 'दीवारों, कमरों और फ़र्नीचर के साथ 2D फ़्लोर प्लान बनाएँ, फिर मुफ़्त प्लानर में उसे 3D में देखें।',
  },
};

export const BP_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: BP_PAGE.en.howToName,
    description: BP_PAGE.en.howToDesc,
    steps: [
      { name: 'Open the 3D floor plan designer', text: 'The planner opens on this page. No sign-up or download is needed.' },
      { name: 'Draw walls and rooms', text: 'Choose the floor plan view and click on the grid to draw walls and rooms.' },
      { name: 'Add furniture and doors', text: 'Add doors, windows and furniture from the item catalogue, then move them into place.' },
      { name: 'Switch to 3D view to preview', text: 'Open the 3D view to walk through your design and check sizes from any angle.' },
    ],
  },
  hi: {
    name: BP_PAGE.hi.howToName,
    description: BP_PAGE.hi.howToDesc,
    steps: [
      { name: '3D फ़्लोर प्लान डिज़ाइनर खोलें', text: 'प्लानर इसी पेज पर खुलता है। साइन-अप या डाउनलोड की ज़रूरत नहीं।' },
      { name: 'दीवारें और कमरे बनाएँ', text: 'फ़्लोर प्लान व्यू चुनें और ग्रिड पर क्लिक करके दीवारें और कमरे बनाएँ।' },
      { name: 'फ़र्नीचर और दरवाज़े जोड़ें', text: 'आइटम कैटलॉग से दरवाज़े, खिड़कियाँ और फ़र्नीचर जोड़ें, फिर उन्हें सही जगह रखें।' },
      { name: '3D व्यू में देखें', text: '3D व्यू खोलें और हर कोण से अपना डिज़ाइन और नाप देखें।' },
    ],
  },
};

export const BP_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What is a 3D floor planner?',
      a: 'A tool to draw a 2D floor plan and see it in 3D at once. You draw rooms, add furniture, doors and windows, then walk through the design. It is free and runs in your browser.',
    },
    {
      q: 'How do I create a floor plan for my Indian home?',
      a: '1) Open the planner above. 2) Draw walls and rooms on the 2D grid. 3) Add doors and windows. 4) Place beds, a sofa and a kitchen counter from the catalogue. 5) Switch to the 3D view to see the plan from any angle.',
    },
    {
      q: 'Can I design according to Vastu Shastra?',
      a: 'Yes, you can place rooms as Vastu suggests. For a full check, save a screenshot of your plan and upload it to the Vastu checker for a score and room-by-room notes.',
    },
    {
      q: 'What is the difference between 2D and 3D floor plans?',
      a: 'A 2D plan is a top-down map of rooms, walls and sizes. A 3D plan shows the same layout as a model you can rotate and walk through, which makes sizes and furniture placement easier to judge.',
    },
    {
      q: 'Can I export my floor plan design?',
      a: 'Yes. Save the design as a file (JSON) to open it again later or share it with your architect, or download it as an image.',
    },
    {
      q: 'Is the 3D design tool free to use?',
      a: 'Yes. There are no charges, no paid tiers and no sign-up. Your design stays on your device unless you save or share the file.',
    },
  ],
  hi: [
    {
      q: '3D फ़्लोर प्लानर क्या है?',
      a: 'यह एक टूल है जिसमें आप 2D फ़्लोर प्लान बनाते हैं और उसे तुरंत 3D में देखते हैं। कमरे बनाएँ, फ़र्नीचर, दरवाज़े और खिड़कियाँ जोड़ें, फिर डिज़ाइन में घूमकर देखें। यह मुफ़्त है और ब्राउज़र में चलता है।',
    },
    {
      q: 'अपने भारतीय घर का फ़्लोर प्लान कैसे बनाएँ?',
      a: '1) ऊपर प्लानर खोलें। 2) 2D ग्रिड पर दीवारें और कमरे बनाएँ। 3) दरवाज़े और खिड़कियाँ जोड़ें। 4) कैटलॉग से बेड, सोफ़ा और किचन काउंटर रखें। 5) 3D व्यू में हर कोण से प्लान देखें।',
    },
    {
      q: 'क्या वास्तु शास्त्र के अनुसार डिज़ाइन कर सकते हैं?',
      a: 'हाँ, आप कमरे वास्तु के अनुसार रख सकते हैं। पूरी जाँच के लिए प्लान का स्क्रीनशॉट लें और स्कोर व कमरे-दर-कमरे नोट्स के लिए वास्तु चेकर पर अपलोड करें।',
    },
    {
      q: '2D और 3D फ़्लोर प्लान में क्या फ़र्क है?',
      a: '2D प्लान ऊपर से दिखने वाला नक्शा है जिसमें कमरे, दीवारें और नाप होते हैं। 3D प्लान वही लेआउट एक मॉडल की तरह दिखाता है जिसे घुमाकर देख सकते हैं, जिससे नाप और फ़र्नीचर की जगह समझना आसान होता है।',
    },
    {
      q: 'क्या मैं अपना फ़्लोर प्लान एक्सपोर्ट कर सकता हूँ?',
      a: 'हाँ। डिज़ाइन को फ़ाइल (JSON) के रूप में सेव करें ताकि बाद में खोल सकें या आर्किटेक्ट को भेज सकें, या उसे इमेज के रूप में डाउनलोड करें।',
    },
    {
      q: 'क्या 3D डिज़ाइन टूल मुफ़्त है?',
      a: 'हाँ। कोई शुल्क नहीं, कोई पेड प्लान नहीं और साइन-अप नहीं। जब तक आप फ़ाइल सेव या शेयर न करें, डिज़ाइन आपके डिवाइस पर ही रहता है।',
    },
  ],
};

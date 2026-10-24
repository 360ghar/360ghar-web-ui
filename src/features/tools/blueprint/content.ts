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
    lead: 'Draw a floor-plan concept, place doors and furniture, and view it in 3D. The planner does not validate measurements, approvals, building rules, or structural safety.',
    stepsTitle: 'How to use the planner',
    tipsTitle: 'Planning notes',
    tips: [
      'Treat dimensions as planning inputs. The planner does not check survey boundaries, setbacks, local building rules, or approvals.',
      'Use the layout as a visual concept. Ask a qualified professional to review ventilation, structure, and site constraints.',
      'Leave room to grow: space for one more room, a terrace or a larger kitchen later.',
      'If you use Vastu guidance, treat the separate checker as an interpretation, not a certification.',
    ],
    faqTitle: '3D floor planner: questions people ask',
    howToName: 'How to design a 3D floor plan',
    howToDesc: 'Sketch a plan and review it in 3D. The output is not a construction document.',
  },
  hi: {
    heading: '3D फ़्लोर प्लानर',
    lead: 'फ़्लोर प्लान का एक विचार बनाएँ, दरवाज़े और फ़र्नीचर रखें और उसे 3D में देखें। यह प्लानर नाप, मंज़ूरी, स्थानीय नियम या ढाँचे की सुरक्षा नहीं जाँचता।',
    stepsTitle: 'प्लानर कैसे इस्तेमाल करें',
    tipsTitle: 'प्लानिंग नोट',
    tips: [
      'नाप को प्लानिंग इनपुट मानें। प्लानर सर्वे सीमा, सेटबैक, स्थानीय बिल्डिंग नियम या मंज़ूरी नहीं जाँचता।',
      'लेआउट को दृश्य विचार की तरह लें। वेंटिलेशन, ढाँचे और साइट की ज़रूरतें किसी योग्य विशेषज्ञ से जाँचें।',
      'आगे बढ़ाने की जगह छोड़ें: बाद में एक और कमरा, छत या बड़ी रसोई के लिए।',
      'वास्तु मार्गदर्शन लें, तो अलग चेकर के नतीजे को व्याख्या मानें, प्रमाणपत्र नहीं।',
    ],
    faqTitle: '3D फ़्लोर प्लानर: अक्सर पूछे जाने वाले सवाल',
    howToName: '3D फ़्लोर प्लान कैसे बनाएँ',
    howToDesc: 'दीवारों, कमरों और फ़र्नीचर के साथ प्लान का विचार बनाएँ और 3D व्यू में देखें। यह निर्माण दस्तावेज़ नहीं है।',
  },
};

export const BP_HOWTO: Record<'en' | 'hi', HowTo> = {
  en: {
    name: BP_PAGE.en.howToName,
    description: BP_PAGE.en.howToDesc,
    steps: [
      { name: 'Open the 3D floor plan designer', text: 'The planner opens on this page.' },
      { name: 'Draw walls and rooms', text: 'Choose the floor plan view and click on the grid to draw walls and rooms.' },
      { name: 'Add furniture and doors', text: 'Add doors, windows and furniture from the item catalogue, then move them into place.' },
      { name: 'Switch to 3D view to preview', text: 'Review the visual concept from different angles. Do not use it for construction measurements.' },
    ],
  },
  hi: {
    name: BP_PAGE.hi.howToName,
    description: BP_PAGE.hi.howToDesc,
    steps: [
      { name: '3D फ़्लोर प्लान डिज़ाइनर खोलें', text: 'प्लानर इसी पेज पर खुलता है।' },
      { name: 'दीवारें और कमरे बनाएँ', text: 'फ़्लोर प्लान व्यू चुनें और ग्रिड पर क्लिक करके दीवारें और कमरे बनाएँ।' },
      { name: 'फ़र्नीचर और दरवाज़े जोड़ें', text: 'आइटम कैटलॉग से दरवाज़े, खिड़कियाँ और फ़र्नीचर जोड़ें, फिर उन्हें सही जगह रखें।' },
      { name: '3D व्यू में देखें', text: 'अलग-अलग कोण से दृश्य विचार देखें। इसे निर्माण के नाप के लिए इस्तेमाल न करें।' },
    ],
  },
};

export const BP_FAQ: Record<'en' | 'hi', Faq[]> = {
  en: [
    {
      q: 'What is a 3D floor planner?',
      a: 'An interactive tool to sketch rooms in 2D and view the layout in 3D. The result is a visual concept, not a measured or approved plan.',
    },
    {
      q: 'How do I create a floor plan for my Indian home?',
      a: '1) Open the planner above. 2) Draw walls and rooms on the 2D grid. 3) Add doors and windows. 4) Place items from the catalogue. 5) Switch to the 3D view to review the visual concept.',
    },
    {
      q: 'Can I design according to Vastu Shastra?',
      a: 'You can arrange rooms as you choose. The separate Vastu checker applies its own rule set and does not certify a plan.',
    },
    {
      q: 'What is the difference between 2D and 3D floor plans?',
      a: 'A 2D view shows a plan from above. A 3D view presents the layout as a model. Verify all dimensions against suitable plans before you rely on them.',
    },
    {
      q: 'Can I export my floor plan design?',
      a: 'Yes. Save the design as a file (JSON) to open it again later or share it with your architect, or download it as an image.',
    },
    {
      q: 'Can I use the planner output for construction?',
      a: 'No. It does not validate dimensions, land boundaries, building rules, approvals, services, or structural safety. Ask a qualified professional to review the project documents.',
    },
  ],
  hi: [
    {
      q: '3D फ़्लोर प्लानर क्या है?',
      a: 'यह एक इंटरैक्टिव टूल है जिसमें 2D में कमरे बनाकर लेआउट को 3D में देखा जा सकता है। नतीजा दृश्य विचार है, नाप वाला या मंज़ूर प्लान नहीं।',
    },
    {
      q: 'अपने भारतीय घर का फ़्लोर प्लान कैसे बनाएँ?',
      a: '1) ऊपर प्लानर खोलें। 2) 2D ग्रिड पर दीवारें और कमरे बनाएँ। 3) दरवाज़े और खिड़कियाँ जोड़ें। 4) कैटलॉग से बेड, सोफ़ा और किचन काउंटर रखें। 5) 3D व्यू में हर कोण से प्लान देखें।',
    },
    {
      q: 'क्या वास्तु शास्त्र के अनुसार डिज़ाइन कर सकते हैं?',
      a: 'आप कमरे अपनी ज़रूरत के अनुसार रख सकते हैं। अलग वास्तु चेकर अपने नियमों के आधार पर नतीजा देता है, पर प्लान को प्रमाणित नहीं करता।',
    },
    {
      q: '2D और 3D फ़्लोर प्लान में क्या फ़र्क है?',
      a: '2D व्यू में प्लान ऊपर से दिखता है। 3D व्यू लेआउट को मॉडल की तरह दिखाता है। नाप पर भरोसा करने से पहले उन्हें सही प्लान से जाँचें।',
    },
    {
      q: 'क्या मैं अपना फ़्लोर प्लान एक्सपोर्ट कर सकता हूँ?',
      a: 'हाँ। डिज़ाइन को फ़ाइल (JSON) के रूप में सेव करें ताकि बाद में खोल सकें या आर्किटेक्ट को भेज सकें, या उसे इमेज के रूप में डाउनलोड करें।',
    },
    {
      q: 'क्या प्लानर का नतीजा निर्माण के लिए इस्तेमाल कर सकते हैं?',
      a: 'नहीं। यह नाप, ज़मीन की सीमा, बिल्डिंग नियम, मंज़ूरी, सेवाएँ या ढाँचे की सुरक्षा नहीं जाँचता। प्रोजेक्ट के दस्तावेज़ किसी योग्य विशेषज्ञ से जाँचें।',
    },
  ],
};

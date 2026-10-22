/**
 * The 16 tools (18 with the legal drafters when PUBLIC_AI_OWNER_TOOLS is on): route, group, names and one-line descriptions in English and
 * Hindi. Used by /tools, the "More tools" links and the breadcrumbs.
 * `schema` is the key in lib/seo/legacy/toolSchemas.js (SoftwareApplication).
 */
import { AI_OWNER_TOOLS } from '@/lib/flags';
import type { IconName } from '@/ui/icons/paths';

export type ToolKey =
  | 'emi'
  | 'loanEligibility'
  | 'capitalGains'
  | 'stampDuty'
  | 'rentReceipt'
  | 'areaConverter'
  | 'areaCalculator'
  | 'sqFt'
  | 'acreInGaj'
  | 'mofaToRera'
  | 'propertyChecklist'
  | 'fakeListing'
  | 'verifyOwnership'
  | 'aiDesignStudio'
  | 'designBlueprint'
  | 'vastu'
  | 'rentAgreement'
  | 'legalNotice';

type GroupKey = 'money' | 'area' | 'checks' | 'design';

export type Tool = {
  key: ToolKey;
  route: string;
  group: GroupKey;
  schema: string;
  icon: IconName;
  name: { en: string; hi: string };
  desc: { en: string; hi: string };
};

export const GROUPS: { key: GroupKey; name: { en: string; hi: string } }[] = [
  { key: 'money', name: { en: 'Loans, tax and rent', hi: 'लोन, टैक्स और किराया' } },
  { key: 'area', name: { en: 'Area and land units', hi: 'एरिया और ज़मीन की इकाइयाँ' } },
  { key: 'checks', name: { en: 'Checks and papers', hi: 'जाँच और कागज़ात' } },
  { key: 'design', name: { en: 'Plan and design', hi: 'प्लान और डिज़ाइन' } },
];

const BASE_TOOLS: Tool[] = [
  {
    key: 'emi',
    route: '/emi-calculator',
    group: 'money',
    schema: 'emiCalculator',
    icon: 'rupee',
    name: { en: 'EMI calculator', hi: 'EMI कैलकुलेटर' },
    desc: {
      en: 'Monthly EMI, total interest, a yearly schedule and the effect of a prepayment.',
      hi: 'मासिक EMI, कुल ब्याज, सालाना शेड्यूल और प्रीपेमेंट का असर।',
    },
  },
  {
    key: 'loanEligibility',
    route: '/loan-eligibility-calculator',
    group: 'money',
    schema: 'loanEligibility',
    icon: 'key',
    name: { en: 'Loan eligibility calculator', hi: 'लोन पात्रता कैलकुलेटर' },
    desc: {
      en: 'How much home loan your income supports, with an estimate per bank.',
      hi: 'आपकी आय पर कितना होम लोन मिल सकता है, हर बैंक का अनुमान।',
    },
  },
  {
    key: 'capitalGains',
    route: '/capital-gains-tax-calculator',
    group: 'money',
    schema: 'capitalGains',
    icon: 'compare',
    name: { en: 'Capital gains tax calculator', hi: 'कैपिटल गेन्स टैक्स कैलकुलेटर' },
    desc: {
      en: 'Tax on a property sale: 12.5% without indexation or 20% with it, and Section 54 savings.',
      hi: 'प्रॉपर्टी बेचने पर टैक्स: बिना इंडेक्सेशन 12.5% या इंडेक्सेशन के साथ 20%, और धारा 54 की बचत।',
    },
  },
  {
    key: 'stampDuty',
    route: '/stamp-duty-calculator',
    group: 'money',
    schema: 'stampDutyCalculator',
    icon: 'building',
    name: { en: 'Stamp duty calculator', hi: 'स्टैंप ड्यूटी कैलकुलेटर' },
    desc: {
      en: 'Stamp duty and registration charges for a property in Haryana.',
      hi: 'हरियाणा में प्रॉपर्टी पर स्टैंप ड्यूटी और रजिस्ट्रेशन शुल्क।',
    },
  },
  {
    key: 'rentReceipt',
    route: '/rent-receipt',
    group: 'money',
    schema: 'rentReceipt',
    icon: 'print',
    name: { en: 'Rent receipt generator', hi: 'किराया रसीद जनरेटर' },
    desc: {
      en: 'Rent receipts for HRA, one month or a full year, ready to print or save as PDF.',
      hi: 'HRA के लिए किराया रसीद, एक महीने या पूरे साल की, प्रिंट या PDF के लिए तैयार।',
    },
  },
  {
    key: 'areaConverter',
    route: '/area-converter',
    group: 'area',
    schema: 'areaConverter',
    icon: 'area',
    name: { en: 'Area converter', hi: 'एरिया कनवर्टर' },
    desc: {
      en: 'Convert between 12 units: sq ft, gaj, acre, bigha, marla, kanal and more.',
      hi: '12 इकाइयों में बदलें: वर्ग फ़ुट, गज, एकड़, बीघा, मरला, कनाल और अन्य।',
    },
  },
  {
    key: 'areaCalculator',
    route: '/area-calculator',
    group: 'area',
    schema: 'areaCalculator',
    icon: 'home',
    name: { en: 'Carpet area calculator', hi: 'कार्पेट एरिया कैलकुलेटर' },
    desc: {
      en: 'Carpet, built-up and super built-up area from the loading factor.',
      hi: 'लोडिंग फ़ैक्टर से कार्पेट, बिल्ट-अप और सुपर बिल्ट-अप एरिया।',
    },
  },
  {
    key: 'sqFt',
    route: '/sq-ft-calculator',
    group: 'area',
    schema: 'sqFtCalculator',
    icon: 'grid',
    name: { en: 'Square feet calculator', hi: 'वर्ग फ़ुट कैलकुलेटर' },
    desc: {
      en: 'Convert sq m, sq yd, gaj and acres to square feet.',
      hi: 'वर्ग मीटर, वर्ग गज, गज और एकड़ को वर्ग फ़ुट में बदलें।',
    },
  },
  {
    key: 'acreInGaj',
    route: '/acre-in-gaj',
    group: 'area',
    schema: 'acreInGaj',
    icon: 'map',
    name: { en: 'Acre to gaj converter', hi: 'एकड़ से गज कनवर्टर' },
    desc: {
      en: '1 acre is 4,840 gaj. Convert acres, gaj and square feet.',
      hi: '1 एकड़ में 4,840 गज होते हैं। एकड़, गज और वर्ग फ़ुट बदलें।',
    },
  },
  {
    key: 'mofaToRera',
    route: '/mofa-to-rera-converter',
    group: 'area',
    schema: 'mofaToRera',
    icon: 'list',
    name: { en: 'MOFA to RERA converter', hi: 'MOFA से RERA कनवर्टर' },
    desc: {
      en: 'Convert MOFA carpet area to RERA carpet area, and back.',
      hi: 'MOFA कार्पेट एरिया को RERA कार्पेट एरिया में बदलें, और उल्टा।',
    },
  },
  {
    key: 'propertyChecklist',
    route: '/property-document-checklist',
    group: 'checks',
    schema: 'propertyChecklist',
    icon: 'check',
    name: { en: 'Property document checklist', hi: 'प्रॉपर्टी दस्तावेज़ चेकलिस्ट' },
    desc: {
      en: 'The 13 papers to check before you buy. Your ticks stay on this device.',
      hi: 'खरीदने से पहले जाँचने वाले 13 कागज़। आपके निशान इसी डिवाइस पर रहते हैं।',
    },
  },
  {
    key: 'fakeListing',
    route: '/check-fake-listing',
    group: 'checks',
    schema: 'fakeListingChecker',
    icon: 'alert',
    name: { en: 'Fake listing checker', hi: 'फ़र्ज़ी लिस्टिंग चेकर' },
    desc: {
      en: 'Paste a listing link and see the common warning signs for that portal.',
      hi: 'लिस्टिंग का लिंक डालें और उस पोर्टल के आम चेतावनी संकेत देखें।',
    },
  },
  {
    key: 'verifyOwnership',
    route: '/verify-ownership',
    group: 'checks',
    schema: 'verifyOwnership',
    icon: 'user',
    name: { en: 'Verify ownership', hi: 'मालिकाना हक़ जाँचें' },
    desc: {
      en: 'Look up the owner in Haryana Jamabandi land records.',
      hi: 'हरियाणा जमाबंदी भूमि रिकॉर्ड में मालिक देखें।',
    },
  },
  {
    key: 'aiDesignStudio',
    route: '/ai-design-studio',
    group: 'design',
    schema: 'aiDesignStudio',
    icon: 'camera',
    name: { en: 'AI Design Studio', hi: 'AI डिज़ाइन स्टूडियो' },
    desc: {
      en: 'Free AI room redesign. Describe a room or upload a photo. No sign-up.',
      hi: 'मुफ़्त AI कमरा डिज़ाइन। कमरे का वर्णन करें या फ़ोटो डालें। साइन-अप नहीं।',
    },
  },
  {
    key: 'designBlueprint',
    route: '/design-blueprint',
    group: 'design',
    schema: 'designBlueprint',
    icon: 'edit',
    name: { en: '3D floor planner', hi: '3D फ़्लोर प्लानर' },
    desc: {
      en: 'Draw walls, place furniture and walk through your plan in 3D.',
      hi: 'दीवारें बनाएँ, फ़र्नीचर रखें और अपना प्लान 3D में देखें।',
    },
  },
  {
    key: 'vastu',
    route: '/vastu-checker',
    group: 'design',
    schema: 'vastuChecker',
    icon: 'locate',
    name: { en: 'Vastu checker', hi: 'वास्तु चेकर' },
    desc: {
      en: 'Upload a floor plan and get a Vastu score with room-by-room notes.',
      hi: 'फ़्लोर प्लान डालें और कमरे-दर-कमरे नोट्स के साथ वास्तु स्कोर पाएँ।',
    },
  },
];

/** The rent agreement and legal notice drafters (backend /ai/legal-draft), listed only when the flag is on. */
const DRAFTERS: Tool[] = [
  {
    key: 'rentAgreement',
    route: '/rent-agreement-drafter',
    group: 'checks',
    schema: 'rentAgreementDrafter',
    icon: 'document',
    name: { en: 'Rent agreement drafter', hi: 'किराया समझौता ड्राफ़्टर' },
    desc: {
      en: 'A draft leave and licence agreement from standard clauses, ready to print. A draft, not legal advice.',
      hi: 'मानक धाराओं से लीव एंड लाइसेंस समझौते का ड्राफ़्ट, प्रिंट के लिए तैयार। यह ड्राफ़्ट है, क़ानूनी सलाह नहीं।',
    },
  },
  {
    key: 'legalNotice',
    route: '/legal-notice-drafter',
    group: 'checks',
    schema: 'legalNoticeDrafter',
    icon: 'document',
    name: { en: 'Legal notice drafter', hi: 'लीगल नोटिस ड्राफ़्टर' },
    desc: {
      en: 'A draft notice for a deposit refund, unpaid rent or a vacated home. A draft, not legal advice.',
      hi: 'डिपॉज़िट वापसी, बकाया किराये या घर खाली करने के लिए नोटिस का ड्राफ़्ट। यह ड्राफ़्ट है, क़ानूनी सलाह नहीं।',
    },
  },
];

export const TOOLS: Tool[] = AI_OWNER_TOOLS ? [...BASE_TOOLS, ...DRAFTERS] : BASE_TOOLS;

export const toolByKey = (key: ToolKey): Tool => TOOLS.find((t) => t.key === key)!;

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
      en: 'Estimate EMI, interest and a prepayment scenario from entered values; not a lender quote or affordability check.',
      hi: 'दर्ज मानों से EMI, ब्याज और प्रीपेमेंट का अनुमान; लेंडर का ऑफर या भुगतान-क्षमता की जाँच नहीं।',
    },
  },
  {
    key: 'loanEligibility',
    route: '/loan-eligibility-calculator',
    group: 'money',
    schema: 'loanEligibility',
    icon: 'key',
    name: { en: 'Home loan estimate', hi: 'होम लोन अनुमान' },
    desc: {
      en: 'Illustrative amount from entered values and a fixed 50% income-share assumption; not a lender offer or approval.',
      hi: 'दर्ज मानों और आय के हिस्से की तय 50% धारणा से उदाहरण; लेंडर का ऑफ़र या मंज़ूरी नहीं।',
    },
  },
  {
    key: 'capitalGains',
    route: '/capital-gains-tax-calculator',
    group: 'money',
    schema: 'capitalGains',
    icon: 'compare',
    name: { en: 'Property sale gain worksheet', hi: 'प्रॉपर्टी बिक्री लाभ वर्कशीट' },
    desc: {
      en: 'Pre-tax arithmetic on entered sale price, purchase price and transfer expenses; does not estimate income tax.',
      hi: 'दर्ज बिक्री मूल्य, खरीद मूल्य और ट्रांसफ़र खर्च की कर-पूर्व गणना; आयकर का अनुमान नहीं।',
    },
  },
  {
    key: 'stampDuty',
    route: '/stamp-duty-calculator',
    group: 'money',
    schema: 'stampDutyCalculator',
    icon: 'building',
    name: { en: 'Stamp duty estimate unavailable', hi: 'स्टैंप ड्यूटी अनुमान उपलब्ध नहीं' },
    desc: {
      en: 'Rates are withheld until an official schedule and effective date are verified.',
      hi: 'आधिकारिक दर-सूची और लागू होने की तारीख सत्यापित होने तक दरें उपलब्ध नहीं हैं।',
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
      en: 'Create a receipt from entered details. The tool does not determine HRA eligibility or confirm tax, employer or legal requirements.',
      hi: 'दर्ज जानकारी से रसीद बनाएँ। यह टूल HRA पात्रता या टैक्स, नियोक्ता और कानूनी ज़रूरतें तय नहीं करता।',
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
      en: 'Convert with this tool’s displayed factors; check local-unit definitions against your source document.',
      hi: 'इस टूल के मानों से रूपांतरण करें; स्थानीय इकाइयों की परिभाषा अपने दस्तावेज़ से जाँचें।',
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
      en: 'Illustrative area scenario from entered assumptions; not a measurement or official figure.',
      hi: 'दर्ज धारणाओं से एरिया का उदाहरण; माप या आधिकारिक मान नहीं।',
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
      en: 'Compare entered MOFA and RERA area figures using your own assumption; not a legal conversion.',
      hi: 'अपनी धारणा से दर्ज MOFA और RERA एरिया की तुलना करें; कानूनी रूपांतरण नहीं।',
    },
  },
  {
    key: 'propertyChecklist',
    route: '/property-document-checklist',
    group: 'checks',
    schema: 'propertyChecklist',
    icon: 'check',
    name: { en: 'Property document prompts', hi: 'प्रॉपर्टी दस्तावेज़ संकेत' },
    desc: {
      en: '13 non-exhaustive document prompts. Requirements vary; this tool does not review or verify documents.',
      hi: '13 गैर-सम्पूर्ण दस्तावेज़ संकेत। ज़रूरतें बदलती हैं; टूल दस्तावेज़ों की समीक्षा या पुष्टि नहीं करता।',
    },
  },
  {
    key: 'fakeListing',
    route: '/check-fake-listing',
    group: 'checks',
    schema: 'fakeListingChecker',
    icon: 'alert',
    name: { en: 'Listing URL checker', hi: 'लिस्टिंग URL जाँच' },
    desc: {
      en: 'Checks the URL host and a few patterns; it does not verify a listing or property.',
      hi: 'URL होस्ट और कुछ पैटर्न जाँचता है; लिस्टिंग या प्रॉपर्टी सत्यापित नहीं करता।',
    },
  },
  {
    key: 'verifyOwnership',
    route: '/verify-ownership',
    group: 'checks',
    schema: 'verifyOwnership',
    icon: 'user',
    name: { en: 'Jamabandi record lookup', hi: 'जमाबंदी रिकॉर्ड खोज' },
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
      en: 'Explore AI-generated room-design concepts from a prompt or photo. Results may differ from the source image.',
      hi: 'प्रॉम्प्ट या फ़ोटो से AI कमरे के डिज़ाइन विकल्प देखें। नतीजे मूल तस्वीर से अलग हो सकते हैं।',
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

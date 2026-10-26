/** Site navigation. Labels are translation keys. Paths are English; they are localised when rendered. */
import { LINKS } from '@/features/content/links/data';
import type { VignetteTheme } from '@/lib/paper/vignettes';
import type { IconName } from '@/ui/icons/paths';

type Text = { en: string; hi: string };
export type NavLink = { key: string; href: string; icon?: IconName; desc?: Text };
export type NavGroup = {
  key: string;
  links: NavLink[];
  /** Menu panel extras: a paper vignette, one line about the group, and a link to see all. */
  theme?: VignetteTheme;
  note?: Text;
  more?: NavLink;
};

export const PRIMARY: NavLink[] = [
  { key: 'site:nav.buy', href: '/gurgaon/buy/flats', icon: 'home' },
  { key: 'site:nav.rent', href: '/gurgaon/rent/flats', icon: 'key' },
  { key: 'site:nav.pg', href: '/gurgaon/pg/flats', icon: 'bed' },
  { key: 'site:nav.projects', href: '/project', icon: 'crane' },
  { key: 'site:nav.localities', href: '/localities', icon: 'pin' },
];

export const DATA_HUB: NavGroup = {
  key: 'site:nav.dataHub',
  theme: 'document',
  note: {
    en: 'Use each record as a reference. Confirm current details with its official source.',
    hi: 'हर रिकॉर्ड को संदर्भ मानें। मौजूदा जानकारी आधिकारिक स्रोत से जाँचें।',
  },
  links: [
    { key: 'site:links.circleRates', href: '/circle-rates', icon: 'map', desc: { en: 'Rate data is under review', hi: 'दर डेटा समीक्षा के अधीन है' } },
    { key: 'site:links.reraProjects', href: '/rera-projects', icon: 'building', desc: { en: 'Registered projects and builders', hi: 'रजिस्टर्ड प्रोजेक्ट और बिल्डर' } },
    { key: 'site:links.bankAuctions', href: '/bank-auctions', icon: 'gavel', desc: { en: 'Auction listings are under review', hi: 'नीलामी लिस्टिंग समीक्षा के अधीन हैं' } },
    { key: 'site:links.stampDuty', href: '/stamp-duty-calculator', icon: 'stamp', desc: { en: 'Estimate unavailable while rates are reviewed', hi: 'दर की समीक्षा तक अनुमान उपलब्ध नहीं' } },
    { key: 'site:links.verifyOwnership', href: '/verify-ownership', icon: 'document', desc: { en: 'Look up a record, not legal title', hi: 'रिकॉर्ड खोजें, कानूनी टाइटल नहीं' } },
    { key: 'site:links.zoneChecker', href: '/zone-checker', icon: 'layers', desc: { en: 'Sector records are under review', hi: 'सेक्टर रिकॉर्ड समीक्षा के अधीन हैं' } },
    { key: 'site:links.regulatoryUpdates', href: '/regulatory-updates', icon: 'news', desc: { en: 'Notification records are under review', hi: 'अधिसूचना रिकॉर्ड समीक्षा के अधीन हैं' } },
    { key: 'site:links.builderReputation', href: '/builder-reputation', icon: 'crane', desc: { en: 'Delivery record and complaints', hi: 'डिलीवरी रिकॉर्ड और शिकायतें' } },
    { key: 'projects:nav.marketPulse', href: '/market-pulse', icon: 'compare', desc: { en: 'Registrations and complaints recorded by city', hi: 'शहर के हिसाब से दर्ज रजिस्ट्री और शिकायतें' } },
    { key: 'projects:nav.projectMap', href: '/map-discovery', icon: 'map', desc: { en: 'Projects at the coordinates in their filings', hi: 'प्रोजेक्ट उनकी फ़ाइलिंग में दर्ज निर्देशांक पर' } },
    { key: 'projects:nav.watchlist', href: '/account/watchlist', icon: 'star', desc: { en: 'Projects you saved, on your 360Ghar account', hi: 'आपके सेव किए प्रोजेक्ट, आपके 360Ghar अकाउंट पर' } },
  ],
};

export const TOOLS: NavGroup = {
  key: 'site:nav.tools',
  theme: 'calculator',
  note: {
    en: 'Tools for loans, calculations, checks and design. Review each tool’s inputs, limits and terms.',
    hi: 'लोन, गणना, जाँच और डिज़ाइन के टूल। हर टूल के इनपुट, सीमाएँ और शर्तें देखें।',
  },
  more: { key: 'site:nav.allTools', href: '/tools' },
  links: [
    { key: 'site:links.emi', href: '/emi-calculator', icon: 'calculator', desc: { en: 'Monthly EMI and total interest', hi: 'मासिक EMI और कुल ब्याज' } },
    { key: 'site:links.loanEligibility', href: '/loan-eligibility-calculator', icon: 'rupee', desc: { en: 'Scenario estimate only; lenders decide eligibility and terms', hi: 'सिर्फ परिदृश्य; पात्रता और शर्तें लेंडर तय करता है' } },
    { key: 'site:links.capitalGains', href: '/capital-gains-tax-calculator', icon: 'compare', desc: { en: 'Pre-tax sale arithmetic; no tax estimate', hi: 'कर-पूर्व गणना; टैक्स अनुमान नहीं' } },
    { key: 'site:links.areaConverter', href: '/area-converter', icon: 'area', desc: { en: 'Gaj, sq ft, acre and more', hi: 'गज, वर्ग फुट, एकड़ और बाकी' } },
    { key: 'site:links.vastu', href: '/vastu-checker', icon: 'compass', desc: { en: 'Compare a floor plan with the tool’s Vastu rules', hi: 'टूल के वास्तु नियमों से फ़्लोर प्लान देखें' } },
    { key: 'site:links.aiDesign', href: '/ai-design-studio', icon: 'roller', desc: { en: 'Explore AI-generated room-design concepts', hi: 'AI से बने कमरे के डिज़ाइन विकल्प देखें' } },
    { key: 'site:links.blueprint', href: '/design-blueprint', icon: 'floor-plan', desc: { en: 'Draw a 2D and 3D floor plan', hi: '2D और 3D फ़्लोर प्लान बनाएँ' } },
    { key: 'site:links.rentReceipt', href: '/rent-receipt', icon: 'receipt', desc: { en: 'Create a receipt; HRA eligibility is not checked', hi: 'रसीद बनाएँ; HRA पात्रता की जाँच नहीं होती' } },
    { key: 'site:nav.allTools', href: '/tools', icon: 'grid' },
  ],
};

export const FOOTER: NavGroup[] = [
  {
    key: 'site:footer.findHome',
    links: [
      { key: 'site:links.properties', href: '/properties' },
      { key: 'site:nav.buy', href: '/gurgaon/buy/flats' },
      { key: 'site:nav.rent', href: '/gurgaon/rent/flats' },
      { key: 'site:nav.pg', href: '/gurgaon/pg/flats' },
      { key: 'site:nav.projects', href: '/project' },
      { key: 'site:links.localities', href: '/localities' },
      { key: 'site:footer.mapSearch', href: '/map-location' },
    ],
  },
  {
    key: 'site:footer.owners',
    links: [
      { key: 'site:links.postProperty', href: '/post-property' },
      { key: 'site:links.referAndEarn', href: '/refer-and-earn' },
      { key: 'site:links.aiAssistant', href: '/ai-agent' },
      { key: 'site:links.vastu', href: '/vastu-checker' },
    ],
  },
  { key: 'site:footer.dataHub', links: DATA_HUB.links },
  { key: 'site:footer.tools', links: TOOLS.links },
  {
    key: 'site:footer.company',
    links: [
      { key: 'site:links.aboutUs', href: '/about-us' },
      { key: 'site:links.blog', href: '/blog' },
      { key: 'site:links.faq', href: '/faq' },
      { key: 'site:links.contact', href: '/contact' },
      { key: 'site:footer.compare', href: '/vs' },
      { key: 'site:links.forAi', href: '/for-ai' },
      { key: 'site:links.authors', href: '/authors' },
      { key: 'site:links.methodology', href: '/methodology' },
      { key: 'site:links.editorialPolicy', href: '/editorial-policy' },
    ],
  },
];

export const LEGAL: NavLink[] = [
  { key: 'site:footer.terms', href: '/policies/terms-of-service' },
  { key: 'site:footer.privacy', href: '/policies/privacy-policy' },
  { key: 'site:footer.policies', href: '/policies' },
  { key: 'site:footer.deleteAccount', href: '/delete-account' },
];

/** Real, verified profiles (from the old site's social data). */
export const SOCIAL = (['instagram', 'facebook', 'x', 'linkedin', 'youtube'] as const).map((brand) => {
  const l = LINKS.find((x) => x.icon === brand && x.group === 'follow')!;
  return { brand, label: l.platform.replace(' (Twitter)', ''), href: l.url };
});

export { PLAY_STORE } from '@/lib/apps';

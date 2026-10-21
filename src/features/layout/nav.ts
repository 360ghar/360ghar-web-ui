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
    en: 'Check the price, the papers and the builder before you pay a token.',
    hi: 'टोकन देने से पहले कीमत, कागज़ और बिल्डर जाँच लें।',
  },
  links: [
    { key: 'site:links.circleRates', href: '/circle-rates', icon: 'map', desc: { en: 'Government rates by sector', hi: 'सेक्टर के हिसाब से सरकारी रेट' } },
    { key: 'site:links.reraProjects', href: '/rera-projects', icon: 'building', desc: { en: 'Registered projects and builders', hi: 'रजिस्टर्ड प्रोजेक्ट और बिल्डर' } },
    { key: 'site:links.bankAuctions', href: '/bank-auctions', icon: 'gavel', desc: { en: 'Bank and court property auctions', hi: 'बैंक और कोर्ट की प्रॉपर्टी नीलामी' } },
    { key: 'site:links.stampDuty', href: '/stamp-duty-calculator', icon: 'stamp', desc: { en: 'Stamp duty and registration cost', hi: 'स्टांप ड्यूटी और रजिस्ट्री का खर्च' } },
    { key: 'site:links.verifyOwnership', href: '/verify-ownership', icon: 'verified', desc: { en: 'Find the owner in land records', hi: 'ज़मीन के रिकॉर्ड में मालिक देखें' } },
    { key: 'site:links.zoneChecker', href: '/zone-checker', icon: 'layers', desc: { en: 'Land use and FAR by sector', hi: 'सेक्टर के हिसाब से लैंड यूज़ और FAR' } },
    { key: 'site:links.regulatoryUpdates', href: '/regulatory-updates', icon: 'news', desc: { en: 'Gazette notices and RERA orders', hi: 'गज़ट सूचनाएँ और RERA आदेश' } },
    { key: 'site:links.builderReputation', href: '/builder-reputation', icon: 'crane', desc: { en: 'Delivery record and complaints', hi: 'डिलीवरी रिकॉर्ड और शिकायतें' } },
  ],
};

export const TOOLS: NavGroup = {
  key: 'site:nav.tools',
  theme: 'calculator',
  note: {
    en: 'Free tools for loans, tax, area and design. You do not need an account.',
    hi: 'लोन, टैक्स, एरिया और डिज़ाइन के मुफ़्त टूल। अकाउंट की ज़रूरत नहीं।',
  },
  more: { key: 'site:nav.allTools', href: '/tools' },
  links: [
    { key: 'site:links.emi', href: '/emi-calculator', icon: 'calculator', desc: { en: 'Monthly EMI and total interest', hi: 'मासिक EMI और कुल ब्याज' } },
    { key: 'site:links.loanEligibility', href: '/loan-eligibility-calculator', icon: 'rupee', desc: { en: 'How much loan you can get', hi: 'आपको कितना लोन मिल सकता है' } },
    { key: 'site:links.capitalGains', href: '/capital-gains-tax-calculator', icon: 'compare', desc: { en: 'Tax when you sell a property', hi: 'प्रॉपर्टी बेचने पर टैक्स' } },
    { key: 'site:links.areaConverter', href: '/area-converter', icon: 'area', desc: { en: 'Gaj, sq ft, acre and more', hi: 'गज, वर्ग फुट, एकड़ और बाकी' } },
    { key: 'site:links.vastu', href: '/vastu-checker', icon: 'compass', desc: { en: 'Free AI vastu score for a floor plan', hi: 'फ़्लोर प्लान का मुफ़्त AI वास्तु स्कोर' } },
    { key: 'site:links.aiDesign', href: '/ai-design-studio', icon: 'roller', desc: { en: 'Free AI room redesign, no sign-up', hi: 'मुफ़्त AI कमरा डिज़ाइन, साइन-अप नहीं' } },
    { key: 'site:links.blueprint', href: '/design-blueprint', icon: 'floor-plan', desc: { en: 'Draw a 2D and 3D floor plan', hi: '2D और 3D फ़्लोर प्लान बनाएँ' } },
    { key: 'site:links.rentReceipt', href: '/rent-receipt', icon: 'receipt', desc: { en: 'Rent receipts for an HRA claim', hi: 'HRA क्लेम के लिए किराए की रसीद' } },
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

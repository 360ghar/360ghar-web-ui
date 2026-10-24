/**
 * Tools that fit a blog post: matched on the post's words first, then on its
 * category. Labels, icons and one-line descriptions come from the site menus
 * (features/layout/nav), so the post says the same thing as the menu.
 */
import { DATA_HUB, TOOLS, type NavLink } from '@/features/layout/nav';

const EXTRA: NavLink[] = [
  { key: 'common:nav.propertyChecklist', href: '/property-document-checklist', icon: 'document', desc: { en: 'Prompts to organize a review with a professional', hi: 'पेशेवर के साथ समीक्षा के लिए संकेत' } },
  { key: 'common:nav.localities', href: '/localities', icon: 'pin', desc: { en: 'Sectors and societies in Gurugram', hi: 'गुरुग्राम के सेक्टर और सोसाइटी' } },
];

const ALL = new Map([...TOOLS.links, ...DATA_HUB.links, ...EXTRA].map((l) => [l.href, l]));

const BY_TOPIC: [RegExp, string[]][] = [
  [/\bemi\b|home loan|\bloan/i, ['/emi-calculator', '/loan-eligibility-calculator']],
  [/stamp duty|registry|registration/i, ['/stamp-duty-calculator']],
  [/circle rate/i, ['/circle-rates', '/stamp-duty-calculator']],
  [/capital gain|selling|resale/i, ['/capital-gains-tax-calculator']],
  [/vastu/i, ['/vastu-checker']],
  [/floor plan|interior|design/i, ['/design-blueprint', '/ai-design-studio']],
  [/rera|builder|project/i, ['/rera-projects', '/builder-reputation']],
  [/lease|agreement|document|deposit|landlord/i, ['/property-document-checklist']],
  [/\brent|tenant|\bhra\b|flatmate|\bpg\b/i, ['/rent-receipt']],
  [/ownership|title|land record|jamabandi/i, ['/verify-ownership']],
  [/auction/i, ['/bank-auctions']],
  [/\barea\b|carpet|sq ?ft|gaj/i, ['/area-converter']],
  [/sector|locality|neighbou?rhood|school|commut/i, ['/localities', '/circle-rates']],
  [/invest|yield|price|budget|lakh|afford/i, ['/emi-calculator', '/circle-rates']],
];

const BY_CATEGORY: [RegExp, string[]][] = [
  [/vastu|design|interior/, ['/vastu-checker', '/design-blueprint']],
  [/legal|rera|buying/, ['/property-document-checklist', '/rera-projects', '/verify-ownership']],
  [/market|finance|pricing|invest/, ['/emi-calculator', '/circle-rates', '/rera-projects']],
  [/rent/, ['/rent-receipt', '/property-document-checklist']],
  [/neighbou?rhood|lifestyle|living|locality/, ['/localities', '/circle-rates']],
];

/** Up to `max` tools, no repeats: title words first, then tags, then the category. */
export function postTools(title: string, tags = '', category = '', max = 3): NavLink[] {
  const topic = (text: string) => BY_TOPIC.filter(([re]) => re.test(text)).flatMap(([, h]) => h);
  const hrefs = [...topic(title), ...topic(tags), ...(BY_CATEGORY.find(([re]) => re.test(category))?.[1] ?? []), '/emi-calculator'];
  return [...new Set(hrefs)]
    .map((h) => ALL.get(h))
    .filter((l): l is NavLink => Boolean(l))
    .slice(0, max);
}

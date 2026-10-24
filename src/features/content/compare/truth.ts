import { EVIDENCE_REVIEWED_ON } from './competitors';

/** The page copy (title, lead) lives in the i18n `truth.*` keys; this is the page data only. */
export type TruthPage = {
  slug: string;
  competitor: string;
  source: { label: string; url: string };
  checkedOn: string;
};

export const TRUTH_PAGES: TruthPage[] = [
  {
    slug: 'nobroker-listings',
    competitor: 'nobroker',
    source: { label: 'NoBroker official product site', url: 'https://www.nobroker.in' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: 'magicbricks-spam',
    competitor: 'magicbricks',
    source: { label: 'MagicBricks official product site', url: 'https://www.magicbricks.com' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: '99acres-fake',
    competitor: '99acres',
    source: { label: '99acres official product site', url: 'https://www.99acres.com' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: 'nestaway-collapse',
    competitor: 'nestaway',
    source: { label: 'NestAway URL (404/parked response during review)', url: 'https://www.nestaway.in' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: 'zolo-issues',
    competitor: 'zolo',
    source: { label: 'Zolo official product site', url: 'https://www.zolostays.com' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
];

export const truthBySlug = (slug: string) => TRUTH_PAGES.find((page) => page.slug === slug) ?? null;

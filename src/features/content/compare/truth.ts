import { EVIDENCE_REVIEWED_ON } from './competitors';

export type TruthPage = {
  slug: string;
  competitor: string;
  title: string;
  intro: string;
  source: { label: string; url: string };
  checkedOn: string;
};

const EVIDENCE_NOTE =
  'This page does not independently assess feature availability or service quality. See the comparison profile for dated sources and explicit evidence states.';

export const TRUTH_PAGES: TruthPage[] = [
  {
    slug: 'nobroker-listings',
    competitor: 'nobroker',
    title: 'Evidence note: NoBroker',
    intro: EVIDENCE_NOTE,
    source: { label: 'NoBroker official product site', url: 'https://www.nobroker.in' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: 'magicbricks-spam',
    competitor: 'magicbricks',
    title: 'Evidence note: MagicBricks',
    intro: EVIDENCE_NOTE,
    source: { label: 'MagicBricks official product site', url: 'https://www.magicbricks.com' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: '99acres-fake',
    competitor: '99acres',
    title: 'Evidence note: 99acres',
    intro: EVIDENCE_NOTE,
    source: { label: '99acres official product site', url: 'https://www.99acres.com' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: 'nestaway-collapse',
    competitor: 'nestaway',
    title: 'Evidence note: NestAway',
    intro: 'The NestAway URL returned 404/a parked page during the review. Current product status remains unknown.',
    source: { label: 'NestAway URL (404/parked response during review)', url: 'https://www.nestaway.in' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
  {
    slug: 'zolo-issues',
    competitor: 'zolo',
    title: 'Evidence note: Zolo Stays',
    intro: 'Zolo Stays is an adjacent managed PG/co-living option, not a like-for-like marketplace peer. This evidence note does not independently assess service quality.',
    source: { label: 'Zolo official product site', url: 'https://www.zolostays.com' },
    checkedOn: EVIDENCE_REVIEWED_ON,
  },
];

export const truthBySlug = (slug: string) => TRUTH_PAGES.find((page) => page.slug === slug) ?? null;

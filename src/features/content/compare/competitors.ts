export const EVIDENCE_REVIEWED_ON = '2026-10-23';

export type EvidenceState = 'available' | 'limited' | 'unavailable' | 'unknown';
export type CompetitorCategory = 'property-marketplace' | 'managed-accommodation' | 'unknown';

type EvidenceSource = {
  label: string;
  url: string;
  checkedOn: string;
};

type ComparisonFeature = {
  feature: string;
  ourState: EvidenceState;
  ourNote: string;
  competitorState: EvidenceState;
  competitorNote: string;
};

export type Competitor = {
  key: string;
  slug: string;
  name: string;
  website: string;
  category: CompetitorCategory;
  currentStatus: 'not-assessed' | 'unknown';
  comparisonScope: string;
  companyDescription: string;
  source: EvidenceSource;
  noindex: boolean;
  features: ComparisonFeature[];
  truth?: string;
};

const OUR_FEATURES: Omit<ComparisonFeature, 'competitorState' | 'competitorNote'>[] = [
  {
    feature: 'Home search: buy, rent and short stays',
    ourState: 'available',
    ourNote: 'Search flows and filters are available; live inventory varies.',
  },
  {
    feature: 'Search filters',
    ourState: 'available',
    ourNote: 'Search filters are available.',
  },
  {
    feature: 'Saved homes',
    ourState: 'limited',
    ourNote: 'Saving a home requires sign-in.',
  },
  {
    feature: 'Compare homes',
    ourState: 'limited',
    ourNote: 'Compare up to four selected homes. The comparison page is noindex.',
  },
  {
    feature: 'Visit scheduling',
    ourState: 'limited',
    ourNote: 'The form submits a visit request; it does not confirm a visit.',
  },
  {
    feature: 'Owner listings',
    ourState: 'limited',
    ourNote: 'The six-step owner flow depends on sign-in and API availability.',
  },
  {
    feature: 'Virtual tours',
    ourState: 'limited',
    ourNote: 'A tour renders only when a listing has a tour URL.',
  },
  {
    feature: 'Local property-data pages',
    ourState: 'limited',
    ourNote: 'Data Hub pages exist; data availability varies.',
  },
];

const UNKNOWN_FEATURE_NOTE = 'Unknown: no current, feature-specific primary-source evidence is recorded here. Unknown does not mean unavailable.';

function features(): ComparisonFeature[] {
  return OUR_FEATURES.map((feature) => ({
    ...feature,
    competitorState: 'unknown',
    competitorNote: UNKNOWN_FEATURE_NOTE,
  }));
}

function profile(
  key: string,
  name: string,
  website: string,
  category: CompetitorCategory,
  companyDescription: string,
  comparisonScope: string,
  options: { sourceLabel?: string; currentStatus?: Competitor['currentStatus']; noindex?: boolean; truth?: string } = {},
): Competitor {
  return {
    key,
    slug: key === 'stanza' ? 'stanza-living' : key,
    name,
    website,
    category,
    currentStatus: options.currentStatus ?? 'not-assessed',
    comparisonScope,
    companyDescription,
    source: {
      label: options.sourceLabel ?? `${name} official product site (company description)`,
      url: website,
      checkedOn: EVIDENCE_REVIEWED_ON,
    },
    noindex: options.noindex ?? false,
    features: features(),
    ...(options.truth ? { truth: options.truth } : {}),
  };
}

export const COMPETITORS: Competitor[] = [
  profile(
    'nobroker',
    'NoBroker',
    'https://www.nobroker.in',
    'property-marketplace',
    'NoBroker’s official product site is cited for company-described features. This profile makes no independent quality or superiority claim.',
    'Property marketplace profile; live inventory and service quality are not assessed.',
    { truth: 'nobroker-listings' },
  ),
  profile(
    'magicbricks',
    'MagicBricks',
    'https://www.magicbricks.com',
    'property-marketplace',
    'MagicBricks’ official product site is cited for company-described features. This profile makes no independent quality or superiority claim.',
    'Property marketplace profile; live inventory and service quality are not assessed.',
    { truth: 'magicbricks-spam' },
  ),
  profile(
    '99acres',
    '99acres',
    'https://www.99acres.com',
    'property-marketplace',
    '99acres’ official product site is cited for company-described features. This profile makes no independent quality or superiority claim.',
    'Property marketplace profile; live inventory and service quality are not assessed.',
    { truth: '99acres-fake' },
  ),
  profile(
    'housing',
    'Housing.com',
    'https://www.housing.com',
    'property-marketplace',
    'Housing.com’s official product site is cited for company-described features. This profile makes no independent quality or superiority claim.',
    'Property marketplace profile; live inventory and service quality are not assessed.',
  ),
  profile(
    'commonfloor',
    'CommonFloor',
    'https://www.commonfloor.com',
    'unknown',
    'CommonFloor product pages returned HTTP 500 during the review; current status remains unknown.',
    'Current product status is unknown. No feature or operating-status claim is made.',
    {
      sourceLabel: 'CommonFloor official site (product pages returned HTTP 500)',
      currentStatus: 'unknown',
      noindex: true,
    },
  ),
  profile(
    'proptiger',
    'PropTiger',
    'https://www.proptiger.com',
    'property-marketplace',
    'PropTiger’s official product site is cited for company-described features. This profile makes no independent quality or superiority claim.',
    'Property marketplace profile; live inventory and service quality are not assessed.',
  ),
  profile(
    'squareyards',
    'Square Yards',
    'https://www.squareyards.com',
    'property-marketplace',
    'Square Yards’ official product site is cited for company-described features. This profile makes no independent quality or superiority claim.',
    'Property marketplace profile; live inventory and service quality are not assessed.',
  ),
  profile(
    'nestaway',
    'NestAway',
    'https://www.nestaway.in',
    'unknown',
    'The NestAway URL returned 404/a parked page during the review; current status remains unknown.',
    'Current product status is unknown. No feature or operating-status claim is made.',
    {
      sourceLabel: 'NestAway URL (404/parked response during review)',
      currentStatus: 'unknown',
      noindex: true,
      truth: 'nestaway-collapse',
    },
  ),
  profile(
    'zolo',
    'Zolo Stays',
    'https://www.zolostays.com',
    'managed-accommodation',
    'Zolo Stays’ official product site is cited for company-described features. This is an adjacent managed PG/co-living option, not a like-for-like marketplace peer.',
    'Adjacent managed PG/co-living option; not a like-for-like marketplace peer.',
    { truth: 'zolo-issues' },
  ),
  profile(
    'stanza',
    'Stanza Living',
    'https://www.stanzaliving.com',
    'managed-accommodation',
    'Stanza Living’s official product site is cited for company-described features. This is an adjacent managed PG/co-living option, not a like-for-like marketplace peer.',
    'Adjacent managed PG/co-living option; not a like-for-like marketplace peer.',
  ),
];

export const competitorBySlug = (slug: string) => COMPETITORS.find((competitor) => competitor.slug === slug) ?? null;

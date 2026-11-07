/**
 * The "best X" pages: one record per page. Competitor rows reuse the COMPETITORS
 * profiles (scope and source). Rows that state a new fact cite the product's own
 * homepage, checked on CHECKED_ON. English only: the Hindi /hi copies canonicalise to these pages.
 */
import { COMPETITORS } from '@/features/content/compare/competitors';
import { canonicalFor } from '@/lib/seo/site';

export const CHECKED_ON = '2026-11-08';
export const PUBLISHER_LINE = 'Published by 360Ghar. We make 360Ghar, which is on this list.';

export type BestRow = {
  name: string;
  /** Internal path: a competitor's /vs profile, or a 360Ghar page. */
  href: string;
  summary: string;
  source: { label: string; url: string; checkedOn: string };
};

export type BestFaq = { q: string; a: string };

export type BestPageData = {
  path: string;
  /** The exact search term: used as the H1 and in the title. */
  term: string;
  title: string;
  description: string;
  /** The direct answer, two sentences. Shown as the lead. */
  answer: string;
  summaryHeading: string;
  criteria: string[];
  rows: BestRow[];
  notIncluded: string;
  faqs: BestFaq[];
};

const profile = (slug: string) => {
  const c = COMPETITORS.find((x) => x.slug === slug);
  // A noindex profile must never reach a table.
  if (!c || c.noindex) throw new Error(`No indexable profile for ${slug}`);
  return c;
};

/** A row from the profile's own scope and source (no new claim). */
const fromProfile = (slug: string): BestRow => {
  const c = profile(slug);
  return {
    name: c.name,
    href: `/vs/${c.slug}`,
    summary: c.comparisonScope,
    source: { label: c.source.label, url: c.source.url, checkedOn: c.source.checkedOn },
  };
};

/** A row from a fact read on the product's homepage on CHECKED_ON. */
const homepage = (slug: string, summary: string): BestRow => {
  const c = profile(slug);
  return {
    name: c.name,
    href: `/vs/${c.slug}`,
    summary,
    source: { label: `${c.name} homepage`, url: c.website, checkedOn: CHECKED_ON },
  };
};

const PROFILE_SCOPE_NOTE = 'Live inventory and service quality are not assessed.';

export const BEST_PAGES: BestPageData[] = [
  {
    path: '/best-real-estate-apps-india',
    term: 'Best real estate apps in India',
    title: 'Best real estate apps in India | 360Ghar',
    description: 'Compare real estate apps in India by product type. Each row links to its source and the date the source was checked.',
    answer:
      'A real estate app in India lets you search homes to buy, rent or stay short term. This page lists 360Ghar first, then six property marketplaces in the order of our compare list, and it does not test listings.',
    summaryHeading: 'Summary',
    criteria: [
      'The product is a property search app or website for buyers, renters or both, in India.',
      'Managed PG and co-living operators are not included, because they are not property marketplaces.',
      'Each row shows only what the product states in its own profile or on its own site. Each row has its source link and the date it was checked.',
      'We did not test listings, search results or service quality for any product.',
      '360Ghar is listed first because we publish this page. The order is editorial, not a measured score.',
    ],
    rows: [
      {
        name: '360Ghar',
        href: '/',
        summary: 'Android app on Google Play and a website. Search homes to buy, rent or stay short term, with search filters. Live inventory varies.',
        source: { label: '360Ghar app page', url: 'https://360ghar.com/app', checkedOn: CHECKED_ON },
      },
      fromProfile('nobroker'),
      fromProfile('magicbricks'),
      fromProfile('99acres'),
      fromProfile('housing'),
      fromProfile('proptiger'),
      fromProfile('squareyards'),
    ],
    notIncluded:
      'CommonFloor and NestAway are not in this list because their current status is unknown in our sources. Zolo Stays and Stanza Living are not in this list because they are managed PG and co-living options.',
    faqs: [
      {
        q: 'Which real estate apps are in this list?',
        a: '360Ghar, NoBroker, MagicBricks, 99acres, Housing.com, PropTiger and Square Yards. The competitor names link to their profiles on 360Ghar.',
      },
      {
        q: 'Is this list based on tests?',
        a: 'No. We did not test listings, search results or service quality for any product. The order follows the criteria on this page.',
      },
      {
        q: 'Does 360Ghar have an app?',
        a: 'Yes. The 360Ghar Android app is on Google Play. The 360Ghar app page links to the store.',
      },
      {
        q: 'Why does a competitor row say that live inventory is not assessed?',
        a: `Each profile describes the product scope from its source. ${PROFILE_SCOPE_NOTE} We do not state either one.`,
      },
      {
        q: 'When were the sources checked?',
        a: 'Each row shows the date its source was checked. The 360Ghar rows were checked on 8 November 2026.',
      },
      {
        q: 'Who publishes this page?',
        a: PUBLISHER_LINE,
      },
    ],
  },
  {
    path: '/best-property-sites-gurgaon',
    term: 'Best property sites in Gurgaon',
    title: 'Best property sites in Gurgaon | 360Ghar',
    description: 'Compare property sites for Gurgaon by the Gurgaon pages each site states. Each row links to its source and check date.',
    answer:
      'Property sites for Gurgaon list homes to buy or rent, and some also list PG rooms. This page compares four sites by the Gurgaon pages each one states on its homepage or on its own pages, not by listing count or price.',
    summaryHeading: 'Gurgaon pages on the site',
    criteria: [
      'The site has Gurgaon listing pages, or it shows Gurgaon listings or links on its homepage.',
      'Each row shows only what the site states on its own pages. Each row has its source link and the date it was checked.',
      'We checked the homepage of each site on 8 November 2026. We did not open the listing pages.',
      'We did not count listings, compare prices or test search results.',
      '360Ghar is listed first because we publish this page. The other rows follow the order of the profiles in our compare list.',
    ],
    rows: [
      {
        name: '360Ghar',
        href: '/gurgaon/buy/flats',
        summary: 'Landing pages for flats to buy, flats to rent and PG in Gurgaon. Listing availability varies.',
        source: { label: '360Ghar Gurgaon buy page', url: 'https://360ghar.com/gurgaon/buy/flats', checkedOn: CHECKED_ON },
      },
      homepage(
        'nobroker',
        'Homepage links to Flats for Sale in Gurgaon, Flats for Rent in Gurgaon, Independent Houses For Sale in Gurgaon and PG / Hostels in Gurgaon.',
      ),
      homepage(
        'proptiger',
        'Homepage has a Gurgaon city tab and sample Gurgaon project listings, such as M3M Altitude in Sector 65.',
      ),
      homepage('squareyards', 'Homepage links to Flats for Sale in Gurgaon and Flats for rent in Gurgaon.'),
    ],
    notIncluded:
      'MagicBricks, 99acres and Housing.com are not in this table. Our check did not return their homepages on 8 November 2026, so we cannot state their Gurgaon pages.',
    faqs: [
      {
        q: 'Which sites in this list show Gurgaon pages?',
        a: 'Each site in the table shows Gurgaon pages or Gurgaon listings, as the table states. 360Ghar has landing pages for flats to buy, flats to rent and PG in Gurgaon.',
      },
      {
        q: 'Why are MagicBricks, 99acres and Housing.com not in the table?',
        a: 'Our check of their homepages on 8 November 2026 did not return the page. We did not add facts that we could not check.',
      },
      {
        q: 'Does this page compare prices or listing counts?',
        a: 'No. This page does not compare prices, listing counts or the age of listings.',
      },
      {
        q: 'How do I check the listings on a site?',
        a: 'Open the site, search for Gurgaon, and check the details and date on each listing. Confirm important facts with the seller or the builder.',
      },
      {
        q: 'Who publishes this page?',
        a: PUBLISHER_LINE,
      },
    ],
  },
  {
    path: '/best-ai-real-estate-platforms',
    term: 'Best AI real estate platforms',
    title: 'Best AI real estate platforms | 360Ghar',
    description: 'Compare real estate platforms by the AI features each one names on its own pages. Each row links to its source and check date.',
    answer:
      'An AI real estate platform uses an AI feature to help people search, value or list property. This page ranks four platforms by the AI feature each one names on its homepage or its own pages, and it does not test how well any feature works.',
    summaryHeading: 'AI feature named on the site',
    criteria: [
      'A platform ranks higher when its own pages name an AI feature. A platform that names no AI feature ranks lower.',
      'We checked the homepage of each platform on 8 November 2026. An AI feature that appears only on other pages of the site is not counted.',
      'We quote what each site says. We do not state what an AI feature does unless the site says so.',
      'We did not test any AI feature.',
      '360Ghar names an AI tool directory, so it ranks first under these criteria. 360Ghar also publishes this page.',
    ],
    rows: [
      {
        name: '360Ghar',
        href: '/ai-agent',
        summary:
          'MCP tool directory for AI assistants. The page lists the tools for the 360Ghar MCP server. It does not confirm live availability or verify property information.',
        source: { label: '360Ghar AI agent page', url: 'https://360ghar.com/ai-agent', checkedOn: CHECKED_ON },
      },
      homepage('squareyards', 'The homepage search area has a button labelled "Ask AI". The page does not say what the button does.'),
      homepage('nobroker', 'The homepage describes no AI capability. It has a plain Search box.'),
      homepage(
        'proptiger',
        'The homepage describes no AI feature. It has a plain Search box with Budget, Property Type and Project Status filters.',
      ),
    ],
    notIncluded:
      'MagicBricks, 99acres and Housing.com are not in this table. Our check did not return their homepages on 8 November 2026, so we cannot state whether they name an AI feature.',
    faqs: [
      {
        q: 'What counts as an AI feature on this page?',
        a: 'A feature that the platform names on its homepage or its own pages, such as an "Ask AI" button or an AI tool directory. We did not test any feature.',
      },
      {
        q: 'Why does 360Ghar rank first?',
        a: 'The 360Ghar AI agent page names an AI tool directory for AI assistants. Under the criteria on this page, a named AI feature ranks above a platform that names none. 360Ghar also publishes this page.',
      },
      {
        q: 'Does the 360Ghar AI agent confirm listings?',
        a: 'No. The AI agent page says that it does not confirm live availability or verify property information.',
      },
      {
        q: 'Do NoBroker and PropTiger have no AI features?',
        a: 'Their homepages, as checked on 8 November 2026, name no AI feature. That does not show that the sites have no AI features on other pages.',
      },
      {
        q: 'What does "Ask AI" on Square Yards do?',
        a: 'The homepage does not say what the button does, so we do not state it.',
      },
      {
        q: 'Who publishes this page?',
        a: PUBLISHER_LINE,
      },
    ],
  },
  {
    path: '/best-property-portals-india',
    term: 'Best property portals in India',
    title: 'Best property portals in India | 360Ghar',
    description: 'Compare property portals in India by the ways owners and agents can post a listing, as each site states them.',
    answer:
      'A property portal is a website where owners, agents or builders post property listings for buyers and renters to see. This page ranks four portals by the ways each one states that owners or agents can post a listing, and it does not measure listing quality.',
    summaryHeading: 'Owner or agent posting, as stated',
    criteria: [
      'A portal ranks higher when its homepage or its posting page states a way for owners or agents to post a listing. Co-broking for agents alone does not count.',
      'We checked the homepage of each portal on 8 November 2026, and the 360Ghar post property page.',
      'We did not test posting, listing quality or response times.',
      'Ties keep the order of the table.',
      '360Ghar is in the table because it is a portal and we publish this page.',
    ],
    rows: [
      {
        name: 'Square Yards',
        href: '/vs/squareyards',
        summary: 'Homepage has a List Property link. The Posted By search filter has Owners and Partner Agents.',
        source: { label: 'Square Yards homepage', url: profile('squareyards').website, checkedOn: CHECKED_ON },
      },
      {
        name: '360Ghar',
        href: '/post-property',
        summary: 'The post property page says that a user can request assistance to post a property on 360Ghar.',
        source: { label: '360Ghar post property page', url: 'https://360ghar.com/post-property', checkedOn: CHECKED_ON },
      },
      homepage(
        'nobroker',
        'Homepage asks "Are you a Property Owner?" and has a Post Free Property Ad link. It states no posting route for agents.',
      ),
      homepage(
        'proptiger',
        'The homepage states no way for owners to post a listing. It states co-broking for real estate agents.',
      ),
    ],
    notIncluded:
      'MagicBricks, 99acres and Housing.com are not in this table. Our check did not return their homepages on 8 November 2026, so we cannot state how their owners or agents post listings.',
    faqs: [
      {
        q: 'What is a property portal?',
        a: 'A website where owners, agents or builders post property listings for buyers and renters. This page uses that meaning.',
      },
      {
        q: 'How were the portals ordered?',
        a: 'By the number of ways each site states for owners or agents to post a listing. Co-broking for agents does not count as posting. Ties keep the table order.',
      },
      {
        q: 'Can owners list property on 360Ghar?',
        a: 'The post property page says that a user can request assistance to post a property on 360Ghar.',
      },
      {
        q: 'Does PropTiger accept owner listings?',
        a: 'The homepage we checked on 8 November 2026 does not state a way for owners to post a listing. It states co-broking for real estate agents.',
      },
      {
        q: 'Who publishes this page?',
        a: PUBLISHER_LINE,
      },
    ],
  },
];

export function bestPage(path: string): BestPageData {
  const page = BEST_PAGES.find((p) => p.path === path);
  if (!page) throw new Error(`No best page for ${path}`);
  return page;
}

/** The ItemList JSON-LD for a page: one item per table row, in table order. */
export function itemList(page: BestPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.term,
    itemListElement: page.rows.map((row, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: row.name,
      url: canonicalFor(row.href, 'en'),
    })),
  };
}

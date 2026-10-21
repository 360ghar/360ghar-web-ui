/**
 * The five /truth pages (old src/pages/truth/*.jsx wrappers, English only).
 * `published` is a fixed date: the last change to these files (2026-06-20).
 * The old Article JSON-LD used the time of each render.
 */
export type TruthPage = {
  slug: string;
  competitor: string;
  seoKey: string;
  title: string;
  intro: string;
  issues: { title: string; description: string; source: string }[];
};

export const TRUTH_PUBLISHED = '2026-06-20';

export const TRUTH_PAGES: TruthPage[] = [
  {
    slug: 'nobroker-listings',
    competitor: 'nobroker',
    seoKey: 'nobroker',
    title: 'What to Know About NoBroker Listings',
    intro: 'NoBroker markets itself as a zero-brokerage platform, but its model now includes owner subscription fees and mixed user experiences. Here is a balanced overview.',
    issues: [
      { title: 'Subscription fees instead of zero brokerage', description: 'Despite the name, NoBroker charges property owners subscription fees ranging from ₹3,000 to ₹20,000+ to access tenant contact details. The "zero brokerage" positioning applies to tenants but not to owners seeking visibility.', source: 'NoBroker website and user reviews' },
      { title: 'Refund concerns with the Money Back Plan', description: 'Some users report difficulty redeeming the "Money Back Guarantee". Complaints on Consumer Court websites indicate refund requests being delayed or declined in certain cases.', source: 'Trustpilot, Consumer Court filings' },
      { title: 'Customer support availability', description: 'Users report mixed experiences with relationship managers, including delayed responses and limited escalation paths. The dedicated "RM" is not always reachable.', source: 'Trustpilot reviews' },
      { title: 'Listing verification gaps', description: 'NoBroker relies primarily on self-verification by property owners. Users report encountering listings that are already rented, or photos that do not match the actual property.', source: 'User reviews on multiple platforms' },
    ],
  },
  {
    slug: 'magicbricks-spam',
    competitor: 'magicbricks',
    seoKey: 'magicbricks',
    title: 'What to Know About MagicBricks Spam Calls',
    intro: 'MagicBricks shares contact details with brokers as part of its lead-generation model. A simple property search can lead to a high volume of broker calls. Here is what users report and how to navigate it.',
    issues: [
      { title: 'Frequent broker calls after inquiries', description: 'Users report receiving a high volume of calls from brokers within 24 hours of posting an inquiry on MagicBricks. The platform shares contact details with agents as part of its lead-generation model.', source: 'User reviews, Google Play Store' },
      { title: 'Contact details shared with broker networks', description: 'MagicBricks monetizes by providing user contact information to broker databases. Your phone number may become available to multiple agents in the city.', source: 'User testimonials' },
      { title: 'Verification inconsistencies', description: 'The "verified" badge on MagicBricks listings does not always reflect on-ground status. Users report that some properties they viewed were already rented or no longer available.', source: 'User reviews on Trustpilot' },
      { title: 'Predominantly broker listings', description: 'While positioned as a direct owner-tenant platform, MagicBricks is largely populated by broker listings. Direct owner listings are comparatively limited.', source: 'Platform analysis' },
    ],
  },
  {
    slug: '99acres-fake',
    competitor: '99acres',
    seoKey: '99acres',
    title: 'What to Know About 99acres Listings',
    intro: '99acres advertises verified properties, but users report listing-accuracy issues and frequent broker calls. Here is a balanced look at what users actually experience.',
    issues: [
      { title: 'Broker call volume similar to other portals', description: 'Like other lead-generation portals, 99acres shares user contact information with brokers. Users report receiving frequent calls within hours of posting inquiries.', source: 'User reviews, Trustpilot' },
      { title: 'Listing accuracy concerns', description: 'Despite claiming verification, 99acres has user complaints about listings that were already rented, no longer available, or with misleading photographs.', source: 'Trustpilot, Google Play reviews' },
      { title: 'Refund policy concerns', description: 'Users who paid for premium packages report limited returns on investment. Refund requests are sometimes denied or delayed. Premium packages cost ₹15,000+ with no guarantee of outcomes.', source: 'User testimonials' },
      { title: 'Customer support responsiveness', description: 'Multiple complaints note that customer support can be hard to reach and that issues may take time to resolve, with limited escalation options for disputes.', source: 'Consumer Court websites' },
    ],
  },
  {
    slug: 'nestaway-collapse',
    competitor: 'nestaway',
    seoKey: 'nestaway',
    title: 'What Happened With NestAway',
    intro: "From a ₹1,800 crore valuation to an approximately ₹90 crore acquisition, NestAway's journey highlights the challenges of the managed-rental model. Here is a factual overview.",
    issues: [
      { title: 'Significant valuation decline', description: 'NestAway was once valued at approximately ₹1,800 crore but was acquired for around ₹90 crore in 2024, a substantial reduction in valuation. This reflects challenges in the managed-rental business model.', source: 'News reports, 2024' },
      { title: 'Co-founder legal dispute', description: "A co-founder filed a First Information Report (FIR) against investors and fellow founders, alleging corporate malpractices. This indicates internal governance challenges during the company's downturn.", source: 'Media reports, 2024' },
      { title: 'Profitability challenges', description: 'Despite raising $110M+ from Tiger Global, Goldman Sachs, and others, NestAway did not achieve profitability. The managed rental model proved difficult to sustain at scale.', source: 'Industry analysis' },
      { title: 'Property management concerns', description: 'Users report issues with property maintenance, deposit refunds, and service quality. The "managed" aspect of managed rentals did not always meet expectations.', source: 'User reviews' },
    ],
  },
  {
    slug: 'zolo-issues',
    competitor: 'zolo',
    seoKey: 'zolo',
    title: 'What to Know About Zolo Stays Service',
    intro: "With a Trustpilot rating of 1.7/5, Zolo Stays' premium positioning contrasts with service issues reported by a number of users. Here is a balanced overview.",
    issues: [
      { title: 'Low Trustpilot rating: 1.7/5', description: 'Zolo Stays has a Trustpilot rating of 1.7 out of 5, indicating widespread user dissatisfaction. The "premium co-living" positioning does not always match reported user experiences.', source: 'Trustpilot reviews' },
      { title: 'Additional charges and fee adjustments', description: 'Users report unexpected fee increases after signing agreements. Items that appeared included in the rent sometimes become additional charges.', source: 'User testimonials, reviews' },
      { title: 'Security deposit refund delays', description: 'Multiple complaints note that security deposit refunds can take considerable time after move-out. The refund process is described as lengthy by several users.', source: 'Trustpilot, Google Play reviews' },
      { title: 'Maintenance request delays', description: 'Maintenance requests are reportedly sometimes delayed. Users paying premium prices note slower-than-expected responses to certain issues.', source: 'User reviews' },
      { title: 'Gap between marketing and experience', description: 'Marketing materials describe amenities and services that, according to some users, do not fully materialize. The actual experience can fall short of advertised claims.', source: 'User testimonials' },
    ],
  },
];

export const truthBySlug = (slug: string) => TRUTH_PAGES.find((t) => t.slug === slug) ?? null;

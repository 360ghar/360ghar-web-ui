/**
 * Site-wide JSON-LD blocks (added to every page by Seo.astro unless `bare`).
 * Old site: Organization, WebSite, LocalBusiness, KnowledgePanel, MobileApplication,
 * Person, Speakable. Differences here:
 * - "KnowledgePanel" is not a schema.org type. Its useful fields (knowsAbout,
 *   contactPoint, extra alternate names) are merged into the Organization block.
 * - Speakable is only valid inside a WebPage (`speakable` property), and the old
 *   selectors (.speakable-summary, .speakable-highlights) do not exist in v2.
 *   `speakableWebPage()` is opt-in and takes selectors the caller has checked.
 * - The founder image (/assets/images/thumbs/team1.webp) is not in public/, so it is left out.
 * No relative imports without an extension: scripts/*.mjs load this file with Node's type stripping.
 */
import { APPS } from '../apps.ts';
import { authors } from './legacy/authors.js';
import { realEstateStructuredData as old } from './legacy/structuredData.js';

const SITE = 'https://360ghar.com';
export const ORGANIZATION_ID = `${SITE}/#organization`;
export const FOUNDER_ID = `${SITE}/#founder`;
export const APP_ID = `${SITE}/#android-app`;
export const FLATMATES_APP_ID = `${SITE}/#flatmates-app`;

/** The Google Play page of 360Ghar (src/lib/apps.ts). */
export const PLAY_STORE_URL = APPS.ghar360.play;

type Block = Record<string, unknown>;

const uniq = <T>(list: T[]) => [...new Set(list)];

export function organizationBlock(): Block {
  const panel = old.knowledgePanel;
  return {
    ...old.organization,
    alternateName: uniq([...old.organization.alternateName, ...panel.alternateName]),
    contactPoint: panel.contactPoint,
    knowsAbout: panel.knowsAbout,
    founder: { '@id': FOUNDER_ID },
    sameAs: uniq([...old.organization.sameAs, ...panel.sameAs]),
  };
}

export function personBlock(): Block {
  const p = authors['saksham-mittal'];
  return {
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: p.name,
    jobTitle: p.title,
    // Not p.bio: the old text says "India's first AI + VR-first platform", a claim we cannot back up (same wording as the About page).
    description: `${p.name} is the founder and CEO of 360Ghar. He leads product strategy and technology.`,
    url: p.linkedin,
    sameAs: [p.linkedin],
    worksFor: { '@id': ORGANIZATION_ID },
    knowsAbout: p.credentials.split(',').map((s) => s.trim()),
  };
}

/** The store pages where an app is live (src/lib/apps.ts). A store with no URL yet is left out. */
const liveUrls = (app: { play: string; ios: string | null }) => [app.play, app.ios].filter((u): u is string => Boolean(u));

function appBlock(id: string, app: { play: string; ios: string | null }, fields: Block): Block {
  const urls = liveUrls(app);
  return {
    '@type': 'MobileApplication',
    '@id': id,
    ...fields,
    operatingSystem: app.ios ? 'Android, iOS' : 'Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    downloadUrl: urls.length === 1 ? urls[0] : urls,
    installUrl: urls.length === 1 ? urls[0] : urls,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function mobileApplicationBlock(): Block {
  const { name, applicationCategory, inLanguage, description, featureList } = old.mobileApplication;
  return appBlock(APP_ID, APPS.ghar360, { name, applicationCategory, inLanguage, description, featureList });
}

/** 360 FlatMates. Description from the store listing (360-flatmates/docs/app_store_metadata.md). */
export function flatmatesApplicationBlock(): Block {
  return appBlock(FLATMATES_APP_ID, APPS.flatmates, {
    name: APPS.flatmates.name,
    applicationCategory: 'LifestyleApplication',
    inLanguage: ['en-IN', 'hi-IN'],
    description: 'Find compatible flatmates and verified flats in India. Match on lifestyle, chat in the app and schedule visits.',
  });
}

/** WebPage with a speakable part. Only pass selectors that exist in the page markup. */
export function speakableWebPage(url: string, cssSelectors: string[]): Block | null {
  const selectors = cssSelectors.filter(Boolean);
  if (!selectors.length) return null;
  return { '@type': 'WebPage', '@id': `${url}#webpage`, url, speakable: { '@type': 'SpeakableSpecification', cssSelector: selectors } };
}

/** Every page: Organization, WebSite, LocalBusiness, Person and one MobileApplication per app. */
export function siteBlocks(): Block[] {
  return [organizationBlock(), old.website, old.localBusiness, personBlock(), mobileApplicationBlock(), flatmatesApplicationBlock()];
}

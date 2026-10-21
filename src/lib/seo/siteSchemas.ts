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
import { authors } from './legacy/authors.js';
import { realEstateStructuredData as old } from './legacy/structuredData.js';

const SITE = 'https://360ghar.com';
export const ORGANIZATION_ID = `${SITE}/#organization`;
export const FOUNDER_ID = `${SITE}/#founder`;
export const APP_ID = `${SITE}/#android-app`;

/** The only store link the site has (src/features/layout/nav.ts PLAY_STORE). No App Store link exists yet. */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360';

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

export function mobileApplicationBlock(): Block {
  const { name, applicationCategory, operatingSystem, inLanguage, offers, description, featureList } = old.mobileApplication;
  return {
    '@type': 'MobileApplication',
    '@id': APP_ID,
    name,
    applicationCategory,
    operatingSystem,
    inLanguage,
    offers,
    description,
    featureList,
    downloadUrl: PLAY_STORE_URL,
    installUrl: PLAY_STORE_URL,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** WebPage with a speakable part. Only pass selectors that exist in the page markup. */
export function speakableWebPage(url: string, cssSelectors: string[]): Block | null {
  const selectors = cssSelectors.filter(Boolean);
  if (!selectors.length) return null;
  return { '@type': 'WebPage', '@id': `${url}#webpage`, url, speakable: { '@type': 'SpeakableSpecification', cssSelector: selectors } };
}

/** Every page: Organization, WebSite, LocalBusiness, Person, MobileApplication. */
export function siteBlocks(): Block[] {
  return [organizationBlock(), old.website, old.localBusiness, personBlock(), mobileApplicationBlock()];
}

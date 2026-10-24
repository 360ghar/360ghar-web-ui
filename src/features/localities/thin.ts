/**
 * Name predicates for thin locality rows, with no imports, so the Node data script
 * (`scripts/data/build-locality-redirects.mjs`, which cannot read the "@/" alias)
 * and `data.ts` use the same code.
 */

/** Names scraped from search pages: "projects in dlf phase 1". */
export const isScrapedName = (name: string) => /^projects in /i.test(name);

const ADJ = 'royal|green|silver|golden|platinum|diamond|pearl|coral|emerald|ruby|sapphire|opal|jade|crystal|gems|crown|majestic|grand|elite|premium|luxury|signature|pinnacle|apex|zenith|summit';
const NOUN = 'apartments|residency|heights|view|enclave|estate|villas|homes|court|park|plaza|towers|terraces|meadows|woods|greens|gardens|valley|hills|springs|waters|breeze|winds';
const GENERATED = new RegExp(`^(housing board colony sector \\d+|huda sector \\d+|rwa sector \\d+|block [a-d] sector \\d+|sector \\d+ extension|(${ADJ}) (${NOUN}) sector \\d+)$`, 'i');

/** Names the old site's seed script made up (see `isGeneratedSeed` in data.ts). */
export const isGeneratedSeedName = (name: string) => GENERATED.test(name);

/** Scraped or seed-invented (see `isThinLocality` in data.ts). */
export const isThinLocalityName = (name: string) => isScrapedName(name) || isGeneratedSeedName(name);

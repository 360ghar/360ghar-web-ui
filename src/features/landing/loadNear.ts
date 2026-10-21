import type { AstroGlobal } from 'astro';
import landmarks from '@/data/office-landmarks.json';
import { cachePage, respond } from '@/lib/cache';
import { emptyFilters, parseFilters, type Filters } from '@/features/search/filters';
import { loadFirstPage } from '@/features/search/load';

export type Landmark = { name: string; slug: string; city: string; lat: number; lng: number; type: string; description: string };

export const LANDMARKS = landmarks as Landmark[];

/**
 * Descriptions shown on the near pages. They replace the ones in
 * office-landmarks.json, which name companies and staff counts the site cannot back.
 */
export const NEAR_EN: Record<string, string> = {
  'cyber-city': 'The main IT and office district of Gurgaon, with the offices of many large companies and a Rapid Metro loop.',
  'udyog-vihar': 'A large industrial and office area in Sectors 18 to 20, with factories, IT parks and corporate offices.',
  'golf-course-road-corporate': 'An office corridor with company headquarters and large commercial complexes.',
  'millennium-city-centre': 'The Yellow Line metro station (formerly HUDA City Centre) that links Gurgaon to Delhi.',
  medanta: 'A large multi-specialty hospital in Sector 38. People who work there look for homes in the sectors nearby.',
  artemis: 'A large multi-specialty hospital in Sector 51. Doctors, staff and patients’ families look for rentals nearby.',
  'sector-55-56-metro': 'The Rapid Metro station of the Sectors 55-56 housing area, with a direct line to Cyber City.',
  'dlf-cyber-park': 'An IT park in DLF Phase 3, home to technology companies and startups.',
  'ambience-mall': 'One of the large malls of NCR, on NH-48 (old NH-8). The sectors around it have steady rental demand.',
  'hero-honda-chowk': 'A large junction on NH-48 (old NH-8) that links Gurgaon to Delhi and the airport.',
};

/** Hindi names and descriptions of the landmarks in src/data/office-landmarks.json. */
export const NEAR_HI: Record<string, { name: string; description: string }> = {
  'cyber-city': { name: 'साइबर सिटी', description: 'गुड़गाँव का मुख्य IT और कॉर्पोरेट इलाका, जहाँ बड़ी कंपनियों के ऑफ़िस हैं।' },
  'udyog-vihar': { name: 'उद्योग विहार', description: 'सेक्टर 18 से 20 का बड़ा औद्योगिक और कमर्शियल इलाका, जहाँ फ़ैक्ट्रियाँ, IT पार्क और कॉर्पोरेट ऑफ़िस हैं।' },
  'golf-course-road-corporate': { name: 'गोल्फ़ कोर्स रोड', description: 'बड़ी कंपनियों के मुख्यालयों और कमर्शियल कॉम्प्लेक्स वाला कॉर्पोरेट कॉरिडोर।' },
  'millennium-city-centre': { name: 'मिलेनियम सिटी सेंटर मेट्रो', description: 'येलो लाइन का अहम मेट्रो स्टेशन (पहले हुडा सिटी सेंटर), जो गुड़गाँव को दिल्ली से जोड़ता है।' },
  medanta: { name: 'मेदांता अस्पताल', description: 'सेक्टर 38 का बड़ा मल्टी-स्पेशलिटी अस्पताल। यहाँ काम करने वालों से पास के सेक्टरों में घरों की माँग रहती है।' },
  artemis: { name: 'आर्टेमिस अस्पताल', description: 'सेक्टर 51 का बड़ा मल्टी-स्पेशलिटी अस्पताल। डॉक्टरों और मरीज़ों के परिवारों से किराये की माँग रहती है।' },
  'sector-55-56-metro': { name: 'सेक्टर 55-56 रैपिड मेट्रो', description: 'सेक्टर 55-56 के रिहायशी इलाके का रैपिड मेट्रो स्टेशन, जो सीधे साइबर सिटी से जुड़ता है।' },
  'dlf-cyber-park': { name: 'DLF साइबर पार्क', description: 'DLF फ़ेज़ 3 का IT पार्क, जहाँ टेक कंपनियाँ और स्टार्टअप हैं।' },
  'ambience-mall': { name: 'एंबियंस मॉल', description: 'NH-48 (पुराना NH-8) पर NCR के बड़े मॉल में से एक। आस-पास के सेक्टरों में किराये की माँग रहती है।' },
  'hero-honda-chowk': { name: 'हीरो होंडा चौक / NH-8', description: 'NH-48 (पुराना NH-8) का बड़ा जंक्शन, जो गुड़गाँव को दिल्ली और एयरपोर्ट से जोड़ता है।' },
};

/** Data, status and caching for /near/:slug (homes near an office hub). Call from the route file. */
export async function loadNear(Astro: AstroGlobal) {
  const lm = LANDMARKS.find((x) => x.slug === (Astro.params.slug ?? '').toLowerCase()) ?? null;
  let first = null;
  let filters: Filters | null = null;
  if (lm) {
    filters = { ...emptyFilters(), ...parseFilters(Astro.url.searchParams), lat: lm.lat, lng: lm.lng, radius: 5, place: lm.name };
    first = await loadFirstPage(filters);
    cachePage(Astro, 'hour', { error: Boolean(first.error) });
  } else {
    respond(Astro, 'hour', { notFound: true });
  }
  return { lm, first, filters };
}

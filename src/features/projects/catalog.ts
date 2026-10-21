/**
 * Project pages from the old site (static catalog, 8 entries). Each project
 * is one filter over the live homes, so the page always shows real inventory.
 * The copy says what the page lists and nothing more: no developer names,
 * RERA numbers, prices or amenities that the site cannot show.
 */
import type { PropertyType } from '@/lib/api/types';

export type Project = {
  id: number;
  slug: string;
  title: string;
  titleHi: string;
  desc: string;
  descHi: string;
  image: string;
  /** Filters for the "homes like this" list. */
  match: { locality?: string; property_type?: PropertyType[]; purpose?: 'buy' | 'rent' };
};

export const PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'turning-dreams-into-addresses-home-state',
    title: 'Turning Dreams into Addresses Home State',
    titleHi: 'सपनों को पते में बदलना: होम स्टेट',
    desc: 'The newest homes listed on 360Ghar across Gurugram, for sale and for rent, each with real photos.',
    descHi: '360Ghar पर पूरे गुरुग्राम में लिस्ट हुए सबसे नए घर, बिक्री और किराये दोनों, हर घर असली फ़ोटो के साथ।',
    image: '/assets/images/thumbs/project-img1.webp',
    match: {},
  },
  {
    id: 2,
    slug: 'your-journey-homeownership-starts-here-too',
    title: 'Your journey homeownership starts here too',
    titleHi: 'घर के मालिक बनने का सफ़र यहीं से',
    desc: 'Homes for sale on 360Ghar across Gurugram, newest first. Compare the price, the size and the photos, then book a visit.',
    descHi: '360Ghar पर पूरे गुरुग्राम में बिकाऊ घर, सबसे नए पहले। कीमत, साइज़ और फ़ोटो की तुलना करें, फिर विज़िट बुक करें।',
    image: '/assets/images/thumbs/project-img2.webp',
    match: { purpose: 'buy' },
  },
  {
    id: 3,
    slug: 'luxury-apartments-in-sector-62',
    title: 'Luxury Apartments in Sector 62',
    titleHi: 'सेक्टर 62 में लग्ज़री अपार्टमेंट',
    desc: 'Apartments for sale and for rent in Sector 62, Gurugram, off Golf Course Extension Road, from the live 360Ghar list.',
    descHi: 'गोल्फ़ कोर्स एक्सटेंशन रोड के पास सेक्टर 62, गुरुग्राम में बिक्री और किराये के अपार्टमेंट, 360Ghar की लाइव सूची से।',
    image: '/assets/images/thumbs/project-img3.webp',
    match: { locality: 'Sector 62', property_type: ['apartment'] },
  },
  {
    id: 4,
    slug: 'commercial-complex-in-sector-18',
    title: 'Commercial Complex in Sector 18',
    titleHi: 'सेक्टर 18 में कमर्शियल कॉम्प्लेक्स',
    desc: 'Offices and shops in Sector 18, Gurugram, next to Udyog Vihar, from the live 360Ghar list.',
    descHi: 'उद्योग विहार के पास सेक्टर 18, गुरुग्राम में ऑफ़िस और दुकानें, 360Ghar की लाइव सूची से।',
    image: '/assets/images/thumbs/project-img4.webp',
    match: { locality: 'Sector 18', property_type: ['office', 'shop'] },
  },
  {
    id: 5,
    slug: 'building-trust-one-home-at-a-time',
    title: 'Building Trust, One Home at a Time',
    titleHi: 'हर घर के साथ भरोसा',
    desc: 'Every home on 360Ghar in Gurugram, newest first. Owners list free, and home seekers pay no brokerage to 360Ghar.',
    descHi: '360Ghar पर गुरुग्राम का हर घर, सबसे नए पहले। मालिक मुफ़्त लिस्ट करते हैं, और घर खोजने वाले 360Ghar को कोई ब्रोकरेज नहीं देते।',
    image: '/assets/images/thumbs/project-img5.webp',
    match: {},
  },
  {
    id: 6,
    slug: 'independent-houses-in-sector-49',
    title: 'Independent Houses in Sector 49',
    titleHi: 'सेक्टर 49 में स्वतंत्र मकान',
    desc: 'Independent houses in Sector 49, Gurugram, off Sohna Road, from the live 360Ghar list.',
    descHi: 'सोहना रोड के पास सेक्टर 49, गुरुग्राम में स्वतंत्र मकान, 360Ghar की लाइव सूची से।',
    image: '/assets/images/thumbs/project-img6.webp',
    match: { locality: 'Sector 49', property_type: ['house'] },
  },
  {
    id: 7,
    slug: 'guiding-you-home-with-experience',
    title: 'Guiding You Home with Experience',
    titleHi: 'अनुभव के साथ घर तक',
    desc: 'Homes for rent on 360Ghar across Gurugram, newest first, with the monthly rent on every card.',
    descHi: '360Ghar पर पूरे गुरुग्राम में किराये के घर, सबसे नए पहले, हर कार्ड पर मासिक किराये के साथ।',
    image: '/assets/images/thumbs/project-img3.webp',
    match: { purpose: 'rent' },
  },
  {
    id: 8,
    slug: 'villa-projects-in-dlf-phase-2',
    title: 'Villa Projects in DLF Phase 2',
    titleHi: 'DLF फ़ेज़ 2 में विला प्रोजेक्ट',
    desc: 'Villas in DLF Phase 2, Gurugram, close to MG Road and Cyber City, from the live 360Ghar list.',
    descHi: 'MG रोड और साइबर सिटी के पास DLF फ़ेज़ 2, गुरुग्राम में विला, 360Ghar की लाइव सूची से।',
    image: '/assets/images/thumbs/project-img4.webp',
    match: { locality: 'DLF Phase 2', property_type: ['villa'] },
  },
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug) ?? null;

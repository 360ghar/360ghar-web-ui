/**
 * Titles, headings and FAQs for landing pages. SEO titles and descriptions
 * reuse the old site's templates (src/i18n/locales/*\/landing.json) so the
 * pages keep their search snippets.
 */
import { getT } from '@/i18n';
import { undash } from '@/features/content/shared/text';
import type { PropertyType } from '@/lib/api/types';
import type { Locale } from '@/lib/i18n/locale';
import { budgetLabel, CITIES, type Facet, type Intent, type Landing } from './model';

const PLURAL: Partial<Record<PropertyType, [string, string]>> = {
  apartment: ['Flats', 'फ़्लैट'],
  house: ['Independent houses', 'स्वतंत्र मकान'],
  builder_floor: ['Builder floors', 'बिल्डर फ़्लोर'],
  villa: ['Villas', 'विला'],
  plot: ['Plots', 'प्लॉट'],
  office: ['Office space', 'ऑफ़िस स्पेस'],
  shop: ['Shops', 'दुकानें'],
  pg: ['PG', 'पीजी'],
};

export function landingCopy(l: Landing, facet: Facet | undefined, locale: Locale) {
  const hi = locale === 'hi';
  const t = getT(locale);
  const tEn = getT('en');
  const city = hi ? (CITIES[l.city]?.hi ?? l.cityName) : l.cityName;
  const plural = (x: PropertyType) => PLURAL[x]?.[hi ? 1 : 0] ?? x;
  const facetCap = plural(l.type);
  const facetLower = hi ? facetCap : facetCap.toLowerCase();
  const verbEn = l.intent === 'rent' ? 'renting' : l.intent === 'pg' ? 'staying in a PG in' : 'buying';
  const intentLabel = l.intent === 'rent' ? 'Rent' : l.intent === 'pg' ? 'PG' : 'Sale';
  const bhk = facet?.kind === 'bhk' ? `${facet.bhk}${facet.bhk >= 4 ? '+' : ''} BHK ` : '';
  const budget = facet?.kind === 'budget' ? ` ${budgetLabel(facet.key, hi)}` : '';
  const amenity = facet?.kind === 'amenity' ? (hi ? ` (${facet.title})` : ` with ${facet.title}`) : '';

  // Visible heading.
  const h1 = hi
    ? l.intent === 'pg'
      ? `${city} में ${bhk}पीजी${budget}${amenity}`
      : `${city} में ${bhk}${facetCap} ${l.intent === 'rent' ? 'किराये पर' : 'बिक्री के लिए'}${budget}${amenity}`
    : l.intent === 'pg'
      ? `${bhk}PG in ${city}${budget}${amenity}`
      : `${bhk}${bhk ? facetLower : facetCap} for ${l.intent === 'rent' ? 'rent' : 'sale'} in ${city}${budget}${amenity}`;

  // SEO title and description (old templates).
  const typeSingular = t(`properties:taxonomy.propertyType.${l.type}`) || facetCap;
  let title: string;
  let description: string;
  if (!facet) {
    title = l.intent === 'pg' ? t('landing:seo.titlePg', { city }) : t('landing:seo.titleBuyRent', { facet: typeSingular, verb: verbEn, city });
    const gurgaon = l.city === 'gurgaon';
    description =
      l.intent === 'pg'
        ? t('landing:seo.descPg', { facetLower: typeSingular.toLowerCase(), city, gurgaonHindi: gurgaon ? t('landing:seo.descPgGurgaon') : '' })
        : t('landing:seo.descBuyRent', {
            facetLower: typeSingular.toLowerCase(),
            city,
            intent: l.intent,
            gurgaonHindi: gurgaon
              ? t(l.intent === 'buy' ? 'landing:seo.descBuyRentGurgaonBuy' : 'landing:seo.descBuyRentGurgaonRent', { city, facetLower: typeSingular.toLowerCase() })
              : '',
          });
  } else {
    const vars = { bhk, facetText: facetCap, intentLabel, city, budget, amenity };
    title = l.intent === 'pg' ? t('landing:facetSeo.titlePg', vars) : t('landing:facetSeo.titleBuyRent', vars);
    description = [
      l.intent === 'pg'
        ? t('landing:facetSeo.descPg', { facetTextLower: facetLower, city })
        : t('landing:facetSeo.descBuyRent', { facetTextLower: facetLower, city, validIntent: l.intent }),
      facet.kind === 'bhk' ? t('landing:facetSeo.descBhk', { bhkText: bhk.trim() }) : '',
      facet.kind === 'budget' ? t('landing:facetSeo.descBudget', { budgetText: budgetLabel(facet.key, hi) }) : '',
      facet.kind === 'amenity' ? t('landing:facetSeo.descAmenity', { amenityPretty: facet.title }) : '',
      t('landing:facetSeo.descSuffix'),
    ]
      .filter(Boolean)
      .join(' ');
  }

  // The old FAQ copy uses em dashes; the design law asks for none.
  const faqs = (facet ? facetFaqs() : baseFaqs()).map((f) => ({ q: undash(f.q), a: undash(f.a) }));

  function baseFaqs() {
    const preposition = l.intent === 'pg' ? 'in' : `for ${verbEn}`;
    const vars = {
      facetLower,
      preposition,
      city,
      accommodation: l.intent === 'pg' ? 'accommodation' : verbEn,
      intentNoun: l.intent === 'rent' ? 'Rental' : l.intent === 'pg' ? 'PG' : 'Sale',
      hindiAction: l.intent === 'buy' ? 'kharidne' : 'kiraye par lene',
      hindiBuyRent: l.intent === 'buy' ? 'kharidne' : 'kiraye',
      hindiDocSuffix: t(l.intent === 'buy' ? 'landing:landingFaqs.q4DocBuy' : 'landing:landingFaqs.q4DocRent'),
      feeIntent: l.intent === 'buy' ? 'buying' : 'renting',
    };
    return [1, 2, 3, 4, 5, 6, 7, 8]
      .map((n) => ({ q: t(`landing:landingFaqs.q${n}`, vars), a: t(`landing:landingFaqs.a${n}`, vars) }))
      .filter((f) => f.q && f.a);
  }

  function facetFaqs() {
    const vars = {
      bhkPrefix: bhk,
      facetTextLower: facetLower,
      facetPreposition: l.intent === 'pg' ? 'in' : `for ${l.intent === 'rent' ? 'rent' : 'sale'} in`,
      city,
      budgetSuffix: budget,
      budgetSuffixDetail: budget,
      hindiAction: l.intent === 'buy' ? 'kharidne ke liye' : 'kiraye par',
      verb: l.intent === 'buy' ? 'buy' : 'rent',
      verbIng: l.intent === 'buy' ? 'buying' : 'renting',
      amenityPretty: facet?.kind === 'amenity' ? facet.title : '',
    };
    const list = [
      { q: t('landing:facetFaqs.q1', vars), a: t('landing:facetFaqs.a1', vars) },
      { q: t('landing:facetFaqs.q2', vars), a: t('landing:facetFaqs.a2', vars) },
      { q: t('landing:facetFaqs.q3', vars), a: t('landing:facetFaqs.a3', vars) },
      { q: t('landing:facetFaqs.q4', vars), a: t(l.intent === 'buy' ? 'landing:facetFaqs.a4Buy' : 'landing:facetFaqs.a4Rent', vars) },
      { q: t('landing:facetFaqs.q5', vars), a: t('landing:facetFaqs.a5', vars) },
    ];
    if (facet?.kind === 'amenity') list.push({ q: t('landing:facetFaqs.q6', vars), a: t('landing:facetFaqs.a6', vars) });
    return list.filter((f) => f.q && f.a);
  }

  const intentName = (i: Intent) => (i === 'buy' ? (hi ? 'खरीदें' : 'Buy') : i === 'rent' ? (hi ? 'किराया' : 'Rent') : hi ? 'पीजी' : 'PG');
  const crumbs = [
    { name: hi ? 'होम' : 'Home', path: '/' },
    { name: city, path: `/${l.city}` },
    { name: l.intent === 'pg' ? `PG` : `${facetCap} · ${intentName(l.intent)}`, path: l.path },
    ...(facet ? [{ name: h1 }] : []),
  ];
  if (!facet) crumbs[crumbs.length - 1] = { name: h1, path: l.path };

  return {
    h1,
    title,
    description,
    faqs,
    crumbs,
    facetCap,
    facetLower,
    typePlural: plural,
    intentLink: (i: Intent) =>
      hi
        ? i === 'pg'
          ? `${city} में पीजी`
          : `${city} में ${i === 'rent' ? 'किराये पर घर' : 'घर खरीदें'}`
        : i === 'pg'
          ? `PG in ${city}`
          : `${i === 'rent' ? 'Rent' : 'Buy'} in ${city}`,
    tEn,
  };
}

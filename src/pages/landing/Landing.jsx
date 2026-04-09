import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { isIndexableCitySlug } from '../../seo/indexationPolicy';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';
import {
  getPropertyRouteSlug,
  getPropertyTypeLabel,
  normalizePropertyTypeToken,
} from '../../utils/propertyTaxonomy';
import { buildLandingKeywords } from '../../utils/landingKeywords';
import { I18nLink } from '../../i18n/I18nLink';
import localitiesIndex from '../../data/localities-index.json';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const VALID_INTENTS = ['buy', 'rent', 'pg'];

const INTENT_ALTERNATES = {
  buy: ['rent', 'pg'],
  rent: ['buy', 'pg'],
  pg: ['rent', 'buy'],
};

const RELATED_TYPES = {
  apartment: ['builder_floor', 'villa', 'studio'],
  builder_floor: ['apartment', 'house', 'villa'],
  house: ['villa', 'builder_floor', 'apartment'],
  villa: ['house', 'apartment', 'penthouse'],
  plot: ['house', 'villa', 'builder_floor'],
  studio: ['apartment', 'pg', 'flatmate'],
  pg: ['flatmate', 'apartment', 'studio'],
  flatmate: ['pg', 'apartment', 'studio'],
  condo: ['apartment', 'penthouse', 'villa'],
  penthouse: ['apartment', 'villa', 'condo'],
  loft: ['studio', 'apartment', 'condo'],
  room: ['pg', 'flatmate', 'studio'],
  office: ['shop', 'warehouse'],
  shop: ['office', 'warehouse'],
  warehouse: ['office', 'shop'],
};

/** Price context ranges by city + intent for Indian real estate. */
const PRICE_CONTEXT = {
  gurgaon: {
    buy: { apartment: '85 lakhs - 3.5 crore', villa: '2.5 - 8 crore', builder_floor: '65 lakhs - 2.5 crore', house: '1.5 - 6 crore', plot: '50 lakhs - 4 crore', default: '70 lakhs - 4 crore' },
    rent: { apartment: '15,000 - 85,000/month', villa: '60,000 - 3 lakh/month', builder_floor: '12,000 - 55,000/month', house: '25,000 - 1.5 lakh/month', default: '12,000 - 1 lakh/month' },
    pg: { default: '7,000 - 25,000/month' },
  },
  delhi: {
    buy: { apartment: '50 lakhs - 4 crore', default: '40 lakhs - 5 crore' },
    rent: { apartment: '10,000 - 80,000/month', default: '8,000 - 70,000/month' },
    pg: { default: '6,000 - 20,000/month' },
  },
  noida: {
    buy: { apartment: '40 lakhs - 2.5 crore', default: '35 lakhs - 3 crore' },
    rent: { apartment: '10,000 - 50,000/month', default: '8,000 - 45,000/month' },
    pg: { default: '5,000 - 18,000/month' },
  },
  faridabad: {
    buy: { apartment: '30 lakhs - 1.5 crore', default: '25 lakhs - 2 crore' },
    rent: { apartment: '8,000 - 35,000/month', default: '7,000 - 30,000/month' },
    pg: { default: '5,000 - 15,000/month' },
  },
  ghaziabad: {
    buy: { apartment: '30 lakhs - 1.2 crore', default: '25 lakhs - 1.5 crore' },
    rent: { apartment: '8,000 - 30,000/month', default: '7,000 - 25,000/month' },
    pg: { default: '5,000 - 12,000/month' },
  },
};

const CITY_TO_LOCALITY_CITY = {
  gurgaon: 'Gurgaon',
  gurugram: 'Gurgaon',
  delhi: 'Delhi',
  noida: 'Noida',
  faridabad: 'Faridabad',
  ghaziabad: 'Ghaziabad',
};

const getCityLocalities = (citySlug, limit = 5) => {
  const cityName = CITY_TO_LOCALITY_CITY[citySlug];
  if (!cityName) return [];
  const typePriority = { sector: 0, society: 1, locality: 2, phase: 3, project: 4, road: 5, township: 6, village: 7 };
  return localitiesIndex
    .filter((l) => l.city === cityName)
    .sort((a, b) => (typePriority[a.entityType] ?? 9) - (typePriority[b.entityType] ?? 9) || a.name.localeCompare(b.name))
    .slice(0, limit);
};

const getPriceRange = (citySlug, intent, canonicalType) => {
  const cityPrices = PRICE_CONTEXT[citySlug];
  if (!cityPrices) return null;
  const intentPrices = cityPrices[intent];
  if (!intentPrices) return null;
  return intentPrices[canonicalType] || intentPrices.default || null;
};

const buildLandingFaqs = (t, city, facet, validIntent) => {
  const verb = validIntent === 'rent' ? 'renting' : validIntent === 'pg' ? 'staying in a PG in' : 'buying';
  const intentNoun = validIntent === 'pg' ? 'PG and co-living' : validIntent === 'rent' ? 'rental' : 'resale and new launch';
  const lcFacet = facet.toLowerCase();
  const accommodation = validIntent === 'pg' ? 'accommodation' : verb;

  // Hindi-specific variables for Q4
  const hindiAction = validIntent === 'buy' ? 'kharidne' : validIntent === 'pg' ? 'ke liye' : 'kiraye par lene';
  const hindiBuyRent = validIntent === 'buy' ? 'kharidne' : 'rent karne';
  const hindiDocSuffix = validIntent === 'buy'
    ? t('landing:landingFaqs.q4DocBuy')
    : t('landing:landingFaqs.q4DocRent');

  // Fee intent variable for Q6
  const feeIntent = validIntent === 'buy' ? 'buying' : validIntent === 'pg' ? 'PG' : 'renting';

  return [
    {
      question: t('landing:landingFaqs.q1', { facetLower: lcFacet, preposition: validIntent === 'pg' ? 'in' : `for ${verb}`, city }),
      answer: t('landing:landingFaqs.a1', { facetLower: lcFacet, city, intentNoun }),
    },
    {
      question: t('landing:landingFaqs.q2', { facetLower: lcFacet, accommodation, city }),
      answer: t('landing:landingFaqs.a2'),
    },
    {
      question: t('landing:landingFaqs.q3', { city }),
      answer: t('landing:landingFaqs.a3'),
    },
    {
      question: t('landing:landingFaqs.q4', { city, facetLower: lcFacet, hindiAction }),
      answer: t('landing:landingFaqs.a4', { hindiBuyRent, hindiDocSuffix }),
    },
    {
      question: t('landing:landingFaqs.q5', { facetLower: lcFacet, city }),
      answer: t('landing:landingFaqs.a5', { facetLower: lcFacet, city }),
    },
    {
      question: t('landing:landingFaqs.q6', { feeIntent, facetLower: lcFacet, city }),
      answer: t('landing:landingFaqs.a6'),
    },
    {
      question: t('landing:landingFaqs.q7'),
      answer: t('landing:landingFaqs.a7'),
    },
    {
      question: t('landing:landingFaqs.q8', { facetLower: lcFacet, city }),
      answer: t('landing:landingFaqs.a8', { facetLower: lcFacet, city }),
    },
  ];
};

const Landing = () => {
  const { t } = useTranslation('landing');
  const { citySlug, intent, type } = useParams();
  const canonicalCitySlug = citySlug === 'gurugram' ? 'gurgaon' : citySlug;
  const shouldIndex = isIndexableCitySlug(canonicalCitySlug);
  const city = pretty(citySlug);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const canonicalType = validIntent === 'pg'
    ? 'pg'
    : normalizePropertyTypeToken(type)[0] || 'apartment';
  const canonicalTypeSlug = getPropertyRouteSlug(canonicalType, validIntent);
  const canonicalPath = `/${canonicalCitySlug}/${validIntent}/${canonicalTypeSlug}`;
  const facet = getPropertyTypeLabel(canonicalType);
  const intentLabel = validIntent === 'pg' ? 'PG' : pretty(validIntent);
  const browseQuery = buildPropertySearchQuery({
    city,
    purpose: validIntent === 'pg' ? 'rent' : validIntent,
    property_type: [canonicalType],
  });

  const citySearchUrl = (() => {
    const u = new URL('https://360ghar.com/properties');
    u.searchParams.set('city', city);
    u.searchParams.set('intent', validIntent);
    return u.toString();
  })();

  const verb = validIntent === 'rent' ? 'Rent' : validIntent === 'pg' ? 'PG' : 'Buy';
  const title = validIntent === 'pg'
    ? t('landing:seo.titlePg', { city })
    : t('landing:seo.titleBuyRent', { facet, verb, city });

  const cityLower = city.toLowerCase();
  const isGurgaon = cityLower.includes('gurgaon') || cityLower.includes('gurugram');
  const description = validIntent === 'pg'
    ? t('landing:seo.descPg', {
        facetLower: facet.toLowerCase(),
        city,
        gurgaonHindi: isGurgaon ? t('landing:seo.descPgGurgaon') : '',
      })
    : t('landing:seo.descBuyRent', {
        facetLower: facet.toLowerCase(),
        city,
        intent: validIntent,
        gurgaonHindi: isGurgaon
          ? (validIntent === 'buy'
            ? t('landing:seo.descBuyRentGurgaonBuy', { city, facetLower: facet.toLowerCase() })
            : t('landing:seo.descBuyRentGurgaonRent', { city, facetLower: facet.toLowerCase() }))
          : '',
      });

  const keywords = buildLandingKeywords({ facet, city, validIntent });

  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: city, url: citySearchUrl },
    { name: `${facet} - ${intentLabel}`, url: `https://360ghar.com${canonicalPath}` },
  ];

  // --- Enrichment data ---

  const popularLocalities = getCityLocalities(canonicalCitySlug, 5);

  const priceRange = getPriceRange(canonicalCitySlug, validIntent, canonicalType);

  const faqItems = buildLandingFaqs(t, city, facet, validIntent);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const relatedSearches = [];
  (INTENT_ALTERNATES[validIntent] || []).forEach((altIntent) => {
    relatedSearches.push({
      to: `/${canonicalCitySlug}/${altIntent}/${canonicalTypeSlug}`,
      label: t('landing:relatedSearches.label', { facet, intentLabel: pretty(altIntent), city }),
    });
  });
  (RELATED_TYPES[canonicalType] || []).slice(0, 2).forEach((rt) => {
    relatedSearches.push({
      to: `/${canonicalCitySlug}/${validIntent}/${getPropertyRouteSlug(rt, validIntent)}`,
      label: t('landing:relatedSearches.label', { facet: getPropertyTypeLabel(rt), intentLabel, city }),
    });
  });
  const visibleRelatedSearches = relatedSearches.slice(0, 4);

  const faqStructuredData = {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  // Preposition for price overview
  const pricePreposition = validIntent === 'pg'
    ? t('landing:priceOverview.prepositionPg')
    : t('landing:priceOverview.prepositionBuy', { intentLabel: intentLabel.toLowerCase() });

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonical={canonicalPath}
        noindex={!shouldIndex}
        structuredData={[
          generateBreadcrumbStructuredData(breadcrumbs),
          {
            '@type': 'CollectionPage',
            name: title,
            description,
            url: `https://360ghar.com${canonicalPath}`,
            inLanguage: ['en-IN', 'hi-IN'],
          },
          faqStructuredData,
        ]}
      />
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText="Post Property"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="padding-y-60">
          <div className="container container-two">
            {/* Hero */}
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{title}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center">
              <I18nLink
                to={`/properties?${browseQuery}`}
                className="btn btn-main"
              >
                {t('landing:hero.browseListings')}
              </I18nLink>
            </div>

            {/* Quick price context */}
            {priceRange && (
              <div className="mt-5 p-4 bg-light rounded-3 border">
                <h2 className="h5 mb-2">{t('landing:priceOverview.heading', { city, facet })}</h2>
                <p className="mb-0">
                  {t('landing:priceOverview.body', { facetLower: facet.toLowerCase(), preposition: pricePreposition, city, priceRange })}
                </p>
              </div>
            )}

            {/* Why 360Ghar */}
            <div className="mt-5">
              <h2 className="h5 mb-3">{t('landing:why360Ghar.heading')}</h2>
              <ul className="text-start">
                <li>{t('landing:why360Ghar.point1')}</li>
                <li>{t('landing:why360Ghar.point2')}</li>
                <li>{t('landing:why360Ghar.point3')}</li>
                <li>{t('landing:why360Ghar.point4')}</li>
              </ul>
            </div>

            {/* FAQ */}
            <div className="mt-5">
              <h2 className="h5 mb-3">{t('landing:faq.heading')}</h2>
              <div className="accordion" id="landingFaqAccordion">
                {faqItems.map((faq, idx) => (
                  (() => {
                    const isOpen = openFaqIndex === idx;
                    return (
                  <div className="accordion-item border-0 border-bottom" key={faq.question}>
                    <h3 className="accordion-header" id={`landingFaqHeading${idx}`}>
                      <button
                        className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`landingFaqCollapse${idx}`}
                        onClick={() => setOpenFaqIndex((currentIndex) => (currentIndex === idx ? -1 : idx))}
                      >
                        {faq.question}
                      </button>
                    </h3>
                    <div
                      id={`landingFaqCollapse${idx}`}
                      className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                      aria-labelledby={`landingFaqHeading${idx}`}
                    >
                      <div className="accordion-body text-muted">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            </div>

            {/* Related Searches */}
            {visibleRelatedSearches.length > 0 && (
              <div className="mt-5">
                <h2 className="h5 mb-3">{t('landing:relatedSearches.heading')}</h2>
                <div className="d-flex flex-wrap gap-2">
                  {visibleRelatedSearches.map((rs) => (
                    <I18nLink
                      key={rs.to}
                      to={rs.to}
                      className="btn btn-sm btn-outline-main rounded-pill"
                    >
                      {rs.label}
                    </I18nLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Popular Localities */}
        {popularLocalities.length > 0 && (
          <section className="padding-y-60 bg-light">
            <div className="container container-two">
              <h2 className="h5 mb-3">{t('landing:localities.heading', { city })}</h2>
              <p className="mb-3">
                {t('landing:localities.description', { city })}
              </p>
              <div className="row g-3">
                {popularLocalities.map((loc) => (
                  <div className="col-sm-6 col-lg-4 col-xl" key={loc.slug}>
                    <I18nLink
                      to={`/locality/${loc.slug}-gurgaon`}
                      className="d-block p-3 rounded-3 bg-white border text-decoration-none text-center"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-map-marker-alt text-gradient me-1" />
                      <span className="fw-medium">{pretty(loc.name)}</span>
                      <small className="d-block text-muted text-uppercase mt-1">{loc.entityType}</small>
                    </I18nLink>
                  </div>
                ))}
              </div>

              <h3 className="h5 mb-3 mt-5">{t('landing:localities.dataAndResearch')}</h3>
              <div className="row g-3">
                <div className="col-lg-2 col-md-4 col-sm-6">
                  <I18nLink to="/circle-rates" className="d-block p-3 rounded-3 bg-white border text-decoration-none text-center" style={{ color: 'inherit' }}>
                    <i className="fas fa-indian-rupee-sign text-gradient me-1" />
                    <span className="fw-medium">{t('landing:localities.circleRates')}</span>
                  </I18nLink>
                </div>
                <div className="col-lg-2 col-md-4 col-sm-6">
                  <I18nLink to="/builder-reputation" className="d-block p-3 rounded-3 bg-white border text-decoration-none text-center" style={{ color: 'inherit' }}>
                    <i className="fas fa-hard-hat text-gradient me-1" />
                    <span className="fw-medium">{t('landing:localities.builderReputation')}</span>
                  </I18nLink>
                </div>
              </div>
            </div>
          </section>
        )}

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Landing;

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useLocalitiesIndex } from '../../hooks/useLocalitiesIndex';
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
import LandingPageContent from '../../components/landing/LandingPageContent';
import AiFactSheet from '../../components/seo/AiFactSheet';
import {
  normalizeCitySlug,
  getCityLocalities,
  getPriceRange,
  getRelatedLandingLinks,
} from '../../utils/internalLinks';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const VALID_INTENTS = ['buy', 'rent', 'pg'];

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
  const { data: localitiesIndex } = useLocalitiesIndex();
  const canonicalCitySlug = normalizeCitySlug(citySlug);
  const shouldIndex = isIndexableCitySlug(canonicalCitySlug);
  const city = pretty(canonicalCitySlug);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const canonicalType = validIntent === 'pg'
    ? 'pg'
    : normalizePropertyTypeToken(type)[0] || 'apartment';
  const canonicalTypeSlug = getPropertyRouteSlug(canonicalType, validIntent);
  const canonicalPath = `/${canonicalCitySlug}/${validIntent}/${canonicalTypeSlug}`;
  const facet = getPropertyTypeLabel(canonicalType, t);
  const browseQuery = buildPropertySearchQuery({
    city,
    purpose: validIntent === 'pg' ? 'rent' : validIntent,
    property_type: [canonicalType],
  });

  const intentLabel = validIntent === 'rent' ? 'Rent' : validIntent === 'pg' ? 'PG' : 'Sale';
  const verb = validIntent === 'rent' ? 'renting' : validIntent === 'pg' ? 'staying in a PG in' : 'buying';
  const vrHook = validIntent === 'buy' ? ' [360° VR Tour]' : '';
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
    { name: city, url: `https://360ghar.com/${canonicalCitySlug}` },
    { name: `${facet} - ${intentLabel}`, url: `https://360ghar.com${canonicalPath}` },
  ];

  // --- Enrichment data ---

  const popularLocalities = getCityLocalities(canonicalCitySlug, { limit: 5, preferTypes: [canonicalType], index: localitiesIndex });

  const priceRange = getPriceRange(canonicalCitySlug, validIntent, canonicalType);

  const faqItems = buildLandingFaqs(t, city, facet, validIntent);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [typeFaqs, setTypeFaqs] = useState([]);

  const visibleRelatedSearches = getRelatedLandingLinks({
    citySlug: canonicalCitySlug,
    intent: validIntent,
    typeSlug: canonicalTypeSlug,
    canonicalType,
    limit: 4,
  });

  const allFaqItems = [
    ...faqItems,
    ...(typeFaqs || []).map((faq) => ({
      question: faq.q,
      answer: faq.a,
    })),
  ];

  const faqStructuredData = {
    '@type': 'FAQPage',
    mainEntity: allFaqItems.map((faq) => ({
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
          {
            '@type': 'ItemList',
            name: title,
            description,
            url: `https://360ghar.com${canonicalPath}`,
            numberOfItems: validIntent === 'buy' ? 50 : validIntent === 'rent' ? 30 : 20,
            itemListElement: [
              { '@type': 'ListItem', position: 1, url: `https://360ghar.com/properties?${browseQuery}` },
            ],
          },
        ]}
      />
      {/* Preload hero resources for LCP optimization */}
      <Helmet>
        <link rel="preload" href="/assets/images/thumbs/banner-img.webp" as="image" fetchPriority="high" />
      </Helmet>
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        {/* AUDIT FIX (4.4): visible breadcrumbs. Previously only in structured
            data; render a lightweight UI breadcrumb for users and crawlers. */}
        <nav aria-label="Breadcrumb" className="landing-breadcrumb-strip">
          <div className="container container-two">
            <ol className="landing-breadcrumb-list">
              <li className="landing-breadcrumb-item">
                <I18nLink to="/">{t('common:breadcrumb.home')}</I18nLink>
              </li>
              <li className="landing-breadcrumb-item">
                <I18nLink to={`/${canonicalCitySlug}`}>{city}</I18nLink>
              </li>
              <li className="landing-breadcrumb-item landing-breadcrumb-item--active" aria-current="page">
                {facet} - {intentLabel}
              </li>
            </ol>
          </div>
        </nav>

        <section className="padding-y-60">
          <div className="container container-two">
            {/* Hero */}
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{title.replace(' | 360Ghar', '').replace(' [360° VR Tour]', '')}</h1>
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

            {/* Market Snapshot — quick stats */}
            <div className="row g-3 mt-4">
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">{priceRange || t('landing:marketSnapshot.contactForPrices')}</strong>
                  <small className="text-muted">{t('landing:marketSnapshot.averagePriceRange')}</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">{popularLocalities.length}+ localities</strong>
                  <small className="text-muted">{t('landing:marketSnapshot.verifiedAreasIn', { city })}</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">{t('landing:marketSnapshot.tours360')}</strong>
                  <small className="text-muted">{t('landing:marketSnapshot.virtualWalkthroughs')}</small>
                </div>
              </div>
            </div>

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
                      to={`/locality/${loc.slug}-${canonicalCitySlug}`}
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

        {/* Content depth sections for helpful content compliance */}
        <LandingPageContent
          citySlug={canonicalCitySlug}
          city={city}
          intent={validIntent}
          facet={facet}
          canonicalType={canonicalType}
          onTypeFaqs={setTypeFaqs}
        />

        <AiFactSheet context="landing" />

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Landing;

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

const buildLandingFaqs = (city, facet, validIntent) => {
  const intentPhrase = validIntent === 'rent' ? 'for rent' : validIntent === 'pg' ? 'PG accommodation in' : 'for sale';
  const intentNoun = validIntent === 'pg' ? 'PG and co-living' : validIntent === 'rent' ? 'rental' : 'resale and new launch';
  return [
    {
      question: `What is the average price range for ${facet.toLowerCase()} ${intentPhrase} ${city}?`,
      answer: `Prices for ${facet.toLowerCase()} in ${city} vary by locality and configuration. ${intentNoun} inventory spans a broad budget range. Use 360Ghar's verified listings with 360\u00B0 virtual tours to compare actual market rates before deciding.`,
    },
    {
      question: `Which are the best localities for ${facet.toLowerCase()} ${intentPhrase} ${city}?`,
      answer: `Top localities depend on commute preference, budget, and lifestyle priorities. 360Ghar provides verified on-ground data, locality insights, and 360\u00B0 virtual tours for each listing so you can evaluate neighborhoods before visiting.`,
    },
    {
      question: `Are properties on 360Ghar verified before listing in ${city}?`,
      answer: `Yes. Every property listed on 360Ghar is physically verified by our on-site team. We confirm ownership documents, capture authentic photos and 360\u00B0 virtual tours, and validate exact locations before a listing goes live.`,
    },
  ];
};

const Landing = () => {
  const { citySlug, intent, type } = useParams();
  const canonicalCitySlug = normalizeCitySlug(citySlug);
  const shouldIndex = isIndexableCitySlug(canonicalCitySlug);
  const city = pretty(canonicalCitySlug);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const canonicalType = validIntent === 'pg'
    ? 'pg'
    : normalizePropertyTypeToken(type)[0] || 'apartment';
  const canonicalTypeSlug = getPropertyRouteSlug(canonicalType, validIntent);
  const canonicalPath = `/${canonicalCitySlug}/${validIntent}/${canonicalTypeSlug}`;
  const facet = getPropertyTypeLabel(canonicalType);
  const browseQuery = buildPropertySearchQuery({
    city,
    purpose: validIntent === 'pg' ? 'rent' : validIntent,
    property_type: [canonicalType],
  });

  const intentLabel = validIntent === 'rent' ? 'Rent' : validIntent === 'pg' ? 'PG' : 'Sale';
  const vrHook = validIntent === 'buy' ? ' [360° VR Tour]' : '';
  const title = validIntent === 'pg'
    ? `PG in ${city} | ${city} Paying Guest & Co-living | 360Ghar`
    : `${facet} for ${intentLabel} in ${city}${vrHook} | ${city} Real Estate | 360Ghar`;

  const description = validIntent === 'pg'
    ? `Browse verified ${facet.toLowerCase()} and co-living listings in ${city}. All properties are verified by our on-site team with 360\u00B0 virtual tours and end-to-end assistance from a dedicated Relationship Manager.`
    : validIntent === 'rent'
    ? `Explore verified ${facet.toLowerCase()} for rent in ${city} with 360\u00B0 virtual tours. All properties verified by our on-site team. Dedicated Relationship Manager for end-to-end assistance.`
    : `Explore verified ${facet.toLowerCase()} for sale in ${city} with 360\u00B0 virtual tours. All properties verified by our on-site team. Dedicated Relationship Manager for end-to-end assistance.`;

  const keywords = buildLandingKeywords({ facet, city, validIntent });

  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: city, url: `https://360ghar.com/${canonicalCitySlug}` },
    { name: `${facet} - ${intentLabel}`, url: `https://360ghar.com${canonicalPath}` },
  ];

  // --- Enrichment data ---

  const popularLocalities = getCityLocalities(canonicalCitySlug, { limit: 5, preferTypes: [canonicalType] });

  const priceRange = getPriceRange(canonicalCitySlug, validIntent, canonicalType);

  const faqItems = buildLandingFaqs(city, facet, validIntent);
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
          btnText="Post Property"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="padding-y-60">
          <div className="container container-two">
            {/* Hero */}
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{title.replace(' | 360Ghar', '').replace(' [360° VR Tour]', '')}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center">
              <Link
                to={`/properties?${browseQuery}`}
                className="btn btn-main"
              >
                Browse Listings
              </Link>
            </div>

            {/* Quick price context */}
            {priceRange && (
              <div className="mt-5 p-4 bg-light rounded-3 border">
                <h2 className="h5 mb-2">{city} {facet} Price Overview</h2>
                <p className="mb-0">
                  Average prices for {facet.toLowerCase()} {validIntent === 'pg' ? 'in' : `for ${intentLabel.toLowerCase()} in`} {city} typically range from <strong>{priceRange}</strong>.
                  Prices vary by locality, configuration, furnishing, and floor. Browse 360Ghar verified listings for up-to-date rates with 360&deg; virtual tours.
                </p>
              </div>
            )}

            {/* Market Snapshot — quick stats */}
            <div className="row g-3 mt-4">
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">{priceRange || 'Contact for prices'}</strong>
                  <small className="text-muted">Average price range</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">{popularLocalities.length}+ localities</strong>
                  <small className="text-muted">Verified areas in {city}</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">360° Tours</strong>
                  <small className="text-muted">Virtual walkthroughs</small>
                </div>
              </div>
            </div>

            {/* Why 360Ghar */}
            <div className="mt-5">
              <h2 className="h5 mb-3">Why 360Ghar?</h2>
              <ul className="text-start">
                <li>India&apos;s first AI-Enabled and Virtual Tour first Real Estate Platform</li>
                <li>All properties verified by our on-site team with 360&deg; virtual tours</li>
                <li>Dedicated Relationship Manager handles your end-to-end flow so you can relax</li>
                <li>Full visibility, convenience, and transparency for the same brokerage amount</li>
              </ul>
            </div>

            {/* FAQ */}
            <div className="mt-5">
              <h2 className="h5 mb-3">Frequently Asked Questions</h2>
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
                <h2 className="h5 mb-3">Related Searches</h2>
                <div className="d-flex flex-wrap gap-2">
                  {visibleRelatedSearches.map((rs) => (
                    <Link
                      key={rs.to}
                      to={rs.to}
                      className="btn btn-sm btn-outline-main rounded-pill"
                    >
                      {rs.label}
                    </Link>
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
              <h2 className="h5 mb-3">Popular Localities in {city}</h2>
              <p className="mb-3">
                Explore verified properties in {city}&apos;s top residential areas. Each locality page provides market insights, connectivity info, and active listings.
              </p>
              <div className="row g-3">
                {popularLocalities.map((loc) => (
                  <div className="col-sm-6 col-lg-4 col-xl" key={loc.slug}>
                    <Link
                      to={`/locality/${loc.slug}-${canonicalCitySlug}`}
                      className="d-block p-3 rounded-3 bg-white border text-decoration-none text-center"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-map-marker-alt text-gradient me-1" />
                      <span className="fw-medium">{pretty(loc.name)}</span>
                      <small className="d-block text-muted text-uppercase mt-1">{loc.entityType}</small>
                    </Link>
                  </div>
                ))}
              </div>

              <h3 className="h5 mb-3 mt-5">Data &amp; Research</h3>
              <div className="row g-3">
                <div className="col-lg-2 col-md-4 col-sm-6">
                  <Link to="/circle-rates" className="d-block p-3 rounded-3 bg-white border text-decoration-none text-center" style={{ color: 'inherit' }}>
                    <i className="fas fa-indian-rupee-sign text-gradient me-1" />
                    <span className="fw-medium">Circle Rates</span>
                  </Link>
                </div>
                <div className="col-lg-2 col-md-4 col-sm-6">
                  <Link to="/builder-reputation" className="d-block p-3 rounded-3 bg-white border text-decoration-none text-center" style={{ color: 'inherit' }}>
                    <i className="fas fa-hard-hat text-gradient me-1" />
                    <span className="fw-medium">Builder Reputation</span>
                  </Link>
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

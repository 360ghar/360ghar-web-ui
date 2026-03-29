import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const buildLandingFaqs = (city, facet, validIntent) => {
  const verb = validIntent === 'rent' ? 'renting' : validIntent === 'pg' ? 'staying in a PG in' : 'buying';
  const intentNoun = validIntent === 'pg' ? 'PG and co-living' : validIntent === 'rent' ? 'rental' : 'resale and new launch';
  return [
    {
      question: `What is the average price range for ${facet.toLowerCase()} ${validIntent === 'pg' ? 'in' : `for ${verb}`} ${city}?`,
      answer: `Prices for ${facet.toLowerCase()} in ${city} vary by locality and configuration. ${intentNoun} inventory spans a broad budget range. Use 360Ghar's verified listings with 360\u00B0 virtual tours to compare actual market rates before deciding.`,
    },
    {
      question: `Which are the best localities for ${facet.toLowerCase()} ${validIntent === 'pg' ? 'accommodation' : `${verb}`} in ${city}?`,
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
    ? `PG in ${city} | ${city} Paying Guest & Co-living | 360Ghar`
    : `${facet} for ${verb} in ${city} | ${city} Real Estate | 360Ghar`;

  const description = validIntent === 'pg'
    ? `Browse verified ${facet.toLowerCase()} and co-living listings in ${city}. All properties are verified by our on-site team with 360\u00B0 virtual tours and end-to-end assistance from a dedicated Relationship Manager.`
    : `Browse verified ${facet.toLowerCase()} in ${city} to ${validIntent}. All properties verified by our on-site team with 360\u00B0 virtual tours. Enjoy end-to-end service by dedicated Relationship Manager.`;

  const keywords = buildLandingKeywords({ facet, city, validIntent });

  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: city, url: citySearchUrl },
    { name: `${facet} - ${intentLabel}`, url: `https://360ghar.com${canonicalPath}` },
  ];

  // --- Enrichment data ---

  const popularLocalities = getCityLocalities(canonicalCitySlug, 5);

  const priceRange = getPriceRange(canonicalCitySlug, validIntent, canonicalType);

  const faqItems = buildLandingFaqs(city, facet, validIntent);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const relatedSearches = [];
  (INTENT_ALTERNATES[validIntent] || []).forEach((altIntent) => {
    relatedSearches.push({
      to: `/${canonicalCitySlug}/${altIntent}/${canonicalTypeSlug}`,
      label: `${facet} for ${pretty(altIntent)} in ${city}`,
    });
  });
  (RELATED_TYPES[canonicalType] || []).slice(0, 2).forEach((rt) => {
    relatedSearches.push({
      to: `/${canonicalCitySlug}/${validIntent}/${getPropertyRouteSlug(rt, validIntent)}`,
      label: `${getPropertyTypeLabel(rt)} for ${intentLabel} in ${city}`,
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
                      to={`/locality/${loc.slug}-gurgaon`}
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

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Landing;

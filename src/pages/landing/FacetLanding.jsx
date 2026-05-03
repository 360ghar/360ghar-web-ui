import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import LandingPageContent from '../../components/landing/LandingPageContent';
import AiFactSheet from '../../components/seo/AiFactSheet';
import SEO from '../../common/SEO';
import { Helmet } from 'react-helmet-async';
import { isIndexableFacetLanding } from '../../seo/indexationPolicy';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';
import {
  getPropertyRouteSlug,
  getPropertyTypeLabel,
  normalizePropertyTypeToken,
} from '../../utils/propertyTaxonomy';
import { buildFacetKeywords } from '../../utils/landingKeywords';
import {
  normalizeCitySlug,
  getBhkFacetLinks,
  getBudgetFacetLinks,
  getPriceRange,
  getCityLocalities,
  getRelatedLandingLinks,
} from '../../utils/internalLinks';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const buildFacetLandingFaqs = (city, facet, validIntent, bhkText, budgetText, amenity) => {
  const qualifier = [bhkText, budgetText, amenity ? pretty(amenity) : null].filter(Boolean).join(' ') || facet;
  const intentPhrase = validIntent === 'rent' ? 'for rent' : validIntent === 'pg' ? 'PG accommodation in' : 'for sale';
  return [
    {
      question: `What is the price range for ${qualifier.toLowerCase()} ${intentPhrase} ${city}?`,
      answer: `Prices for ${qualifier.toLowerCase()} in ${city} vary by locality, configuration, and amenities. Use 360Ghar's verified listings with 360° virtual tours to compare actual market rates and find options within your budget.`,
    },
    {
      question: `Which localities are best for ${qualifier.toLowerCase()} ${intentPhrase} ${city}?`,
      answer: `Top localities depend on commute preference, budget, and lifestyle. 360Ghar provides verified on-ground data, locality insights, and 360° virtual tours for each listing so you can evaluate neighborhoods before visiting.`,
    },
    {
      question: `Are ${qualifier.toLowerCase()} listings on 360Ghar verified in ${city}?`,
      answer: `Yes. Every property on 360Ghar is physically verified by our on-site team. We confirm ownership documents, capture authentic photos and 360° virtual tours, and validate exact locations before a listing goes live.`,
    },
  ];
};

const VALID_INTENTS = ['buy', 'rent', 'pg'];
const VALID_BHKS = ['1-bhk','2-bhk','3-bhk','4-bhk','5-bhk'];
const VALID_BUDGETS = [
  'under-10k','under-15k','under-20k', // rent
  'under-50-lakhs','under-80-lakhs','under-1-crore' // buy
];

const FacetLanding = () => {
  const { citySlug, intent, type, bhk, budget, amenity } = useParams();
  const canonicalCitySlug = normalizeCitySlug(citySlug);

  const validCity = pretty(canonicalCitySlug);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const canonicalType = validIntent === 'pg'
    ? 'pg'
    : normalizePropertyTypeToken(type)[0] || 'apartment';
  const canonicalTypeSlug = getPropertyRouteSlug(canonicalType, validIntent);
  const intentLabel = validIntent === 'pg' ? 'PG' : validIntent === 'rent' ? 'Rent' : 'Sale';
  const isBhk = bhk && VALID_BHKS.includes(bhk);
  const isBudget = budget && VALID_BUDGETS.includes(budget);
  const isAmenity = Boolean(amenity);

  // Use centralized indexation policy (handles BHK, budget, and amenity facets)
  const shouldIndex = isIndexableFacetLanding({
    citySlug: canonicalCitySlug,
    intent: validIntent,
    bhk,
    budget,
    amenity,
  });

  const baseCanonicalPath = `/${canonicalCitySlug}/${validIntent}/${canonicalTypeSlug}`;

  const facetText = getPropertyTypeLabel(canonicalType);
  const bhkText = isBhk ? bhk.replace('-bhk', ' BHK').toUpperCase() : '';
  const budgetText = isBudget ? budget.replace(/-/g,' ') : '';
  const browseQuery = buildPropertySearchQuery({
    city: validCity,
    purpose: validIntent === 'pg' ? 'rent' : validIntent,
    property_type: [canonicalType],
    bhk: isBhk ? bhk.replace('-bhk', '') : '',
    budget: isBudget ? budget : '',
    amenity: isAmenity ? amenity : '',
  });

  const title = useMemo(() => {
    const vrHook = validIntent === 'buy' ? ' [360° VR Tour]' : '';
    if (validIntent === 'pg') {
      const bits = [
        isBhk ? `${bhkText}` : null,
        facetText,
        'in',
        validCity,
        isBudget ? `| ${budgetText}` : null,
        isAmenity ? `| ${pretty(amenity)}` : null,
      ].filter(Boolean).join(' ');
      return `${bits} | 360Ghar`;
    }

    const bits = [
      isBhk ? `${bhkText}` : null,
      facetText,
      'for', intentLabel,
      'in', validCity,
      isBudget ? `| ${budgetText}` : null,
      isAmenity ? `| ${pretty(amenity)}` : null,
    ].filter(Boolean).join(' ');
    return `${bits}${vrHook} | 360Ghar`;
  }, [validCity, facetText, validIntent, intentLabel, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

  const description = useMemo(() => {
    const parts = [
      validIntent === 'pg'
        ? `Explore verified ${facetText.toLowerCase()} and co-living options in ${validCity}.`
        : validIntent === 'rent'
        ? `Explore verified ${facetText.toLowerCase()} for rent in ${validCity}.`
        : `Explore verified ${facetText.toLowerCase()} for sale in ${validCity}.`,
      isBhk ? `${bhkText} options available.` : null,
      isBudget ? `Budget: ${budgetText}.` : null,
      isAmenity ? `Amenity: ${pretty(amenity)}.` : null,
      'Verified by our on-site team. View photos, exact locations, 360° virtual tours. End-to-end service by dedicated Relationship Manager.'
    ].filter(Boolean);
    return parts.join(' ');
  }, [facetText, validCity, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

  const keywords = useMemo(
    () => buildFacetKeywords({ facetText, validCity, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity, pretty }),
    [facetText, validCity, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]
  );

  const canonicalPath = useMemo(() => {
    if (isBhk) return `${baseCanonicalPath}/${bhk}`;
    if (isBudget) return `${baseCanonicalPath}/budget/${budget}`;
    if (isAmenity) return `${baseCanonicalPath}/amenity/${amenity}`;
    return baseCanonicalPath;
  }, [isAmenity, isBhk, isBudget, amenity, baseCanonicalPath, bhk, budget]);

  const breadcrumbs = useMemo(() => (
    [
      { name: 'Home', url: 'https://360ghar.com/' },
      { name: validCity, url: `https://360ghar.com/${canonicalCitySlug}` },
      { name: `${facetText} - ${intentLabel}`, url: `https://360ghar.com${baseCanonicalPath}` },
      isBhk ? { name: bhkText, url: `https://360ghar.com${baseCanonicalPath}/${bhk}` } : null,
      isBudget ? { name: budgetText, url: `https://360ghar.com${baseCanonicalPath}/budget/${budget}` } : null,
      isAmenity ? { name: pretty(amenity), url: `https://360ghar.com${baseCanonicalPath}/amenity/${amenity}` } : null,
    ].filter(Boolean)
  ), [validCity, canonicalCitySlug, facetText, intentLabel, baseCanonicalPath, isBhk, bhkText, bhk, isBudget, budgetText, budget, isAmenity, amenity]);

  const targetUrl = () => {
    return `/properties?${browseQuery}`;
  };

  // Build related search links using centralized utilities
  const relatedSearches = useMemo(() => {
    const links = [];

    // BHK variants
    links.push(...getBhkFacetLinks(canonicalCitySlug, validIntent, canonicalTypeSlug, bhk));

    // Budget variants
    links.push(...getBudgetFacetLinks(canonicalCitySlug, validIntent, canonicalTypeSlug, budget));

    // Intent/type alternates
    links.push(...getRelatedLandingLinks({
      citySlug: canonicalCitySlug,
      intent: validIntent,
      typeSlug: canonicalTypeSlug,
      canonicalType,
      limit: 2,
    }));

    return links.slice(0, 6);
  }, [canonicalCitySlug, validIntent, canonicalTypeSlug, canonicalType, bhk, budget]);

  // Price range for budget context
  const priceRange = getPriceRange(canonicalCitySlug, validIntent, canonicalType);

  // Popular localities
  const popularLocalities = useMemo(
    () => getCityLocalities(canonicalCitySlug, { limit: 4, preferTypes: [canonicalType] }),
    [canonicalCitySlug, canonicalType]
  );

  const faqItems = buildFacetLandingFaqs(validCity, facetText, validIntent, bhkText, budgetText, amenity);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonical={shouldIndex ? canonicalPath : baseCanonicalPath}
        noindex={!shouldIndex}
        structuredData={[
          generateBreadcrumbStructuredData(breadcrumbs),
          {
            '@type': 'CollectionPage',
            name: title,
            description,
            url: `https://360ghar.com${shouldIndex ? canonicalPath : baseCanonicalPath}`,
          },
          generateFaqStructuredData(faqItems),
          {
            '@type': 'ItemList',
            name: title,
            description,
            url: `https://360ghar.com${shouldIndex ? canonicalPath : baseCanonicalPath}`,
            numberOfItems: validIntent === 'buy' ? 50 : validIntent === 'rent' ? 30 : 20,
            itemListElement: [
              { '@type': 'ListItem', position: 1, url: `https://360ghar.com${targetUrl()}` },
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
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{title.replace(' | 360Ghar','').replace(' [360° VR Tour]', '')}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center">
              <Link to={targetUrl()} className="btn btn-main">Browse Listings</Link>
            </div>

            <div className="mt-5">
              <h2 className="h5 mb-3">Popular searches</h2>
              <ul className="text-start">
                <li>{facetText} {validIntent === 'pg' ? 'near metro' : `for ${intentLabel.toLowerCase()}`} in {validCity}</li>
                {isBhk && <li>{bhkText} {facetText} {validIntent === 'pg' ? '' : `for ${intentLabel.toLowerCase()}`} in {validCity}</li>}
                {isBudget && <li>{facetText} {validIntent === 'pg' ? '' : `for ${intentLabel.toLowerCase()}`} {budgetText} in {validCity}</li>}
                <li>Ready to move {facetText} {validIntent === 'pg' ? 'in' : `for ${intentLabel.toLowerCase()} in`} {validCity}</li>
                <li>No broker {facetText} {validIntent === 'pg' ? 'in' : `for ${intentLabel.toLowerCase()} in`} {validCity}</li>
                <li>Verified {facetText} with 360° virtual tours in {validCity}</li>
              </ul>

              {/* Budget enrichment */}
              {isBudget && (
                <div className="mt-4 p-4 bg-light rounded-3 border">
                  <h2 className="h6 mb-2">Affordability Insights for {validCity}</h2>
                  {priceRange && (
                    <p className="mb-2">
                      Typical {facetText.toLowerCase()} prices in {validCity}: <strong>{priceRange}</strong>.
                      This budget filter narrows results to options {budgetText.replace('under ', 'under ')}.
                    </p>
                  )}
                  <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                    Use our <Link to="/emi-calculator" className="text-decoration-underline">EMI Calculator</Link> to check
                    monthly payments for this budget, or <Link to="/loan-eligibility-calculator" className="text-decoration-underline">check loan eligibility</Link>.
                  </p>
                </div>
              )}

              {/* Amenity enrichment */}
              {isAmenity && (
                <div className="mt-4 p-4 bg-light rounded-3 border">
                  <h2 className="h6 mb-2">About {pretty(amenity)} in {validCity}</h2>
                  <p className="mb-2">
                    Properties with <strong>{pretty(amenity)}</strong> are in high demand in {validCity},
                    especially among families and working professionals.
                  </p>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                    360Ghar verifies every amenity claim during on-site inspection. Virtual tours let you
                    confirm {pretty(amenity)} before scheduling a visit.
                  </p>
                </div>
              )}

              <h2 className="h5 mb-3 mt-4">Why 360Ghar?</h2>
              <ul className="text-start">
                <li>India&apos;s first AI-Enabled and Virtual Tour first Real Estate Platform</li>
                <li>All properties verified by our on-site team with 360° virtual tours</li>
                <li>Dedicated Relationship Manager handles your end-to-end flow so you can relax</li>
                <li>Full visibility, convenience, and transparency for the same brokerage amount</li>
              </ul>

              {/* FAQ */}
              <div className="mt-5">
                <h2 className="h5 mb-3">Frequently Asked Questions</h2>
                <div className="accordion" id="facetFaqAccordion">
                  {faqItems.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div className="accordion-item border-0 border-bottom" key={faq.question}>
                        <h3 className="accordion-header" id={`facetFaqHeading${idx}`}>
                          <button
                            className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={`facetFaqCollapse${idx}`}
                            onClick={() => setOpenFaqIndex((cur) => (cur === idx ? -1 : idx))}
                          >
                            {faq.question}
                          </button>
                        </h3>
                        <div
                          id={`facetFaqCollapse${idx}`}
                          className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                          aria-labelledby={`facetFaqHeading${idx}`}
                        >
                          <div className="accordion-body text-muted">{faq.answer}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Searches — cross-link to other BHK/budget facets */}
        {relatedSearches.length > 0 && (
          <section className="padding-y-60 bg-light">
            <div className="container container-two">
              <h2 className="h5 mb-3">Related Searches</h2>
              <div className="row g-3">
                {relatedSearches.map((rs) => (
                  <div className="col-lg-4 col-md-6" key={rs.to}>
                    <Link
                      to={rs.to}
                      className="d-block p-3 rounded-3 bg-white border text-decoration-none"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-search text-gradient me-2" />
                      <span className="fw-medium">{rs.label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popular Localities */}
        {popularLocalities.length > 0 && (
          <section className="padding-y-60 bg-white">
            <div className="container container-two">
              <h2 className="h5 mb-3">Popular Localities in {validCity}</h2>
              <div className="row g-3">
                {popularLocalities.map((loc) => (
                  <div className="col-sm-6 col-lg-3" key={loc.slug}>
                    <Link
                      to={`/locality/${loc.slug}-${canonicalCitySlug}`}
                      className="d-block p-3 rounded-3 bg-light border text-decoration-none text-center"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-map-marker-alt text-gradient me-1" />
                      <span className="fw-medium">{pretty(loc.name)}</span>
                      <small className="d-block text-muted text-uppercase mt-1">{loc.entityType}</small>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <LandingPageContent
          citySlug={canonicalCitySlug}
          city={validCity}
          intent={validIntent}
          facet={facetText}
          canonicalType={canonicalType}
        />

        <AiFactSheet context="landing" />

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default FacetLanding;

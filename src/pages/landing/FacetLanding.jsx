import { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { useLocalitiesIndex } from '../../hooks/useLocalitiesIndex';
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
import { I18nLink } from '../../i18n/I18nLink';
import {
  normalizeCitySlug,
  getBhkFacetLinks,
  getBudgetFacetLinks,
  getPriceRange,
  getCityLocalities,
  getRelatedLandingLinks,
} from '../../utils/internalLinks';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const buildFacetFaqs = (t, validCity, facetText, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity) => {
  const lcFacet = facetText.toLowerCase();
  const verb = validIntent === 'rent' ? 'rent' : validIntent === 'pg' ? 'stay in' : 'buy';
  const verbIng = validIntent === 'rent' ? 'renting' : validIntent === 'pg' ? 'staying in' : 'buying';

  // Build interpolation variables
  const bhkPrefix = isBhk ? `${bhkText} ` : '';
  const budgetSuffix = isBudget ? ` ${budgetText}` : '';
  const budgetSuffixDetail = isBudget ? ` (${budgetText})` : '';
  const amenityPrettyVal = amenity ? amenity.replace(/-/g, ' ') : '';
  const facetPreposition = validIntent === 'pg' ? 'in' : `for ${verb} in`;

  // Hindi action for Q2
  const hindiAction = validIntent === 'buy' ? 'kharidna' : 'kiraye par lena';

  const faqs = [
    {
      question: t('landing:facetFaqs.q1', { bhkPrefix, facetTextLower: lcFacet, facetPreposition, city: validCity, budgetSuffix }),
      answer: t('landing:facetFaqs.a1', { bhkPrefix, facetTextLower: lcFacet, city: validCity, budgetSuffixDetail }),
    },
    {
      question: t('landing:facetFaqs.q2', { bhkPrefix, facetTextLower: lcFacet, hindiAction, city: validCity }),
      answer: t('landing:facetFaqs.a2'),
    },
    {
      question: t('landing:facetFaqs.q3', { bhkPrefix, facetTextLower: lcFacet, city: validCity }),
      answer: t('landing:facetFaqs.a3'),
    },
    {
      question: t('landing:facetFaqs.q4', { verb, bhkPrefix, facetTextLower: lcFacet, city: validCity }),
      answer: validIntent === 'buy'
        ? t('landing:facetFaqs.a4Buy')
        : t('landing:facetFaqs.a4Rent'),
    },
    {
      question: t('landing:facetFaqs.q5', { verbIng, bhkPrefix, facetTextLower: lcFacet, city: validCity }),
      answer: t('landing:facetFaqs.a5'),
    },
    isAmenity ? {
      question: t('landing:facetFaqs.q6', { facetTextLower: lcFacet, city: validCity, amenityPretty: amenityPrettyVal || 'top amenities' }),
      answer: t('landing:facetFaqs.a6', { facetTextLower: lcFacet, city: validCity, amenityPretty: amenityPrettyVal || 'specific amenities' }),
    } : null,
  ].filter(Boolean);
  return faqs;
};

const VALID_INTENTS = ['buy', 'rent', 'pg'];
const VALID_BHKS = ['1-bhk','2-bhk','3-bhk','4-bhk','5-bhk'];
const VALID_BUDGETS = [
  'under-10k','under-15k','under-20k', // rent
  'under-50-lakhs','under-80-lakhs','under-1-crore' // buy
];

const FacetLanding = () => {
  const { t } = useTranslation('landing');
  const { citySlug, intent, type, bhk, budget, amenity } = useParams();
  const { data: localitiesIndex } = useLocalitiesIndex();
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

  const facetText = getPropertyTypeLabel(canonicalType, t);
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
    // Build interpolation-safe parts (already space-padded with surrounding content)
    const bhkPart = isBhk ? `${bhkText} ` : '';
    const budgetPart = isBudget ? ` | ${budgetText}` : '';
    const amenityPart = isAmenity ? ` | ${pretty(amenity)}` : '';

    if (validIntent === 'pg') {
      return t('landing:facetSeo.titlePg', {
        bhk: bhkPart,
        facetText,
        city: validCity,
        budget: budgetPart,
        amenity: amenityPart,
      });
    }

    return t('landing:facetSeo.titleBuyRent', {
      bhk: bhkPart,
      facetText,
      intentLabel,
      city: validCity,
      budget: budgetPart,
      amenity: amenityPart,
    });
  }, [t, validCity, facetText, validIntent, intentLabel, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

  const description = useMemo(() => {
    const parts = [
      validIntent === 'pg'
        ? t('landing:facetSeo.descPg', { facetTextLower: facetText.toLowerCase(), city: validCity })
        : t('landing:facetSeo.descBuyRent', { facetTextLower: facetText.toLowerCase(), city: validCity, validIntent }),
      isBhk ? t('landing:facetSeo.descBhk', { bhkText }) : null,
      isBudget ? t('landing:facetSeo.descBudget', { budgetText }) : null,
      isAmenity ? t('landing:facetSeo.descAmenity', { amenityPretty: pretty(amenity) }) : null,
      t('landing:facetSeo.descSuffix'),
    ].filter(Boolean);
    return parts.join(' ');
  }, [t, facetText, validCity, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

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
    () => getCityLocalities(canonicalCitySlug, { limit: 4, preferTypes: [canonicalType], index: localitiesIndex }),
    [canonicalCitySlug, canonicalType, localitiesIndex]
  );

  const faqItems = buildFacetFaqs(t, validCity, facetText, validIntent, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // CRITICAL FIX (audit 4.8): guard against malformed/missing route params.
  // Placed AFTER all hooks so rules-of-hooks is satisfied. If the required
  // path segments are absent, redirect to a safe default instead of crashing.
  if (!citySlug || !intent || !type) {
    return <Navigate to="/properties" replace />;
  }

  // Preposition helpers for popular searches
  const intentDisplay = validIntent === 'pg' ? '' : validIntent;
  const readyPreposition = validIntent === 'pg' ? 'in' : `for ${validIntent} in`;

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
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        {/* AUDIT FIX (4.4): visible breadcrumbs. Previously only in structured
            data; render a lightweight UI breadcrumb for users and crawlers. */}
        <nav aria-label="Breadcrumb" className="facet-breadcrumb-strip">
          <div className="container container-two">
            <ol className="facet-breadcrumb-list">
              <li className="facet-breadcrumb-item">
                <I18nLink to="/">{t('common:breadcrumb.home')}</I18nLink>
              </li>
              <li className="facet-breadcrumb-item">
                <I18nLink to={`/${canonicalCitySlug}`}>{validCity}</I18nLink>
              </li>
              <li className="facet-breadcrumb-item">
                <I18nLink to={baseCanonicalPath}>{facetText} - {intentLabel}</I18nLink>
              </li>
              {isBhk && <li className="facet-breadcrumb-item facet-breadcrumb-item--active" aria-current="page">{bhkText}</li>}
              {isBudget && <li className="facet-breadcrumb-item facet-breadcrumb-item--active" aria-current="page">{budgetText}</li>}
              {isAmenity && <li className="facet-breadcrumb-item facet-breadcrumb-item--active" aria-current="page">{pretty(amenity)}</li>}
              {!isBhk && !isBudget && !isAmenity && (
                <li className="facet-breadcrumb-item facet-breadcrumb-item--active" aria-current="page">{facetText} - {intentLabel}</li>
              )}
            </ol>
          </div>
        </nav>

        <section className="padding-y-60">
          <div className="container container-two">
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{title.replace(' | 360Ghar','').replace(' [360° VR Tour]', '')}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center">
              <I18nLink to={targetUrl()} className="btn btn-main">{t('landing:hero.browseListings')}</I18nLink>
            </div>

            <div className="mt-5">
              <h2 className="h5 mb-3">{t('landing:facetPopularSearches.heading')}</h2>
              <ul className="text-start">
                <li>{validIntent === 'pg'
                  ? t('landing:facetPopularSearches.item1Pg', { facetText, city: validCity })
                  : t('landing:facetPopularSearches.item1', { facetText, intentDisplay, city: validCity })
                }</li>
                {isBhk && <li>{t('landing:facetPopularSearches.item2', { bhkText, facetText, intentDisplay, city: validCity })}</li>}
                {isBudget && <li>{t('landing:facetPopularSearches.item3', { facetText, intentDisplay, budgetText, city: validCity })}</li>}
                <li>{t('landing:facetPopularSearches.item4', { facetText, readyPreposition, city: validCity })}</li>
                <li>{t('landing:facetPopularSearches.item5', { facetText, readyPreposition, city: validCity })}</li>
                <li>{t('landing:facetPopularSearches.item6', { facetText, city: validCity })}</li>
              </ul>

              {/* Budget enrichment */}
              {isBudget && (
                <div className="mt-4 p-4 bg-light rounded-3 border">
                  <h2 className="h6 mb-2">{t('landing:budgetEnrichment.affordabilityInsights', { city: validCity })}</h2>
                  {priceRange && (
                    <p className="mb-2">
                      {t('landing:budgetEnrichment.typicalPrices', { facetTextLower: facetText.toLowerCase(), city: validCity, priceRange })}
                      {' '}{t('landing:budgetEnrichment.budgetFilterNarrows', { budgetText: budgetText.replace('under ', 'under ') })}
                    </p>
                  )}
                  <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                    {t('landing:budgetEnrichment.useEmiCalculator', {
                      interpolations: { budgetText },
                      components: {
                        1: <I18nLink to="/emi-calculator" className="text-decoration-underline" key="emi" />,
                        3: <I18nLink to="/loan-eligibility-calculator" className="text-decoration-underline" key="loan" />,
                      }
                    })}
                  </p>
                </div>
              )}

              {/* Amenity enrichment */}
              {isAmenity && (
                <div className="mt-4 p-4 bg-light rounded-3 border">
                  <h2 className="h6 mb-2">{t('landing:budgetEnrichment.aboutAmenity', { amenityPretty: pretty(amenity), city: validCity })}</h2>
                  <p className="mb-2"
                    dangerouslySetInnerHTML={{
                      // CRITICAL FIX (audit 4.4): sanitize interpolated HTML
                      // with DOMPurify to prevent XSS via the amenity/city
                      // values that are injected into the translation string.
                      __html: DOMPurify.sanitize(t('landing:budgetEnrichment.amenityHighDemand', { amenityPretty: pretty(amenity), city: validCity })),
                    }}
                  />
                  <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                    {t('landing:budgetEnrichment.amenityVerifyNote', { amenityPretty: pretty(amenity) })}
                  </p>
                </div>
              )}

              <h2 className="h5 mb-3 mt-4">{t('landing:why360Ghar.heading')}</h2>
              <ul className="text-start">
                <li>{t('landing:why360Ghar.point1')}</li>
                <li>{t('landing:why360Ghar.point2')}</li>
                <li>{t('landing:why360Ghar.point3')}</li>
                <li>{t('landing:why360Ghar.point4')}</li>
              </ul>

              {/* FAQ */}
              <div className="mt-5">
                <h2 className="h5 mb-3">{t('landing:faq.heading')}</h2>
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
              <h2 className="h5 mb-3">{t('landing:relatedSearches.heading')}</h2>
              <div className="row g-3">
                {relatedSearches.map((rs) => (
                  <div className="col-lg-4 col-md-6" key={rs.to}>
                    <I18nLink
                      to={rs.to}
                      className="d-block p-3 rounded-3 bg-white border text-decoration-none"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-search text-gradient me-2" />
                      <span className="fw-medium">{rs.label}</span>
                    </I18nLink>
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
              <h2 className="h5 mb-3">{t('landing:localities.heading', { city: validCity })}</h2>
              <div className="row g-3">
                {popularLocalities.map((loc) => (
                  <div className="col-sm-6 col-lg-3" key={loc.slug}>
                    <I18nLink
                      to={`/locality/${loc.slug}-${canonicalCitySlug}`}
                      className="d-block p-3 rounded-3 bg-light border text-decoration-none text-center"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-map-marker-alt text-gradient me-1" />
                      <span className="fw-medium">{pretty(loc.name)}</span>
                      <small className="d-block text-muted text-uppercase mt-1">{loc.entityType}</small>
                    </I18nLink>
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

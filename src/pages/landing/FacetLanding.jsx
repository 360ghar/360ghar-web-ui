import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { isIndexableCitySlug } from '../../seo/indexationPolicy';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';
import {
  getPropertyRouteSlug,
  getPropertyTypeLabel,
  normalizePropertyTypeToken,
} from '../../utils/propertyTaxonomy';
import { buildFacetKeywords } from '../../utils/landingKeywords';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const VALID_INTENTS = ['buy', 'rent', 'pg'];
const VALID_BHKS = ['1-bhk','2-bhk','3-bhk','4-bhk','5-bhk'];
const VALID_BUDGETS = [
  'under-10k','under-15k','under-20k', // rent
  'under-50-lakhs','under-80-lakhs','under-1-crore' // buy
];

const FacetLanding = () => {
  const { citySlug, intent, type, bhk, budget, amenity } = useParams();
  const canonicalCitySlug = citySlug === 'gurugram' ? 'gurgaon' : citySlug;

  const validCity = pretty(citySlug);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const canonicalType = validIntent === 'pg'
    ? 'pg'
    : normalizePropertyTypeToken(type)[0] || 'apartment';
  const canonicalTypeSlug = getPropertyRouteSlug(canonicalType, validIntent);
  const intentLabel = validIntent === 'pg' ? 'PG' : validIntent === 'rent' ? 'Rent' : 'Buy';
  const isBhk = bhk && VALID_BHKS.includes(bhk);
  const isBudget = budget && VALID_BUDGETS.includes(budget);
  const isAmenity = Boolean(amenity);

  // Index BHK facet pages for approved cities (buy/rent only, not PG)
  // Budget and amenity facets remain noindex until content is enriched
  const shouldIndex = isBhk
    && isIndexableCitySlug(canonicalCitySlug)
    && ['buy', 'rent'].includes(validIntent)
    && ['1-bhk', '2-bhk', '3-bhk'].includes(bhk);

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
    return `${bits} | 360Ghar`;
  }, [validCity, facetText, validIntent, intentLabel, isBhk, bhkText, isBudget, budgetText, isAmenity, amenity]);

  const description = useMemo(() => {
    const parts = [
      validIntent === 'pg'
        ? `Explore verified ${facetText.toLowerCase()} and co-living options in ${validCity}.`
        : `Explore verified ${facetText.toLowerCase()} in ${validCity} to ${validIntent}.`,
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

  const citySearchUrl = useMemo(() => {
    const u = new URL('https://360ghar.com/properties');
    u.searchParams.set('city', validCity);
    u.searchParams.set('intent', validIntent);
    return u.toString();
  }, [validCity, validIntent]);

  const breadcrumbs = useMemo(() => (
    [
      { name: 'Home', url: 'https://360ghar.com/' },
      { name: validCity, url: citySearchUrl },
      { name: `${facetText} - ${intentLabel}`, url: `https://360ghar.com${baseCanonicalPath}` },
      isBhk ? { name: bhkText, url: `https://360ghar.com${baseCanonicalPath}/${bhk}` } : null,
      isBudget ? { name: budgetText, url: `https://360ghar.com${baseCanonicalPath}/budget/${budget}` } : null,
      isAmenity ? { name: pretty(amenity), url: `https://360ghar.com${baseCanonicalPath}/amenity/${amenity}` } : null,
    ].filter(Boolean)
  ), [validCity, citySearchUrl, facetText, intentLabel, baseCanonicalPath, isBhk, bhkText, bhk, isBudget, budgetText, budget, isAmenity, amenity]);

  const targetUrl = () => {
    return `/properties?${browseQuery}`;
  };

  // Build related search links (other BHK/budget variants for same city+intent+type)
  const relatedSearches = useMemo(() => {
    const base = baseCanonicalPath;
    const links = [];

    // Other BHK variants
    VALID_BHKS.filter((b) => b !== bhk).slice(0, 3).forEach((b) => {
      links.push({ label: b.replace('-bhk', ' BHK').toUpperCase() + ' ' + facetText + ' in ' + validCity, to: `${base}/${b}` });
    });

    // Budget variants (pick a couple relevant ones)
    const budgetLabels = {
      'under-50-lakhs': 'Under 50 Lakhs',
      'under-80-lakhs': 'Under 80 Lakhs',
      'under-1-crore': 'Under 1 Crore',
      'under-10k': 'Under 10K',
      'under-15k': 'Under 15K',
      'under-20k': 'Under 20K',
    };
    VALID_BUDGETS.filter((b) => b !== budget).slice(0, 2).forEach((b) => {
      links.push({ label: facetText + ' ' + (budgetLabels[b] || b) + ' in ' + validCity, to: `${base}/budget/${b}` });
    });

    return links.slice(0, 5);
  }, [baseCanonicalPath, bhk, budget, facetText, validCity]);

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
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{title.replace(' | 360Ghar','')}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center">
              <Link to={targetUrl()} className="btn btn-main">Browse Listings</Link>
            </div>

            <div className="mt-5">
              <h2 className="h5 mb-3">Popular searches</h2>
              <ul className="text-start">
                <li>{facetText} {validIntent === 'pg' ? 'near metro' : validIntent} in {validCity}</li>
                {isBhk && <li>{bhkText} {facetText} {validIntent === 'pg' ? '' : validIntent} in {validCity}</li>}
                {isBudget && <li>{facetText} {validIntent === 'pg' ? '' : validIntent} {budgetText} in {validCity}</li>}
                <li>Ready to move {facetText} {validIntent === 'pg' ? 'in' : `for ${validIntent} in`} {validCity}</li>
                <li>No broker {facetText} {validIntent === 'pg' ? 'in' : `for ${validIntent} in`} {validCity}</li>
                <li>Verified {facetText} with 360° virtual tours in {validCity}</li>
              </ul>
              <h2 className="h5 mb-3 mt-4">Why 360Ghar?</h2>
              <ul className="text-start">
                <li>India&apos;s first AI-Enabled and Virtual Tour first Real Estate Platform</li>
                <li>All properties verified by our on-site team with 360° virtual tours</li>
                <li>Dedicated Relationship Manager handles your end-to-end flow so you can relax</li>
                <li>Full visibility, convenience, and transparency for the same brokerage amount</li>
              </ul>
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

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default FacetLanding;

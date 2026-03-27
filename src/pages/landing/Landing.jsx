import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { buildPropertySearchQuery } from '../../store/propertyFilters';
import {
  getPropertyTypeLabel,
  normalizePropertyTypeToken,
} from '../../utils/propertyTaxonomy';
import { buildLandingKeywords } from '../../utils/landingKeywords';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const VALID_INTENTS = ['buy', 'rent', 'pg'];

const Landing = () => {
  const { citySlug, intent, type } = useParams();
  const canonicalCitySlug = citySlug === 'gurugram' ? 'gurgaon' : citySlug;
  const city = pretty(citySlug);
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const canonicalType = validIntent === 'pg'
    ? 'pg'
    : normalizePropertyTypeToken(type)[0] || 'apartment';
  const facet = getPropertyTypeLabel(canonicalType);
  const intentLabel = validIntent === 'pg' ? 'PG' : pretty(validIntent);
  const browseQuery = buildPropertySearchQuery({
    city,
    purpose: validIntent === 'pg' ? 'rent' : validIntent,
    property_type: [canonicalType],
  });

  const citySearchUrl = useMemo(() => {
    const u = new URL('https://360ghar.com/properties');
    u.searchParams.set('city', city);
    u.searchParams.set('intent', validIntent);
    return u.toString();
  }, [city, validIntent]);

  const title = useMemo(() => {
    const verb = validIntent === 'rent' ? 'Rent' : validIntent === 'pg' ? 'PG' : 'Buy';
    if (validIntent === 'pg') return `PG in ${city} | ${city} Paying Guest & Co-living | 360Ghar`;
    return `${facet} for ${verb} in ${city} | ${city} Real Estate | 360Ghar`;
  }, [city, facet, validIntent]);

  const description = useMemo(() => {
    if (validIntent === 'pg') {
      return `Browse verified ${facet.toLowerCase()} and co-living listings in ${city}. All properties are verified by our on-site team with 360° virtual tours and end-to-end assistance from a dedicated Relationship Manager.`;
    }
    const base = `Browse verified ${facet.toLowerCase()} in ${city} to ${validIntent}. All properties verified by our on-site team with 360° virtual tours. Enjoy end-to-end service by dedicated Relationship Manager.`;
    return base;
  }, [city, facet, validIntent]);

  const keywords = useMemo(
    () => buildLandingKeywords({ facet, city, validIntent }),
    [city, facet, validIntent]
  );

  const breadcrumbs = useMemo(() => (
    [
      { name: 'Home', url: 'https://360ghar.com/' },
      { name: city, url: citySearchUrl },
      { name: `${facet} - ${intentLabel}`, url: `https://360ghar.com/${citySlug}/${intent}/${type}` },
    ]
  ), [city, citySlug, citySearchUrl, facet, intent, intentLabel, type]);

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={keywords}
        canonical={`/${canonicalCitySlug}/${intent}/${type}`}
        structuredData={[
          generateBreadcrumbStructuredData(breadcrumbs),
          {
            '@type': 'ItemList',
            name: title,
            description,
            url: `https://360ghar.com/${citySlug}/${intent}/${type}`,
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

            <div className="mt-5">
              <h2 className="h5 mb-3">Why 360Ghar?</h2>
              <ul className="text-start">
                <li>India&apos;s first AI-Enabled and Virtual Tour first Real Estate Platform</li>
                <li>All properties verified by our on-site team with 360° virtual tours</li>
                <li>Dedicated Relationship Manager handles your end-to-end flow so you can relax</li>
                <li>Full visibility, convenience, and transparency for the same brokerage amount</li>
              </ul>
            </div>
          </div>
        </section>

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Landing;

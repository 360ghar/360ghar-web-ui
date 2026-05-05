import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import AiFactSheet from '../../components/seo/AiFactSheet';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';
import localities from '../../data/localities.json';
import localityLandmarks from '../../data/locality-landmarks.json';

const pretty = (s) => (s || '').replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const VALID_INTENTS = ['buy', 'rent'];

const APARTMENT_TYPES = new Set([
  'apartment',
  'flat',
  'penthouse',
  'studio',
  'loft',
]);

const isApartmentType = (entity) => {
  const rawType = (entity.entityType || entity.type || '').toLowerCase();
  const name = (entity.name || '').toLowerCase();
  if (APARTMENT_TYPES.has(rawType)) return true;
  if (/society|apartment|flat|residency|residential|heights|towers|enclave|vihar|kunj|sarovar|green|estate|riverside/i.test(name)) return true;
  return false;
};

const buildSocietyFaqs = (societyName, city, intent) => {
  const intentLabel = intent === 'rent' ? 'rent' : 'sale';
  const intentVerb = intent === 'rent' ? 'renting' : 'buying';
  return [
    {
      question: `What is the average price for flats for ${intentLabel} in ${societyName}, ${city}?`,
      answer: `Prices in ${societyName} vary by configuration, floor, and furnishing. Browse 360Ghar's verified listings with 360° virtual tours for actual market rates. Every listing is physically verified by our on-site team.`,
    },
    {
      question: `Is ${societyName} a good locality for ${intentVerb} in ${city}?`,
      answer: `${societyName} is a well-established residential society in ${city}. Evaluate based on commute proximity, maintenance quality, and amenity delivery. 360Ghar provides verified on-ground data and 360° virtual tours so you can assess the society before visiting.`,
    },
    {
      question: `Are properties in ${societyName} verified on 360Ghar?`,
      answer: `Yes. Every property listed on 360Ghar is physically verified by our on-site team. We confirm ownership documents, capture authentic photos and 360° virtual tours, and validate exact locations before a listing goes live in ${societyName}.`,
    },
  ];
};

const SocietyLanding = () => {
  const { slug, intent } = useParams();
  const validIntent = VALID_INTENTS.includes(intent) ? intent : 'buy';
  const intentLabel = validIntent === 'rent' ? 'Rent' : 'Sale';

  // Find entity by slug or slug with -gurgaon suffix
  const entity = localities.find(
    (l) => l.slug === slug || l.slug === slug.replace(/-gurgaon$/i, '') + '-gurgaon'
  ) || localities.find(
    (l) => l.slug === slug.replace(/-gurgaon$/i, '')
  );

  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  if (!entity) {
    return (
      <>
        <SEO title="Society Not Found | 360Ghar" noindex />
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
            <div className="container container-two text-center">
              <h1 className="mb-3">Society Not Found</h1>
              <p className="text-muted mb-4">
                The society you are looking for does not exist or has been removed.
              </p>
              <Link to="/localities" className="btn btn-main">
                Browse All Localities
              </Link>
            </div>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  const societyName = pretty(entity.name);
  const city = entity.city || 'Gurugram';
  const canonicalCitySlug = (entity.city || 'gurgaon').toLowerCase().replace(/\s+/g, '-').replace('gurugram', 'gurgaon');
  const canonicalSlug = entity.slug;
  const canonicalPath = `/locality/${canonicalSlug}/${validIntent}`;

  // Determine facet label
  const facet = isApartmentType(entity) ? 'Flats' : 'Properties';

  // Build browse queries
  const browseQueryBuy = buildPropertySearchQuery({
    city,
    purpose: 'buy',
    locality: entity.name,
  });
  const browseQueryRent = buildPropertySearchQuery({
    city,
    purpose: 'rent',
    locality: entity.name,
  });

  // SEO
  const title = `Flats for ${intentLabel} in ${societyName}, ${city} | 360Ghar`;
  const description = `Explore verified flats for ${intentLabel.toLowerCase()} in ${societyName}, ${city}. On-site verified properties with 360° virtual tours. Dedicated Relationship Manager for end-to-end assistance.`;

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: city, url: `https://360ghar.com/${canonicalCitySlug}` },
    { name: societyName, url: `https://360ghar.com/locality/${canonicalSlug}-gurgaon` },
    { name: intentLabel, url: `https://360ghar.com${canonicalPath}` },
  ];

  // Overview
  const overview = entity.contentBlocks?.overview || `${societyName} is a residential society in ${city} offering gated community living with shared amenities, maintenance services, and a resident welfare association. Society properties appeal to families seeking managed living environments.`;

  // Nearby landmarks
  const landmarks = localityLandmarks.find(
    (l) => l.slug === canonicalSlug || l.slug === canonicalSlug.replace(/-gurgaon$/i, '')
  );

  // FAQs
  const faqItems = buildSocietyFaqs(societyName, city, validIntent);

  // Structured data
  const faqStructuredData = {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  const structuredData = [
    generateBreadcrumbStructuredData(breadcrumbs),
    {
      '@type': 'CollectionPage',
      name: title,
      description,
      url: `https://360ghar.com${canonicalPath}`,
      about: {
        '@type': 'Place',
        name: societyName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city,
          addressRegion: 'Haryana',
          addressCountry: 'IN',
        },
      },
    },
    faqStructuredData,
  ];

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords={`${societyName} ${city} real estate, flats for ${intentLabel.toLowerCase()} in ${societyName}, ${societyName} properties, ${societyName} ${validIntent}`}
        canonical={canonicalPath}
        structuredData={structuredData}
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

        {/* ---- Hero ---- */}
        <section className="padding-y-60">
          <div className="container container-two">
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">
                {facet} for {intentLabel} in {societyName}, {city}
              </h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            {/* Property listings link buttons */}
            <div className="text-center d-flex flex-wrap justify-content-center gap-3">
              <Link to={`/properties?${browseQueryBuy}`} className="btn btn-main">
                Browse for Sale
              </Link>
              <Link to={`/properties?${browseQueryRent}`} className="btn btn-outline-main">
                Browse for Rent
              </Link>
            </div>
          </div>
        </section>

        {/* ---- Society Overview ---- */}
        <section className="padding-y-60 bg-light" id="society-overview">
          <div className="container container-two">
            <h2 className="h5 mb-3">About {societyName}</h2>
            <p>{overview}</p>
          </div>
        </section>

        {/* ---- Society Sidebar (as card section, not actual sidebar) ---- */}
        <section className="padding-y-60" id="society-living">
          <div className="container container-two">
            <h2 className="h5 mb-3">Living in {societyName}</h2>
            <div className="row g-3">
              <div className="col-md-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <i className="fas fa-users text-gradient fs-4 mb-2" />
                  <h3 className="h6 mb-1">RWA Information</h3>
                  <small className="text-muted">
                    Verify RWA registration and bylaws before purchasing. Request meeting minutes and financial statements.
                  </small>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <i className="fas fa-tools text-gradient fs-4 mb-2" />
                  <h3 className="h6 mb-1">Maintenance</h3>
                  <small className="text-muted">
                    Request a maintenance charge break-up from the seller. Compare per-sqft rates with nearby societies.
                  </small>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <i className="fas fa-parking text-gradient fs-4 mb-2" />
                  <h3 className="h6 mb-1">Parking</h3>
                  <small className="text-muted">
                    Check parking allocation for your unit and visitor parking rules. Confirm covered vs. open slots.
                  </small>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <i className="fas fa-bolt text-gradient fs-4 mb-2" />
                  <h3 className="h6 mb-1">Power Backup</h3>
                  <small className="text-muted">
                    Confirm power backup coverage for common areas and individual units. Check DG capacity and fuel charges.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Nearby Landmarks ---- */}
        {landmarks && landmarks.landmarks && landmarks.landmarks.length > 0 && (
          <section className="padding-y-60 bg-light" id="society-landmarks">
            <div className="container container-two">
              <h2 className="h5 mb-3">Nearby Landmarks</h2>
              <div className="row g-3">
                {landmarks.landmarks.map((lm) => (
                  <div className="col-sm-6 col-lg-3" key={lm.name}>
                    <div className="p-3 rounded-3 bg-white border h-100">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className={`fas ${lm.type === 'metro' ? 'fa-subway' : lm.type === 'road' ? 'fa-road' : lm.type === 'hospital' ? 'fa-hospital' : lm.type === 'market' || lm.type === 'mall' ? 'fa-shopping-bag' : 'fa-map-marker-alt'} text-gradient`} />
                        <strong className="small">{lm.name}</strong>
                      </div>
                      <small className="text-muted">{lm.distance}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---- Cross-links ---- */}
        <section className="padding-y-60" id="society-crosslinks">
          <div className="container container-two">
            <h2 className="h5 mb-3">Explore More</h2>
            <div className="d-flex flex-wrap gap-2">
              {validIntent !== 'buy' && (
                <Link
                  to={`/locality/${canonicalSlug}/buy`}
                  className="btn btn-outline-main btn-sm rounded-pill"
                >
                  Flats for Sale in {societyName}
                </Link>
              )}
              {validIntent !== 'rent' && (
                <Link
                  to={`/locality/${canonicalSlug}/rent`}
                  className="btn btn-outline-main btn-sm rounded-pill"
                >
                  Flats for Rent in {societyName}
                </Link>
              )}
              <Link
                to={`/${canonicalCitySlug}/buy/apartment`}
                className="btn btn-outline-main btn-sm rounded-pill"
              >
                Flats for Sale in {city}
              </Link>
              <Link
                to={`/${canonicalCitySlug}/rent/apartment`}
                className="btn btn-outline-main btn-sm rounded-pill"
              >
                Flats for Rent in {city}
              </Link>
              <Link
                to={`/locality/${canonicalSlug}-gurgaon`}
                className="btn btn-outline-main btn-sm rounded-pill"
              >
                {societyName} Locality Guide
              </Link>
              <Link
                to="/properties"
                className="btn btn-outline-main btn-sm rounded-pill"
              >
                All Properties
              </Link>
            </div>
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="padding-y-60 bg-light" id="society-faq">
          <div className="container container-two">
            <h2 className="h5 mb-3">Frequently Asked Questions</h2>
            <div className="accordion" id="societyFaqAccordion">
              {faqItems.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div className="accordion-item border-0 border-bottom" key={faq.question}>
                    <h3 className="accordion-header" id={`societyFaqHeading${idx}`}>
                      <button
                        className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`societyFaqCollapse${idx}`}
                        onClick={() => setOpenFaqIndex((current) => (current === idx ? -1 : idx))}
                      >
                        {faq.question}
                      </button>
                    </h3>
                    <div
                      id={`societyFaqCollapse${idx}`}
                      className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                      aria-labelledby={`societyFaqHeading${idx}`}
                    >
                      <div className="accordion-body text-muted">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---- AI Fact Sheet ---- */}
        <AiFactSheet context="landing" />

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default SocietyLanding;

import { useParams } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import AiFactSheet from '../../components/seo/AiFactSheet';
import ReviewDisplay from '../../components/reviews/ReviewDisplay';
import SEO from '../../common/SEO';
import { Helmet } from 'react-helmet-async';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { isIndexableCitySlug } from '../../seo/indexationPolicy';
import {
  normalizeCitySlug,
  getCityLandingLinks,
  getCityLocalities,
  getPriceRange,
  getComparisonLinks,
  getToolLinks,
  INTENTS,
} from '../../utils/internalLinks';
import { buildLandingKeywords } from '../../utils/landingKeywords';
import LandingPageContent from '../../components/landing/LandingPageContent';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const CITY_GEO = {
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  noida: { lat: 28.5355, lng: 77.3910 },
  faridabad: { lat: 28.4089, lng: 77.3178 },
  ghaziabad: { lat: 28.6692, lng: 77.4538 },
};

const CITY_META = {
  gurgaon: {
    fullName: 'Gurgaon',
    altName: 'Gurugram',
    state: 'Haryana',
    description: 'Gurgaon (Gurugram) is the largest hub for corporate offices and premium real estate in Delhi NCR. Home to DLF, Golf Course Road, and Cyber City.',
  },
  delhi: {
    fullName: 'Delhi',
    altName: 'New Delhi',
    state: 'Delhi',
    description: 'Delhi offers a diverse real estate market from Lutyens bungalows to modern high-rises in Dwarka and Rohini.',
  },
  noida: {
    fullName: 'Noida',
    altName: 'New Okhla Industrial Development Authority',
    state: 'Uttar Pradesh',
    description: 'Noida is a planned city with modern infrastructure, IT parks, and a booming apartment market along the Noida-Greater Noida Expressway.',
  },
  faridabad: {
    fullName: 'Faridabad',
    altName: null,
    state: 'Haryana',
    description: 'Faridabad offers affordable housing options along Mathura Road with improving metro connectivity.',
  },
  ghaziabad: {
    fullName: 'Ghaziabad',
    altName: null,
    state: 'Uttar Pradesh',
    description: 'Ghaziabad provides budget-friendly housing in Indirapuram, Vaishali, and Crossing Republik with excellent Delhi connectivity.',
  },
};

const buildCityHubFaqs = (city, meta) => [
  {
    question: `Is ${city} a good place to invest in real estate?`,
    answer: `${city} in ${meta.state} has seen consistent real estate demand driven by infrastructure growth and employment. 360Ghar provides verified listings with 360° virtual tours so you can evaluate options thoroughly before investing.`,
  },
  {
    question: `What are the best localities to buy a property in ${city}?`,
    answer: `Top localities depend on your budget and commute needs. 360Ghar lists verified properties across ${city}'s prominent neighborhoods with on-ground data, locality insights, and virtual tours for informed decision-making.`,
  },
  {
    question: `How does 360Ghar verify properties in ${city}?`,
    answer: `Every property on 360Ghar is physically verified by our on-site team. We confirm ownership documents, capture authentic photos and 360° virtual tours, and validate exact locations before a listing goes live in ${city}.`,
  },
];

const CityHub = () => {
  const { t } = useTranslation();
  const { citySlug } = useParams();

  const canonical = normalizeCitySlug(citySlug);
  const shouldIndex = isIndexableCitySlug(canonical);
  const meta = CITY_META[canonical] || { fullName: pretty(canonical), altName: null, state: 'NCR', description: `Explore real estate in ${pretty(canonical)}.` };
  const city = meta.fullName;

  const landingLinks = getCityLandingLinks(canonical);
  const topLocalities = getCityLocalities(canonical, { limit: 8 });
  const comparisonLinks = getComparisonLinks();
  const toolLinks = getToolLinks();
  const faqItems = buildCityHubFaqs(city, meta);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Group landing links by intent
  const byIntent = {};
  for (const intent of INTENTS) {
    byIntent[intent.key] = landingLinks.filter((l) => l.intent === intent.key);
  }

  const title = `${city} Real Estate | Buy, Rent & PG in ${city} | 360Ghar`;
  const description = `Explore verified properties in ${city} to buy, rent, or find PG. All listings verified by 360Ghar's on-site team with 360° virtual tours. Dedicated Relationship Manager for end-to-end service.`;
  const keywords = buildLandingKeywords({ facet: 'Properties', city, validIntent: 'buy' });

  const canonicalPath = `/${canonical}`;
  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: city, url: `https://360ghar.com${canonicalPath}` },
  ];

  const faqStructuredData = {
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  // Price overview
  const buyPrice = getPriceRange(canonical, 'buy', 'apartment');
  const rentPrice = getPriceRange(canonical, 'rent', 'apartment');

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
            '@type': 'Place',
            name: city,
            description: meta.description,
            address: {
              '@type': 'PostalAddress',
              addressLocality: city,
              addressRegion: meta.state,
              addressCountry: 'IN',
            },
            ...(CITY_GEO[canonical] ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: CITY_GEO[canonical].lat,
                longitude: CITY_GEO[canonical].lng,
              },
            } : {}),
            url: `https://360ghar.com${canonicalPath}`,
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

        {/* Hero */}
        <section className="padding-y-60">
          <div className="container container-two">
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">{city} Real Estate</h1>
              <p className="section-heading__desc">{meta.description}</p>
            </div>

            {/* Price overview */}
            {(buyPrice || rentPrice) && (
              <div className="row g-3 mb-5 justify-content-center">
                {buyPrice && (
                  <div className="col-md-5">
                    <div className="p-4 rounded-3 border bg-white">
                      <h2 className="h6 mb-1">
                        <i className="fas fa-home text-gradient me-2" />
                        Buy in {city}
                      </h2>
                      <p className="mb-0">
                        Apartment prices: <strong>{buyPrice}</strong>
                      </p>
                    </div>
                  </div>
                )}
                {rentPrice && (
                  <div className="col-md-5">
                    <div className="p-4 rounded-3 border bg-white">
                      <h2 className="h6 mb-1">
                        <i className="fas fa-key text-gradient me-2" />
                        Rent in {city}
                      </h2>
                      <p className="mb-0">
                        Apartment rents: <strong>{rentPrice}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Property type links by intent */}
        {INTENTS.map((intent) => {
          const links = byIntent[intent.key];
          if (!links.length) return null;
          return (
            <section className="padding-y-60 bg-white" key={intent.key}>
              <div className="container container-two">
                <h2 className="h5 mb-3">
                  {intent.key === 'buy' ? 'Properties for Sale' : intent.key === 'rent' ? 'Properties for Rent' : 'PG & Co-living'} in {city}
                </h2>
                <div className="row g-3">
                  {links.map((link) => (
                    <div className="col-sm-6 col-lg-4 col-xl" key={link.to}>
                      <I18nLink
                        to={link.to}
                        className="d-block p-3 rounded-3 bg-light border text-decoration-none text-center"
                        style={{ color: 'inherit' }}
                      >
                        <i className="fas fa-building text-gradient me-1" />
                        <span className="fw-medium">{link.label}</span>
                      </I18nLink>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Top localities */}
        {topLocalities.length > 0 && (
          <section className="padding-y-60 bg-light">
            <div className="container container-two">
              <div className="d-flex justify-content-between align-items-end mb-3">
                <div>
                  <h2 className="h5 mb-1">Top Localities in {city}</h2>
                  <p className="text-muted mb-0">Explore verified properties in {city}&apos;s most popular neighborhoods.</p>
                </div>
                <I18nLink to="/localities" className="btn btn-outline-main btn-sm rounded-pill">
                  Browse All
                </I18nLink>
              </div>
              <div className="row g-3">
                {topLocalities.map((loc) => (
                  <div className="col-sm-6 col-lg-3" key={loc.slug}>
                    <I18nLink
                      to={`/locality/${loc.slug}-${canonical}`}
                      className="d-block p-3 rounded-3 bg-white border text-decoration-none"
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

        {/* Tools & Resources */}
        <section className="padding-y-60">
          <div className="container container-two">
            <h2 className="h5 mb-3">Tools &amp; Resources</h2>
            <div className="row g-3">
              {toolLinks.map((tool) => (
                <div className="col-sm-6 col-lg-4 col-xl" key={tool.to}>
                  <I18nLink
                    to={tool.to}
                    className="d-block p-3 rounded-3 bg-light border text-decoration-none text-center"
                    style={{ color: 'inherit' }}
                  >
                    <i className={`fas ${tool.icon} text-gradient me-1`} />
                    <span className="fw-medium">{tool.label}</span>
                  </I18nLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison pages */}
        <section className="padding-y-60 bg-light">
          <div className="container container-two">
            <h2 className="h5 mb-3">How 360Ghar Compares</h2>
            <div className="row g-3">
              {comparisonLinks.map((link) => (
                <div className="col-sm-6 col-lg-3" key={link.to}>
                  <I18nLink
                    to={link.to}
                    className="d-block p-3 rounded-3 bg-white border text-decoration-none text-center"
                    style={{ color: 'inherit' }}
                  >
                    <i className="fas fa-scale-balanced text-gradient me-1" />
                    <span className="fw-medium">{link.label}</span>
                  </I18nLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="padding-y-60">
          <div className="container container-two">
            <h2 className="h5 mb-3">Frequently Asked Questions</h2>
            <div className="accordion" id="cityHubFaqAccordion">
              {faqItems.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div className="accordion-item border-0 border-bottom" key={faq.question}>
                    <h3 className="accordion-header" id={`cityHubFaqHeading${idx}`}>
                      <button
                        className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`cityHubFaqCollapse${idx}`}
                        onClick={() => setOpenFaqIndex((cur) => (cur === idx ? -1 : idx))}
                      >
                        {faq.question}
                      </button>
                    </h3>
                    <div
                      id={`cityHubFaqCollapse${idx}`}
                      className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                      aria-labelledby={`cityHubFaqHeading${idx}`}
                    >
                      <div className="accordion-body text-muted">{faq.answer}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Content depth — neighborhood guide, price trends, tips, legal checklist */}
        <LandingPageContent
          citySlug={canonical}
          city={city}
          intent="buy"
          facet="Properties"
          canonicalType="apartment"
        />

        <AiFactSheet context="cityHub" />
        <ReviewDisplay
          reviews={[
            { rating: 5, text: 'Found a verified apartment through 360Ghar. The VR tour saved me multiple visits.', name: 'Verified User', role: 'Buyer' },
          ]}
          averageRating={4.7}
          totalCount={128}
        />

        <Cta ctaClass="" />
        <Footer />
      </main>
    </>
  );
};

export default CityHub;

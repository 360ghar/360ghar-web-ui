import { useParams } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import AiFactSheet from '../../components/seo/AiFactSheet';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';
import officeLandmarks from '../../data/office-landmarks.json';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const TYPE_LABELS = {
  it_hub: 'IT / Corporate Hub',
  industrial: 'Industrial Area',
  corporate: 'Corporate Corridor',
  transit: 'Transit Hub',
  hospital: 'Hospital',
  commercial: 'Commercial Hub',
};

const NearOfficePage = () => {
  const { t } = useTranslation();
  const [tSeo] = useTranslation('seo');
  const { slug } = useParams();
  const landmark = officeLandmarks.find((l) => l.slug === slug);

  if (!landmark) {
    return (
      <>
        <Header />
        <main className="body-bg">
          <section className="padding-y-60">
            <div className="container container-two text-center">
              <h1>Location Not Found</h1>
              <p className="text-muted">We could not find the office location you are looking for.</p>
              <I18nLink to="/properties" className="btn btn-main mt-3">Browse All Properties</I18nLink>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const name = landmark.name;
  const city = pretty(landmark.city);
  const typeLabel = TYPE_LABELS[landmark.type] || landmark.type;
  const browseQuery = buildPropertySearchQuery({
    city,
    purpose: 'buy',
    lat: landmark.lat,
    lng: landmark.lng,
    radius: 5,
  });
  const rentQuery = buildPropertySearchQuery({
    city,
    purpose: 'rent',
    lat: landmark.lat,
    lng: landmark.lng,
    radius: 5,
  });

  const title = tSeo('nearOffice.titleTemplate', { name, city });
  const description = tSeo('nearOffice.descriptionTemplate', { name, city });

  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: city, url: `https://360ghar.com/${landmark.city}` },
    { name: `Near ${name}`, url: `https://360ghar.com/near/${slug}` },
  ];

  const otherLandmarks = officeLandmarks
    .filter((l) => l.slug !== slug && l.city === landmark.city)
    .slice(0, 6);

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={`/near/${slug}`}
        structuredData={[
          generateBreadcrumbStructuredData(breadcrumbs),
          {
            '@type': 'WebPage',
            name: title,
            description,
            url: `https://360ghar.com/near/${slug}`,
            about: {
              '@type': 'Place',
              name,
              geo: {
                '@type': 'GeoCoordinates',
                latitude: landmark.lat,
                longitude: landmark.lng,
              },
            },
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
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="padding-y-60">
          <div className="container container-two">
            <div className="section-heading text-center mb-4">
              <h1 className="section-heading__title">Property near {name}, {city}</h1>
              <p className="section-heading__desc">{description}</p>
            </div>

            <div className="text-center d-flex gap-2 justify-content-center flex-wrap">
              <I18nLink to={`/properties?${browseQuery}`} className="btn btn-main">
                Browse for Sale
              </I18nLink>
              <I18nLink to={`/properties?${rentQuery}`} className="btn btn-outline-main">
                Browse for Rent
              </I18nLink>
            </div>

            {/* Landmark Info */}
            <div className="mt-5 p-4 bg-light rounded-3 border">
              <div className="row g-4">
                <div className="col-md-6">
                  <h2 className="h5 mb-2">About {name}</h2>
                  <p className="text-muted">{landmark.description}</p>
                  <p className="mb-0">
                    <strong>Type:</strong> {typeLabel} <span className="mx-2">|</span>
                    <strong>Search radius:</strong> 5 km
                  </p>
                </div>
                <div className="col-md-6">
                  <h2 className="h5 mb-2">Why live near {name}?</h2>
                  <ul className="text-muted mb-0">
                    <li>Short commute to {typeLabel.toLowerCase()} — walk or cycle to work</li>
                    <li>High rental demand ensures steady investment returns</li>
                    <li>Mature social infrastructure with schools, hospitals, and markets</li>
                    <li>Properties within 5 km retain premium value</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="row g-3 mt-4">
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">5 km</strong>
                  <small className="text-muted">Search radius</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">360° Tours</strong>
                  <small className="text-muted">Virtual walkthroughs</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 bg-white border text-center h-100">
                  <strong className="d-block text-main fs-5">Verified</strong>
                  <small className="text-muted">On-site verification</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other nearby landmarks */}
        {otherLandmarks.length > 0 && (
          <section className="padding-y-60 bg-light">
            <div className="container container-two">
              <h2 className="h5 mb-3">Other {city} Locations</h2>
              <div className="row g-3">
                {otherLandmarks.map((l) => (
                  <div className="col-md-6 col-lg-4" key={l.slug}>
                    <I18nLink to={`/near/${l.slug}`} className="text-decoration-none">
                      <div className="p-3 rounded-3 bg-white border h-100">
                        <h3 className="h6 mb-1">{l.name}</h3>
                        <small className="text-muted">{TYPE_LABELS[l.type] || l.type}</small>
                      </div>
                    </I18nLink>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <AiFactSheet context="landing" />
        <Cta ctaClass="" />
        <Footer />
      </main>
    </>
  );
};

export default NearOfficePage;

import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import PropertyPageSection from '../../components/property/PropertyPageSection';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { useLocation } from 'react-router-dom';
import { I18nLink, stripLocalePrefix } from '../../i18n/I18nLink';
import { useTranslation } from 'react-i18next';
import { siteMetadata } from '../../seo/siteMetadata';
import { realEstateStructuredData, generateBreadcrumbStructuredData } from '../../seo/structuredData';

const popularSearchesConfig = [
    { labelKey: 'popularSearches.flatsRentGurugram', to: '/gurgaon/rent/flats' },
    { labelKey: 'popularSearches.apartmentsSaleGurugram', to: '/gurgaon/buy/flats' },
    { labelKey: 'popularSearches.twoBhkFlatsSaleGurgaon', to: '/gurgaon/buy/flats/2-bhk' },
    { labelKey: 'popularSearches.flatsRentUnder20k', to: '/gurgaon/rent/flats/budget/under-20k' },
    { labelKey: 'popularSearches.pgGurugram', to: '/gurgaon/pg/flats' },
    { labelKey: 'popularSearches.exploreLocalities', to: '/localities' },
];

const Property = () => {
    const { t } = useTranslation('properties');
    const [tSeo] = useTranslation('seo');
    const location = useLocation();

    const barePath = stripLocalePrefix(location.pathname);

    // Cursor pagination: the property list is an infinite "Load more" stream
    // keyed off the active filters, so there is no canonical page N to link to.
    // We use the bare path as the canonical URL (no ?page= param).
    const canonical = barePath;

    // Enhanced structured data for property listings
    const propertyStructuredData = [
        realEstateStructuredData.realEstateListing,
        generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Properties', url: 'https://360ghar.com/properties' }
        ])
    ];

    return (
        <>
        <SEO
          title={tSeo('properties.title')}
          description={tSeo('properties.description')}
          keywords="Gurugram properties, Gurgaon real estate, AI property search Gurugram, buy property Gurugram, sell property Gurgaon, rent apartments Gurugram, verified properties India, on-site verified listings, flats for sale in Gurgaon, flats for rent in Gurgaon, 1 BHK 2 BHK 3 BHK, ready to move flats, new launch projects, resale apartments, PG in Gurgaon, girls PG, co-living Gurugram, DLF Phase properties, Golf Course Road apartments, Sohna Road flats, Cyber City office space, near metro apartments, no broker, direct owner, verified listings, 360 virtual tours"
          canonical={canonical}
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={propertyStructuredData}
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

            <section className="py-4 bg-white">
                <div className="container container-two">
                    <div className="row g-4 align-items-start">
                        <div className="col-lg-7">
                            <span className="subtitle bg-gray-100 px-3 py-2 rounded-pill d-inline-block mb-3">{t('listing.subtitle')}</span>
                            <h1 className="mb-2">{t('listing.title')}</h1>
                            <p className="text-muted mb-4">
                                {t('listing.description')}
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <a href="#property-search-results" className="btn btn-main">{t('listing.browseListings')}</a>
                                <I18nLink to="/localities" className="btn btn-outline-main">{t('listing.compareLocalities')}</I18nLink>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="locality-stat-card h-100">
                                <span className="locality-stat-card__label">{t('listing.popularSearches')}</span>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {popularSearchesConfig.map((search) => (
                                        <I18nLink key={search.to} to={search.to} className="btn btn-outline-main btn-sm">
                                            {t(search.labelKey)}
                                        </I18nLink>
                                    ))}
                                </div>
                                <p className="text-muted mb-0">
                                    {t('listing.popularSearchesDescription')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="property-search-results">
            <PropertyPageSection/>
            </section>

            <Cta ctaClass=""/>
            <Footer/>

        </main>
        </>
    );
};

export default Property;

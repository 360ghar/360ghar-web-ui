import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import PropertyPageSection from '../../components/property/PropertyPageSection';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { useSearchParams } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import { useTranslation } from 'react-i18next';
import { siteMetadata } from '../../seo/siteMetadata';
import { realEstateStructuredData, generateBreadcrumbStructuredData } from '../../seo/structuredData';

const popularSearches = [
    { label: 'Flats for rent in Gurugram', to: '/gurgaon/rent/flats' },
    { label: 'Apartments for sale in Gurugram', to: '/gurgaon/buy/flats' },
    { label: 'PG in Gurugram', to: '/gurgaon/pg/flats' },
    { label: 'Explore localities', to: '/localities' },
];

const Property = () => {
    const { t } = useTranslation('properties');
    const [searchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page'), 10) || 1;

    // Canonical: /properties for page 1, /properties?page=N for page > 1
    const canonical = page > 1 ? `/properties?page=${page}` : '/properties';

    // Prev/next for pagination
    const prevUrl = page > 1 ? (page === 2 ? '/properties' : `/properties?page=${page - 1}`) : undefined;
    const nextUrl = page > 1 ? `/properties?page=${page + 1}` : undefined;

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
          title="Properties in Gurugram | AI-Powered Search & Verified Listings | 360Ghar"
          description="Browse verified properties in Gurugram with 360° virtual tours. Find apartments, flats, builder floors, independent houses, and PGs in prime locations like DLF Phase, Golf Course Road, Sohna Road, Cyber City. All properties verified by on-site team."
          keywords="Gurugram properties, Gurgaon real estate, AI property search Gurugram, buy property Gurugram, sell property Gurgaon, rent apartments Gurugram, verified properties India, on-site verified listings, flats for sale in Gurgaon, flats for rent in Gurgaon, 1 BHK 2 BHK 3 BHK, ready to move flats, new launch projects, resale apartments, PG in Gurgaon, girls PG, co-living Gurugram, DLF Phase properties, Golf Course Road apartments, Sohna Road flats, Cyber City office space, near metro apartments, no broker, direct owner, verified listings, 360 virtual tours"
          canonical={canonical}
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={propertyStructuredData}
          prevUrl={prevUrl}
          nextUrl={nextUrl}
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
                                    {popularSearches.map((search) => (
                                        <I18nLink key={search.to} to={search.to} className="btn btn-outline-main btn-sm">
                                            {search.label}
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

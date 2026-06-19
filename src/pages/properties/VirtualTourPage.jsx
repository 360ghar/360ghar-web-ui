import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateVideoStructuredData } from '../../seo/structuredData';
import { propertyAPIService } from '../../services/propertyAPIService';
import { siteMetadata } from '../../seo/siteMetadata';

const VirtualTourPage = () => {
    const { t } = useTranslation('properties');
    const [tSeo] = useTranslation('seo');
    const { id } = useParams();
    const [propertyData, setPropertyData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        const fetchProperty = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await propertyAPIService.getPropertyById(id);
                if (!cancelled) {
                    setPropertyData(response.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || 'Failed to load property');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchProperty();
        return () => { cancelled = true; };
    }, [id]);

    // Derived values
    const propertyTitle = propertyData?.title || 'Property';
    const locality = propertyData?.locality || propertyData?.city || 'Gurugram';
    const bhkLabel = propertyData?.bhk
        ? `${propertyData.bhk} BHK`
        : propertyData?.bedrooms
            ? `${propertyData.bedrooms} Bedroom`
            : '';
    const priceValue = propertyData?.purpose === 'rent'
        ? (propertyData?.monthly_rent || propertyData?.daily_rate || propertyData?.base_price || 0)
        : (propertyData?.base_price || propertyData?.monthly_rent || propertyData?.daily_rate || 0);
    const virtualTourUrl = propertyData?.virtual_tour_url || propertyData?.tour_url || '';
    const mainImage = (Array.isArray(propertyData?.images) && propertyData.images[0]?.image_url)
        || siteMetadata.defaultOgImage;

    // SEO
    const seoTitle = propertyData
        ? `${propertyTitle} - 360° Virtual Tour | 360Ghar`
        : tSeo('virtualTour.fallbackTitle');
    const seoDescription = propertyData
        ? `Take a 360° virtual tour of ${propertyTitle} in ${locality}. Walk through living room, kitchen, bedrooms, and society amenities before scheduling a visit.`
        : siteMetadata.defaultDescription;

    // Structured data
    const breadcrumbData = propertyData
        ? [
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Properties', url: 'https://360ghar.com/properties' },
            { name: propertyTitle, url: `https://360ghar.com/property/${propertyData.id}` },
            { name: 'Virtual Tour', url: `https://360ghar.com/property/${propertyData.id}/virtual-tour` },
        ]
        : [];

    const videoStructuredData = propertyData && virtualTourUrl
        ? generateVideoStructuredData({
            title: `${propertyTitle} - 360° Virtual Tour`,
            description: seoDescription,
            thumbnail: mainImage,
            contentUrl: virtualTourUrl,
            uploadDate: new Date().toISOString(),
            duration: 'PT5M',
        })
        : null;

    // VideoObject with hasPart chapters
    const videoWithChapters = propertyData && virtualTourUrl
        ? {
            ...videoStructuredData,
            hasPart: [
                {
                    '@type': 'Clip',
                    name: 'Living Room',
                    startOffset: 0,
                    endOffset: 60,
                },
                {
                    '@type': 'Clip',
                    name: 'Kitchen',
                    startOffset: 60,
                    endOffset: 120,
                },
                {
                    '@type': 'Clip',
                    name: 'Bedrooms',
                    startOffset: 120,
                    endOffset: 200,
                },
                {
                    '@type': 'Clip',
                    name: 'Balcony',
                    startOffset: 200,
                    endOffset: 240,
                },
                {
                    '@type': 'Clip',
                    name: 'Society Amenities',
                    startOffset: 240,
                    endOffset: 300,
                },
            ],
        }
        : null;

    const structuredData = [
        ...(propertyData ? [generateBreadcrumbStructuredData(breadcrumbData)] : []),
        ...(videoWithChapters ? [videoWithChapters] : []),
    ];

    // Tour highlights
    const tourHighlights = [
        { icon: 'fas fa-couch', label: t('virtualTourPage.highlights.livingRoom'), description: t('virtualTourPage.highlights.livingRoomDesc') },
        { icon: 'fas fa-utensils', label: t('virtualTourPage.highlights.kitchen'), description: t('virtualTourPage.highlights.kitchenDesc') },
        { icon: 'fas fa-bed', label: t('virtualTourPage.highlights.bedrooms'), description: t('virtualTourPage.highlights.bedroomsDesc') },
        { icon: 'fas fa-wind', label: t('virtualTourPage.highlights.balcony'), description: t('virtualTourPage.highlights.balconyDesc') },
        { icon: 'fas fa-swimming-pool', label: t('virtualTourPage.highlights.societyAmenities'), description: t('virtualTourPage.highlights.societyAmenitiesDesc') },
    ];

    return (
        <>
            <SEO
                title={seoTitle}
                description={seoDescription}
                image={mainImage}
                video={virtualTourUrl || undefined}
                structuredData={structuredData}
                noindex={!propertyData}
            />
            <main className="body-bg">
                <OffCanvas />
                <MobileMenu />

                {/* Header */}
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText={t('common:header.postProperty')}
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                {/* Loading State */}
                {isLoading && (
                    <section className="padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                                <p className="mt-3">{t('virtualTourPage.loadingTour')}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Error / Not Found State */}
                {!isLoading && error && (
                    <section className="padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
                                <h4 className="mt-3 text-danger">{t('virtualTourPage.propertyNotFound')}</h4>
                                <p>{t('virtualTourPage.notFoundDescription')}</p>
                                <I18nLink to="/properties" className="btn btn-main mt-3">
                                    <span className="icon-left"><i className="fas fa-arrow-left"></i></span>
                                    {t('virtualTourPage.browseProperties')}
                                </I18nLink>
                            </div>
                        </div>
                    </section>
                )}

                {!isLoading && !error && !propertyData && (
                    <section className="padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-home fa-2x text-muted"></i>
                                <h4 className="mt-3">{t('virtualTourPage.propertyNotFound')}</h4>
                                <p>{t('virtualTourPage.notFoundDescription')}</p>
                                <I18nLink to="/properties" className="btn btn-main mt-3">
                                    <span className="icon-left"><i className="fas fa-arrow-left"></i></span>
                                    {t('virtualTourPage.browseProperties')}
                                </I18nLink>
                            </div>
                        </div>
                    </section>
                )}

                {/* Main Content */}
                {!isLoading && !error && propertyData && (
                    <>
                        {/* Breadcrumb */}
                        <section className="breadcrumb-area padding-y-30">
                            <div className="container container-two">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                                        <li className="breadcrumb-item"><I18nLink to="/">{t('virtualTourPage.home')}</I18nLink></li>
                                        <li className="breadcrumb-item"><I18nLink to="/properties">{t('virtualTourPage.properties')}</I18nLink></li>
                                        <li className="breadcrumb-item"><I18nLink to={`/property/${propertyData.id}`}>{propertyTitle}</I18nLink></li>
                                        <li className="breadcrumb-item active" aria-current="page">{t('virtualTourPage.virtualTour')}</li>
                                    </ol>
                                </nav>
                            </div>
                        </section>

                        {/* Virtual Tour Embed */}
                        <section className="padding-y-40">
                            <div className="container container-two">
                                {virtualTourUrl ? (
                                    <div className="virtual-tour-embed" style={{ width: '100%', minHeight: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                                        <iframe
                                            src={virtualTourUrl}
                                            title={`${propertyTitle} - 360° Virtual Tour`}
                                            style={{ width: '100%', height: '600px', border: 'none', display: 'block' }}
                                            allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-5" style={{ background: '#f8f9fa', borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-vr-cardboard fa-3x text-muted mb-3"></i>
                                        <h4>{t('virtualTourPage.tourNotAvailable')}</h4>
                                        <p className="text-muted">{t('virtualTourPage.tourNotAvailableDescription')}</p>
                                        <I18nLink to={`/property/${propertyData.id}`} className="btn btn-main mt-2">
                                            {t('virtualTourPage.viewPropertyDetails')}
                                        </I18nLink>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Property Info Card */}
                        <section className="padding-y-30">
                            <div className="container container-two">
                                <div className="card" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                    <div className="card-body p-4">
                                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                            <div>
                                                <h3 className="mb-1" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                                    <I18nLink to={`/property/${propertyData.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        {propertyTitle}
                                                    </I18nLink>
                                                </h3>
                                                <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: '0.9rem' }}>
                                                    {bhkLabel && (
                                                        <span><i className="fas fa-bed me-1"></i>{bhkLabel}</span>
                                                    )}
                                                    <span><i className="fas fa-map-marker-alt me-1"></i>{locality}</span>
                                                    {priceValue > 0 && (
                                                        <span style={{ fontWeight: 600, color: '#ff6b00' }}>
                                                            <i className="fas fa-rupee-sign me-1"></i>
                                                            {propertyData.purpose === 'rent'
                                                                ? `${Number(priceValue).toLocaleString('en-IN')}/mo`
                                                                : Number(priceValue).toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <I18nLink to={`/property/${propertyData.id}`} className="btn btn-outline-main">
                                                <span className="icon-left"><i className="fas fa-arrow-left"></i></span>
                                                {t('virtualTourPage.backToProperty')}
                                            </I18nLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tour Highlights */}
                        {virtualTourUrl && (
                            <section className="padding-y-40">
                                <div className="container container-two">
                                    <h4 className="mb-4" style={{ fontWeight: 600 }}>
                                        <i className="fas fa-eye me-2 text-primary"></i>
                                        {t('virtualTourPage.whatThisTourCovers')}
                                    </h4>
                                    <div className="row g-3">
                                        {tourHighlights.map((highlight) => (
                                            <div key={highlight.label} className="col-md-6 col-lg-4">
                                                <div className="card h-100" style={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                    <div className="card-body p-3">
                                                        <div className="d-flex align-items-start gap-3">
                                                            <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#fff3e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className={`${highlight.icon} text-primary`}></i>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-1" style={{ fontWeight: 600 }}>{highlight.label}</h6>
                                                                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{highlight.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Back to Property CTA */}
                        {virtualTourUrl && (
                            <section className="padding-y-40">
                                <div className="container container-two text-center">
                                    <I18nLink to={`/property/${propertyData.id}`} className="btn btn-main btn-lg">
                                        <span className="icon-left"><i className="fas fa-arrow-left"></i></span>
                                        {t('virtualTourPage.backToPropertyDetails')}
                                    </I18nLink>
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
};

export default VirtualTourPage;

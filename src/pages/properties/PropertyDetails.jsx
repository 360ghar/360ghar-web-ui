import { useEffect } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import PropertyDetailsSection from '../../components/property/PropertyDetailsSection';
import { useParams } from 'react-router-dom';
import ReraVerifiedBadge from '../../components/data-hub/ReraVerifiedBadge';
import NeighbourhoodScorePanel from '../../components/data-hub/NeighbourhoodScorePanel';
import ZoneInfoCard from '../../components/data-hub/ZoneInfoCard';
import CircleRateBanner from '../../components/data-hub/CircleRateBanner';

import SEO from '../../common/SEO';
import { useTranslation } from 'react-i18next';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData, generateVideoStructuredData, generatePropertyProductStructuredData, generateEeaSignals } from '../../seo/structuredData';
import { usePropertyStore } from '../../store/propertyStore';
import {
    getAccommodationSchemaType,
    getListingLabel,
    getListingSchemaType,
    getPropertyTypeLabel,
} from '../../utils/propertyTaxonomy';

const PropertyDetails = () => {
    const { t } = useTranslation('properties');
    const { id } = useParams();
    const {
        currentProperty: propertyData,
        isLoading,
        error,
        fetchPropertyById
    } = usePropertyStore();

    useEffect(() => {
        if (id) {
            fetchPropertyById(id);
        }
    }, [id, fetchPropertyById]);

    const propertyTypeLabel = getPropertyTypeLabel(propertyData?.property_type);
    const listingLabel = getListingLabel({
        propertyType: propertyData?.property_type,
        purpose: propertyData?.purpose,
    });
    const locationLabel = propertyData?.locality || propertyData?.city || 'Gurugram';
    const priceValue = propertyData?.purpose === 'rent'
        ? (propertyData?.monthly_rent || propertyData?.daily_rate || propertyData?.base_price || 0)
        : (propertyData?.base_price || propertyData?.monthly_rent || propertyData?.daily_rate || 0);
    const bhkLabel = propertyData?.bhk
        ? `${propertyData.bhk} BHK`
        : propertyData?.bedrooms
            ? `${propertyData.bedrooms} Bedroom`
            : '';

    // Generate enhanced structured data for property
    const generatePropertyStructured = () => {
        if (!propertyData) return [];

        // SingleFamilyResidence / Accommodation schema
        const basePropertySchema = {
            '@type': getAccommodationSchemaType(propertyData.property_type),
            name: propertyData.title || 'Property in Gurugram',
            description: propertyData.description || 'Premium property with 360° virtual tour in Gurugram',
            url: `https://360ghar.com/property/${propertyData.id}`,
            image: Array.isArray(propertyData.images)
                ? propertyData.images.map(img => img.image_url).filter(Boolean)
                : [siteMetadata.defaultOgImage],
            address: {
                '@type': 'PostalAddress',
                streetAddress: propertyData.full_address || propertyData.locality || 'Gurgaon',
                addressLocality: propertyData.city || 'Gurgaon',
                addressRegion: 'Haryana',
                postalCode: propertyData.pincode || '122001',
                addressCountry: 'IN'
            },
            geo: propertyData.lat && propertyData.lng ? {
                '@type': 'GeoCoordinates',
                latitude: propertyData.lat,
                longitude: propertyData.lng
            } : undefined,
            numberOfRooms: propertyData.bhk || 1,
            numberOfBedrooms: propertyData.bedrooms || propertyData.bhk || 1,
            numberOfBathroomsTotal: propertyData.bathrooms || 1,
            floorSize: {
                '@type': 'QuantitativeValue',
                value: propertyData.area_sqft || 1000,
                unitCode: 'FTK'
            },
            accommodationCategory: propertyTypeLabel,
            amenities: propertyData.amenities || [],
            petsAllowed: propertyData.amenities?.includes('pet-friendly') ? true : false,
        };

        // RealEstateListing schema
        const listingSchema = {
            '@type': 'RealEstateListing',
            name: `${propertyData.title || propertyTypeLabel} - ${listingLabel || 'Listing'}`,
            description: propertyData.description,
            url: `https://360ghar.com/property/${propertyData.id}`,
            listingType: getListingSchemaType({
                propertyType: propertyData.property_type,
                purpose: propertyData.purpose,
            }),
            datePosted: propertyData.created_at,
            price: priceValue,
            priceCurrency: 'INR',
            availability: propertyData.is_available !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemOffered: basePropertySchema
        };

        const breadcrumbData = [
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Properties', url: 'https://360ghar.com/properties' },
            { name: propertyData.title || 'Property Details', url: `https://360ghar.com/property/${propertyData.id}` }
        ];

        const structuredDataArray = [
            basePropertySchema,
            listingSchema,
            generatePropertyProductStructuredData(propertyData),
            ...generateEeaSignals({ reraNumber: propertyData.rera_number }),
            generateBreadcrumbStructuredData(breadcrumbData)
        ];

        // Add VideoObject schema when a virtual tour is available
        const virtualTourUrl = propertyData.virtual_tour_url || propertyData.tour_url;
        if (virtualTourUrl) {
            structuredDataArray.push(
                generateVideoStructuredData({
                    title: `360° Virtual Tour — ${propertyData.title || 'Property in Gurugram'}`,
                    description: propertyData.description
                        ? `Virtual tour: ${propertyData.description.slice(0, 200)}`
                        : 'Experience this property through an immersive 360° virtual tour on 360Ghar',
                    thumbnail: Array.isArray(propertyData.images) && propertyData.images[0]?.image_url
                        ? propertyData.images[0].image_url
                        : undefined,
                    uploadDate: propertyData.created_at || undefined,
                    contentUrl: virtualTourUrl,
                })
            );
            structuredDataArray.push({
                '@type': '3DModel',
                name: `360° Virtual Tour — ${propertyData.title || 'Property in Gurugram'}`,
                description: 'Interactive 3D virtual walkthrough of this property',
                encoding: {
                    '@type': 'MediaObject',
                    contentUrl: virtualTourUrl,
                    encodingFormat: 'text/html',
                },
            });
        }

        return structuredDataArray;
    };

    const mainImage = (Array.isArray(propertyData?.images) && propertyData.images[0]?.image_url) || siteMetadata.defaultOgImage;

    const isNotFound = !isLoading && (!propertyData || error);

    return (
        <>
            <SEO
                title={propertyData?.title
                    ? [bhkLabel, propertyTypeLabel, listingLabel, 'in', locationLabel, `| ₹${priceValue}`, '| 360Ghar']
                        .filter(Boolean)
                        .join(' ')
                    : 'Property Details | 360Ghar - Best Real Estate Platform'
                }
                description={propertyData?.description
                    ? `${propertyData.description.slice(0, 160)} Verified by on-site team with 360° virtual tour in ${locationLabel}. ${listingLabel || 'Browse'} directly from owner.`
                    : siteMetadata.defaultDescription
                }
                image={mainImage}
                type="product"
                structuredData={generatePropertyStructured()}
                noindex={isNotFound}
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
                    btnText="Post Property"
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />


                {/* Loading, Error, or Property Details Section */}
                {isLoading ? (
                    <section className="padding-y-60">
                        <div className="container container-two">
                            <div className="row g-4">
                                {/* Left column */}
                                <div className="col-lg-8">
                                    <div className="property-skeleton__image" />
                                    <div className="property-skeleton__card">
                                        <div className="property-skeleton__block property-skeleton__title" />
                                        <div className="property-skeleton__block property-skeleton__subtitle" />
                                        <div className="d-flex flex-wrap mb-3">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="property-skeleton__block property-skeleton__badge" />
                                            ))}
                                        </div>
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className={`property-skeleton__block property-skeleton__line${i % 3 === 0 ? ' property-skeleton__line--short' : ''}`} />
                                        ))}
                                    </div>
                                    <div className="property-skeleton__card">
                                        <div className="property-skeleton__block property-skeleton__line property-skeleton__line--xshort mb-3" />
                                        {[1,2,3].map(i => (
                                            <div key={i} className="property-skeleton__block property-skeleton__line" />
                                        ))}
                                    </div>
                                </div>
                                {/* Right column */}
                                <div className="col-lg-4">
                                    <div className="property-skeleton__card">
                                        <div className="property-skeleton__block property-skeleton__line property-skeleton__line--short mb-3" />
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="property-skeleton__block property-skeleton__line" />
                                        ))}
                                    </div>
                                    <div className="property-skeleton__card">
                                        <div className="property-skeleton__block property-skeleton__line property-skeleton__line--xshort mb-3" />
                                        {[1,2,3].map(i => (
                                            <div key={i} className="property-skeleton__block property-skeleton__line" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : error ? (
                    <section className="property-details compact padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
                                <h4 className="mt-3 text-danger">{t('details.errorTitle')}</h4>
                                <p>{error}</p>
                            </div>
                        </div>
                    </section>
                ) : !propertyData ? (
                    <section className="property-details compact padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-home fa-2x text-muted"></i>
                                <h4 className="mt-3">{t('details.notFoundTitle')}</h4>
                                <p>{t('details.notFoundDescription')}</p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <>
                        <PropertyDetailsSection property={propertyData} />

                        {/* Data Hub panels */}
                        <section className="padding-y-40">
                            <div className="container container-two">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {propertyData.rera_number && (
                                        <div>
                                            <ReraVerifiedBadge reraNumber={propertyData.rera_number} />
                                        </div>
                                    )}
                                    <CircleRateBanner sector={propertyData.locality || propertyData.sector} />
                                    <ZoneInfoCard sector={propertyData.locality || propertyData.sector} />
                                    <NeighbourhoodScorePanel listingId={propertyData.id} />
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* Cta */}
                <Cta ctaClass="" />

                {/* Footer */}
                <Footer />

            </main>
        </>
    );
};

export default PropertyDetails;

import { useEffect } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import Cta from '../../components/ui/Cta';
import PropertyDetailsSection from '../../components/property/PropertyDetailsSection';
import { useParams } from 'react-router-dom';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import usePropertyStore from '../../store/propertyStore';
import {
    getAccommodationSchemaType,
    getListingLabel,
    getListingSchemaType,
    getPropertyTypeLabel,
} from '../../utils/propertyTaxonomy';

const PropertyDetails = () => {
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

        return [
            basePropertySchema,
            listingSchema,
            generateBreadcrumbStructuredData(breadcrumbData)
        ];
    };

    const mainImage = (Array.isArray(propertyData?.images) && propertyData.images[0]?.image_url) || siteMetadata.defaultOgImage;

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
                    <section className="property-details compact padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                                <p className="mt-3">Loading property details...</p>
                            </div>
                        </div>
                    </section>
                ) : error ? (
                    <section className="property-details compact padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
                                <h4 className="mt-3 text-danger">Error Loading Property</h4>
                                <p>{error}</p>
                            </div>
                        </div>
                    </section>
                ) : !propertyData ? (
                    <section className="property-details compact padding-y-60">
                        <div className="container container-two">
                            <div className="text-center py-5">
                                <i className="fas fa-home fa-2x text-muted"></i>
                                <h4 className="mt-3">Property Not Found</h4>
                                <p>The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <PropertyDetailsSection property={propertyData} />
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

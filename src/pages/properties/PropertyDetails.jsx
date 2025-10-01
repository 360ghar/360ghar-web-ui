import React, { useEffect } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import Cta from '../../components/Cta';
import PropertyDetailsSection from '../../components/PropertyDetailsSection';
import { useParams } from 'react-router-dom';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata, absoluteUrl } from '../../seo/siteMetadata';
import usePropertyStore from '../../store/propertyStore';

const PropertyDetails = () => {
    const { id } = useParams();
    const { 
        currentProperty, 
        isLoading, 
        error, 
        fetchPropertyById,
        clearCurrentProperty 
    } = usePropertyStore();

    useEffect(() => {
        if (id) {
            fetchPropertyById(id);
        }
        
        // Cleanup when component unmounts
        return () => {
            clearCurrentProperty();
        };
    }, [id, fetchPropertyById, clearCurrentProperty]); 
    
    return (
        <>
        <SEO
          title={currentProperty?.title ? `${currentProperty.title} | 360Ghar Property` : 'Property Details | 360Ghar'}
          description={
            currentProperty?.description ||
            'View detailed property information, amenities, price, and immersive 360° visuals on 360Ghar.'
          }
          keywords="property details, real estate, Gurgaon, rent, buy, virtual tour"
          canonical={currentProperty?.id ? `/property/${currentProperty.id}` : undefined}
          image={
            (Array.isArray(currentProperty?.images) && currentProperty.images[0]?.image_url) ||
            siteMetadata.defaultOgImage
          }
          type="product"
          structuredData={currentProperty ? {
            '@type': 'RealEstateListing',
            name: currentProperty.title,
            description: currentProperty.description,
            url: absoluteUrl(`/property/${currentProperty.id}`),
            image: (Array.isArray(currentProperty.images) ? currentProperty.images.map((i) => i.image_url) : []).filter(Boolean),
            address: {
              '@type': 'PostalAddress',
              streetAddress: currentProperty.full_address || undefined,
              addressLocality: currentProperty.city || undefined,
              addressRegion: currentProperty.state || undefined,
              addressCountry: 'IN',
            },
            offers: {
              '@type': 'Offer',
              price: String(
                currentProperty.purpose === 'rent'
                  ? (currentProperty.monthly_rent || currentProperty.daily_rate || currentProperty.base_price || '')
                  : (currentProperty.base_price || '')
              ),
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
            },
            floorSize: currentProperty.area_sqft ? {
              '@type': 'QuantitativeValue',
              value: String(currentProperty.area_sqft),
              unitText: 'SQFT',
            } : undefined,
          } : undefined}
        />
        <PageTitle title="360Ghar - Property Details" />

        <main className="body-bg">
            <OffCanvas/>
            <MobileMenu/>

            {/* Header */}
            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/add-new-listing"
                btnText="Add Listing"
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />

            
            {/* Loading, Error, or Property Details Section */}
            {isLoading ? (
                <section className="property-details padding-y-120">
                    <div className="container container-two">
                        <div className="text-center py-5">
                            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                            <p className="mt-3">Loading property details...</p>
                        </div>
                    </div>
                </section>
            ) : error ? (
                <section className="property-details padding-y-120">
                    <div className="container container-two">
                        <div className="text-center py-5">
                            <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
                            <h4 className="mt-3 text-danger">Error Loading Property</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                </section>
            ) : !currentProperty ? (
                <section className="property-details padding-y-120">
                    <div className="container container-two">
                        <div className="text-center py-5">
                            <i className="fas fa-home fa-2x text-muted"></i>
                            <h4 className="mt-3">Property Not Found</h4>
                            <p>The property you're looking for doesn't exist or has been removed.</p>
                        </div>
                    </div>
                </section>
            ) : (
                <PropertyDetailsSection property={currentProperty} />
            )}

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>
        </>
    );
};

export default PropertyDetails;

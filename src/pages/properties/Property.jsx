import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import PropertyPageSection from '../../components/property/PropertyPageSection';
import Cta from '../../components/ui/Cta';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { realEstateStructuredData, generateBreadcrumbStructuredData } from '../../seo/structuredData';

const Property = () => {
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
          title="Properties in Gurugram | Buy, Sell, Rent Real Estate | 360Ghar"
          description="Browse verified properties in Gurugram with 360° virtual tours. Find apartments, flats, builder floors, independent houses, and PGs in prime locations like DLF Phase, Golf Course Road, Sohna Road, Cyber City."
          keywords="Gurugram properties, Gurgaon real estate, buy property Gurugram, sell property Gurgaon, rent apartments Gurugram, flats for sale in Gurgaon, flats for rent in Gurgaon, 1 BHK 2 BHK 3 BHK, ready to move flats, new launch projects, resale apartments, PG in Gurgaon, girls PG, co-living Gurugram, DLF Phase properties, Golf Course Road apartments, Sohna Road flats, Cyber City office space, near metro apartments, no broker, direct owner, verified listings, 360 virtual tours"
          canonical="/properties"
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={propertyStructuredData}
        />
        <PageTitle title="360Ghar - Property" />

        <main className="body-bg">
            
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

          
            {/* Property Page Section */}
            <PropertyPageSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default Property;

import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import PropertyPageSection from '../../components/PropertyPageSection';
import Cta from '../../components/Cta';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';

const Property = () => {
    return (
        <>
        <SEO
          title="Properties | 360Ghar — Browse Real Estate Listings"
          description="Explore curated properties with immersive 360° virtual tours. Filter by price, type, bedrooms, and more across Gurugram and beyond."
          keywords="property listings, real estate, virtual tours, Gurgaon, apartments for sale, rent"
          canonical="/properties"
          image={siteMetadata.defaultOgImage}
          type="website"
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

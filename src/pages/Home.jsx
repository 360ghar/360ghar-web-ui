import React from 'react';

import Header from '../common/Header';
import Footer from '../common/Footer';
import MobileMenu from '../common/MobileMenu';
import OffCanvas from '../common/OffCanvas';
import BannerThree from '../components/ui/BannerThree';
import AboutThree from '../components/layout/AboutThree';
import PropertyType from '../components/ui/PropertyType';
import PropertyTwo from '../components/property/PropertyTwo';
import MessageThree from '../components/layout/MessageThree';
import Newsletter from '../components/ui/Newsletter';
import TestimonialThree from '../components/ui/TestimonialThree';
import CounterThree from '../components/ui/CounterThree';
import Faq from '../components/layout/Faq';
import BlogThree from '../components/blog/BlogThree';
import PageTitle from '../common/PageTitle';
import SEO from '../common/SEO';
import { realEstateStructuredData } from '../seo/structuredData';
import { siteMetadata } from '../seo/siteMetadata';

const Home = () => {
    // Combine structured data for the homepage
    const homeStructuredData = [
        realEstateStructuredData.organization,
        realEstateStructuredData.realEstateAgency,
        realEstateStructuredData.website,
        realEstateStructuredData.searchAction,
        realEstateStructuredData.localBusiness,
        realEstateStructuredData.realEstateListing,
        realEstateStructuredData.faq,
        realEstateStructuredData.knowledgePanel
    ];

    return (
        <>
        <SEO
          title={siteMetadata.defaultTitle}
          description={siteMetadata.defaultDescription}
          keywords={siteMetadata.defaultKeywords}
          canonical="/"
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={homeStructuredData}
        />
        <PageTitle title="360Ghar - Best Real Estate Platform in Gurugram" />
            <OffCanvas/>
            <MobileMenu/>
            
            <main className="body-bg">

                {/* Header */}
                <Header />

                {/* Banner Three */}
                <BannerThree/>

                {/* About Three */}
                <AboutThree/>

                {/* Property Type */}
                <PropertyType/>

                {/* Property Two */}
                <PropertyTwo/>
                
                {/* Message Three */}
                <MessageThree/>


                {/* Newsletter */}
                <Newsletter/>

                {/* Testimonial Three */}
                <TestimonialThree/>

                {/* Counter Three */}
                <CounterThree/>

                {/* Faq */}
                <Faq/>

                {/* Blog Three */}
                <BlogThree/>

                {/* Footer */}
                <Footer/>
                
            </main>   
        </>
    );
};

export default Home;
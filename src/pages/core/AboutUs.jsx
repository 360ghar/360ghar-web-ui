import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import AboutThree from '../../components/AboutThree';
import PropertyTypeThree from '../../components/PropertyTypeThree';
import AreasWeCover from '../../components/AreasWeCover';
import OwnerCta from '../../components/OwnerCta';
import Team from '../../components/Team';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';

const AboutUs = () => {
    return (
        <>
            <SEO 
                title="About 360Ghar | Verified 360° Real Estate Tours in Gurugram"
                description="Learn about 360Ghar—Gurugram’s immersive real estate platform offering verified 360° property tours, expert guidance, and seamless, no‑upfront‑fee owner onboarding. Based in Gurugram, Haryana."
                keywords="about 360Ghar, real estate platform, virtual tours, Gurgaon, Gurugram"
                canonical="/about-us"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={{
                    '@type': 'AboutPage',
                    name: 'About 360Ghar',
                    url: `${siteMetadata.siteUrl}/about-us`,
                    description: 'About 360Ghar virtual real estate tours and services',
                    isPartOf: { '@type': 'WebSite', name: siteMetadata.siteName, url: siteMetadata.siteUrl },
                }}
            />
            <PageTitle title="360Ghar - About Us" />
            {/* Header */}
            <Header
                headerClass="dark-header has-border"
                logoBlack={false}
                logoWhite={true}
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />

      
            <AboutThree/>    

            <Team/>

            <PropertyTypeThree/> 

            <AreasWeCover/>

            <OwnerCta className="padding-y-60"/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>
        </>
    );
};

export default AboutUs;

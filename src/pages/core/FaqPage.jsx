import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import FaqTwo from '../../components/FaqTwo';
import FaqContactUs from '../../components/FaqContactUs';
import CounterFour from '../../components/CounterFour';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { faqs } from '../../data/HomeThreeData/HomeThreeData';

const FaqPage = () => {
    return (
        <>
            <SEO
                title="360Ghar FAQ | Virtual Tours, Buying & Renting"
                description="Answers to common questions about 360Ghar's verified 360° tours, owner onboarding (no upfront fee), and renting/buying in Gurugram."
                keywords="360Ghar FAQ, virtual tours FAQ, property FAQ, Gurugram, Gurgaon"
                canonical="/faq"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={{
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.btnText,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: f.bodyText,
                    },
                  })),
                }}
            />
            <PageTitle title="360Ghar - Frequently Ask Question" />

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

        
            {/* Faq Two */}
            <FaqTwo/>

            {/* Faq Contact Us */}
            <FaqContactUs/>

            {/* Counter Four */}
            <CounterFour/>
            
            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>
        </>
    );
};

export default FaqPage;

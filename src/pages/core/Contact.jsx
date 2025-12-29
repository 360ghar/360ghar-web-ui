import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import Cta from '../../components/ui/Cta';
import ContactTop from '../../components/contact/ContactTop';
import ContactUsSection from '../../components/contact/ContactUsSection';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata, absoluteUrl } from '../../seo/siteMetadata';

const Contact = () => {
    return (
        <>
        <SEO
          title="Contact 360Ghar | Dedicated Relationship Manager Support | AI Real Estate Platform"
          description="Get in touch with 360Ghar, India's first AI-enabled real estate platform. Contact for dedicated Relationship Manager support, verified property listings, 360° virtual tours, and end-to-end property services in Gurugram and Delhi NCR."
          keywords="contact 360Ghar, relationship manager, real estate contact, Gurgaon, Gurugram, virtual tours, verified properties, AI real estate platform"
          canonical="/contact"
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={{
            '@type': 'RealEstateAgent',
            name: siteMetadata.organization.name,
            url: `${siteMetadata.siteUrl}/contact`,
            logo: absoluteUrl(siteMetadata.defaultOgImage),
            email: siteMetadata.organization.email,
            telephone: siteMetadata.organization.telephone,
            address: {
              '@type': 'PostalAddress',
              streetAddress: siteMetadata.organization.address.streetAddress,
              addressLocality: siteMetadata.organization.address.addressLocality,
              addressRegion: siteMetadata.organization.address.addressRegion,
              postalCode: siteMetadata.organization.address.postalCode,
              addressCountry: siteMetadata.organization.address.addressCountry,
            },
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              telephone: siteMetadata.organization.telephone,
              email: siteMetadata.organization.email,
              areaServed: 'IN',
              availableLanguage: ['en', 'hi'],
            },
          }}
        />
        <PageTitle title="360Ghar - Dedicated Relationship Manager Support" />

        <OffCanvas />
        <MobileMenu />

        <main className="body-bg">
            
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

      
            {/* Contact Top */}
            <ContactTop/>

            <div className="contact-map address-map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224356.8202113498!2d76.9302921759173!3d28.423957136112284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d19d582e38859%3A0x2cf5fe8e5c64b1e!2sGurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1653544138149!5m2!1sen!2sin" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>

            {/* Contact Us Section */}
            <ContactUsSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default Contact;

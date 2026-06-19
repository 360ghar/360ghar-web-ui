import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import ContactTop from '../../components/contact/ContactTop';
import ContactUsSection from '../../components/contact/ContactUsSection';
import SEO from '../../common/SEO';
import { siteMetadata, absoluteUrl } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

const Contact = () => {
  const { t } = useTranslation('policies');
  const [tSeo] = useTranslation('seo');

  return (
    <>
      <SEO
        title={t('contact.title')}
        description={tSeo('contact.description')}
        keywords="contact 360Ghar, relationship manager, real estate contact, Gurgaon, Gurugram, virtual tours, verified properties, AI real estate platform"
        canonical="/contact"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={[
          {
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
          },
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Contact', url: 'https://360ghar.com/contact' }
          ]),
          {
            '@context': 'https://schema.org',
            '@type': ['LocalBusiness', 'RealEstateAgent'],
            '@id': 'https://360ghar.com/#localbusiness',
            name: '360Ghar',
            image: ['https://360ghar.com/logo.png', 'https://360ghar.com/office.jpg'],
            url: 'https://360ghar.com',
            telephone: siteMetadata.organization.telephone,
            priceRange: '₹₹',
            currenciesAccepted: 'INR',
            paymentAccepted: 'Cash, Credit Card, Bank Transfer',
            address: {
              '@type': 'PostalAddress',
              streetAddress: siteMetadata.organization.address.streetAddress,
              addressLocality: 'Gurgaon',
              addressRegion: 'Haryana',
              postalCode: '122001',
              addressCountry: 'IN'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 28.4595,
              longitude: 77.0266
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '21:00'
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Saturday', 'Sunday'],
                opens: '10:00',
                closes: '20:00'
              }
            ],
            // CRITICAL FIX (audit 4.3): removed fabricated aggregateRating.
            // Restore only with a real, verified review source to avoid a
            // Google manual penalty.
            hasMap: 'https://maps.google.com/?q=360Ghar+Gurgaon',
            areaServed: 'Gurgaon, Haryana, India'
          }
        ]}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">

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


        {/* Contact Top */}
        <ContactTop />

        <div className="contact-map address-map">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224356.8202113498!2d76.9302921759173!3d28.423957136112284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d19d582e38859%3A0x2cf5fe8e5c64b1e!2sGurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1653544138149!5m2!1sen!2sin" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>

        {/* Contact Us Section */}
        <ContactUsSection />

        {/* Cta */}
        <Cta ctaClass="" />

        {/* Footer */}
        <Footer />

      </main>
    </>
  );
};

export default Contact;

import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import Cta from '../../components/ui/Cta';
import AboutThree from '../../components/layout/AboutThree';
import PropertyTypeThree from '../../components/ui/PropertyTypeThree';
import AreasWeCover from '../../components/layout/AreasWeCover';
import OwnerCta from '../../components/ui/OwnerCta';
import Team from '../../components/ui/Team';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

const AboutUs = () => {
    // Enhanced structured data for About page
    const aboutStructuredData = [
        {
            '@type': 'AboutPage',
            name: 'About 360Ghar - Gurugram Real Estate Platform',
            url: `${siteMetadata.siteUrl}/about-us`,
            description: 'Learn about 360Ghar, Gurugram premier real estate platform offering verified properties with 360° virtual tours',
            isPartOf: { '@type': 'WebSite', name: siteMetadata.siteName, url: siteMetadata.siteUrl },
        },
        generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'About Us', url: 'https://360ghar.com/about-us' }
        ])
    ];

    return (
        <>
            <SEO
                title="About 360Ghar | India's #1 VR-First Real Estate Platform"
                description="Discover how 360Ghar is transforming real estate with 360° virtual tours, zero brokerage, and on-site verified listings in Gurgaon."
                keywords="about 360Ghar, India first AI enabled real estate platform, virtual tour first real estate, Gurugram real estate platform, property portal Gurgaon, virtual tours, on-site verified properties, relationship manager real estate, transparent brokerage, DLF Phase properties, Golf Course Road real estate, verified property listings"
                canonical="/about-us"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={aboutStructuredData}
            />
            <PageTitle title="About 360Ghar - India's First AI-Enabled Real Estate Platform" />

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

                <AboutThree />

                <Team />

                <PropertyTypeThree />

                <AreasWeCover />

                <OwnerCta className="padding-y-60" />

                {/* Cta */}
                <Cta ctaClass="" />

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
};

export default AboutUs;

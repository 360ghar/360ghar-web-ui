import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import AboutThree from '../../components/layout/AboutThree';
import PropertyTypeThree from '../../components/ui/PropertyTypeThree';
import AreasWeCover from '../../components/layout/AreasWeCover';
import OwnerCta from '../../components/ui/OwnerCta';
import Team from '../../components/ui/Team';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData, generatePersonStructuredData, realEstateStructuredData } from '../../seo/structuredData';

const AboutUs = () => {
    const { t } = useTranslation('policies');
    const [tSeo] = useTranslation('seo');
    const aboutStructuredData = [
        realEstateStructuredData.organization,
        {
            '@type': 'AboutPage',
            name: 'About 360Ghar - Gurugram Real Estate Platform',
            url: `${siteMetadata.siteUrl}/about-us`,
            description: 'Learn about 360Ghar, Gurugram premier real estate platform offering verified properties with 360° virtual tours',
            isPartOf: { '@type': 'WebSite', name: siteMetadata.siteName, url: siteMetadata.siteUrl },
            mainEntity: {
                '@type': 'Organization',
                '@id': 'https://360ghar.com/#organization',
                name: '360Ghar',
                url: 'https://360ghar.com',
            },
        },
        generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'About Us', url: 'https://360ghar.com/about-us' }
        ]),
        generatePersonStructuredData({
            name: 'Saksham Mittal',
            jobTitle: 'Founder & CEO',
            image: 'https://360ghar.com/assets/images/thumbs/team1.webp',
            bio: 'Saksham Mittal is the founder of 360Ghar, India\'s first AI + VR-first real estate platform. With deep expertise in PropTech and the Gurugram real estate market, he leads product strategy and technology innovation.',
            linkedin: 'https://www.linkedin.com/in/saksham360/',
            twitter: 'https://twitter.com/360ghar',
            expertise: ['Real Estate Technology', 'AI/ML', 'Product Strategy', 'Gurugram Real Estate Market'],
        }),
        generatePersonStructuredData({
            name: 'Priya Singh',
            jobTitle: 'Manager of Sales',
            image: 'https://360ghar.com/assets/images/thumbs/team2.webp',
            bio: 'Real estate sales leader at 360Ghar with expertise in verified property transactions across Gurugram.',
            linkedin: 'https://www.linkedin.com/company/360ghar',
            expertise: ['Property Sales', 'Client Relations', 'Gurugram Properties'],
        }),
        generatePersonStructuredData({
            name: 'Vikram Malhotra',
            jobTitle: 'Director of Sales',
            image: 'https://360ghar.com/assets/images/thumbs/team3.webp',
            bio: 'Sales director at 360Ghar leading the relationship manager team for seamless property buying and renting experiences in Delhi NCR.',
            linkedin: 'https://www.linkedin.com/company/360ghar',
            expertise: ['Sales Strategy', 'Real Estate Operations', 'Team Leadership'],
        }),
    ];

    return (
        <>
            <SEO
                title={tSeo('about.title')}
                description={tSeo('about.description')}
                keywords="about 360Ghar, India first AI enabled real estate platform, virtual tour first real estate, Gurugram real estate platform, property portal Gurgaon, virtual tours, on-site verified properties, relationship manager real estate, transparent brokerage, DLF Phase properties, Golf Course Road real estate, verified property listings"
                canonical="/about-us"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={aboutStructuredData}
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

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
import AppDownload from '../components/ui/AppDownload';
import TestimonialThree from '../components/ui/TestimonialThree';
import CounterThree from '../components/ui/CounterThree';
import Faq from '../components/layout/Faq';
import BlogThree from '../components/blog/BlogThree';
import ToolShowcase from '../components/ui/ToolShowcase';
import AIAgentShowcase from '../components/ui/AIAgentShowcase';
import PropertyManagementShowcase from '../components/ui/PropertyManagementShowcase';
import ReferEarnCta from '../components/ui/ReferEarnCta';
import SEO from '../common/SEO';
import { realEstateStructuredData, generateBreadcrumbStructuredData } from '../seo/structuredData';
import { siteMetadata } from '../seo/siteMetadata';

const FAQ_DATA = {
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'What is 360Ghar?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: '360Ghar is India\'s first AI and VR-first real estate platform. We convert every property listing into a studio-quality 360° virtual walkthrough, allowing buyers to explore properties remotely before scheduling a physical visit. We verify all properties to connect buyers and tenants directly to owners.'
            }
        },
        {
            '@type': 'Question',
            name: 'Is listing property on 360Ghar really free?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! Listing your property on 360Ghar is absolutely free. Our team will visit the property to verify it, arrange for professional photography, and create the 360° VR tour at zero cost to the owner.'
            }
        },
        {
            '@type': 'Question',
            name: 'How does 360Ghar verify properties?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Our dedicated on-ground team physically visits every single property listed on our platform. We verify the actual condition, create the VR tour on the spot, and check ownership documents to ensure zero fake listings.'
            }
        },
        {
            '@type': 'Question',
            name: 'What is a 360° virtual property tour?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'A 360° virtual tour is an immersive walkthrough that allows you to explore the property digitally from your phone or laptop. You can look up, down, and entirely around every room, giving you a perfect sense of the space without visiting in person.'
            }
        },
        {
            '@type': 'Question',
            name: 'Does 360Ghar charge any upfront fees?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: '360Ghar charges no upfront fees to property owners to list their property. We connect direct buyers and tenants directly to property owners to ensure maximum transparency.'
            }
        },
        {
            '@type': 'Question',
            name: 'Which areas in Gurugram does 360Ghar cover?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'We heavily cover major Gurugram areas including Golf Course Road, Sohna Road, Dwarka Expressway, all DLF Phases, New Gurugram (Sectors 80-115), and expanding regions across Delhi NCR.'
            }
        },
        {
            '@type': 'Question',
            name: 'Can I buy a flat in Gurugram without visiting physically?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Our 360° virtual tours give you a completely transparent view of the property. While we always encourage a physical visit before final transaction, many of our users are able to confidently shortlist and begin the buying process entirely based on our immersive tours.'
            }
        },
        {
            '@type': 'Question',
            name: 'What is a Relationship Manager on 360Ghar?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Every buyer, tenant, and owner on 360Ghar is assigned a dedicated Relationship Manager who handles your query end-to-end. They will help you find matched properties, assist in scheduling visits, and support your documentation.'
            }
        },
        {
            '@type': 'Question',
            name: 'How does AI property matching work on 360Ghar?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Our platform uses AI to learn your specific preferences, from location to budget and amenities, to surface the freshest and most highly matched properties directly to your feed.'
            }
        },
        {
            '@type': 'Question',
            name: 'Are properties on 360Ghar RERA approved?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, we verify the RERA registration details for all new and under-construction properties heavily featured on our platform to ensure compliance with real estate guidelines.'
            }
        }
    ]
};

const Home = () => {
    // Combine structured data for the homepage
    const homeStructuredData = [
        realEstateStructuredData.website,
        realEstateStructuredData.localBusiness,
        FAQ_DATA,
        generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' }
        ])
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
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">

                {/* Header */}
                <Header />

                {/* Banner Three */}
                <BannerThree />

                {/* About Three */}
                <AboutThree />

                {/* Refer & Earn CTA */}
                <ReferEarnCta />

                {/* Property Type */}
                <PropertyType />

                {/* Property Two */}
                <PropertyTwo />

                {/* Message Three */}
                <MessageThree />

                {/* Property Management Showcase */}
                <PropertyManagementShowcase />

                {/* Newsletter */}
                <Newsletter />
                {/* App Download */}
                <AppDownload />

                {/* Testimonial Three */}
                <TestimonialThree />

                {/* Counter Three */}
                <CounterThree />

                {/* AI Agent Showcase */}
                <AIAgentShowcase />

                {/* Tool Showcase */}
                <ToolShowcase />

                {/* Faq */}
                <Faq />

                {/* Blog Three */}
                <BlogThree />

                {/* Footer */}
                <Footer />

            </main>
        </>
    );
};

export default Home;
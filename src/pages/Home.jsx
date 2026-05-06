import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../i18n/I18nLink';
import Header from '../common/layout/Header';
import MobileMenu from '../common/layout/MobileMenu';
import OffCanvas from '../common/layout/OffCanvas';
import BannerThree from '../components/ui/BannerThree';
import AboutThree from '../components/layout/AboutThree';
import SEO from '../common/SEO';
import LazySection from '../common/LazySection';
import SectionLoader from '../common/SectionLoader';
import { realEstateStructuredData, generateBreadcrumbStructuredData } from '../seo/structuredData';
import { siteMetadata } from '../seo/siteMetadata';

// Below-fold components — lazy-loaded only when approaching viewport
const ReferEarnCta = lazy(() => import('../components/ui/ReferEarnCta'));
const PropertyType = lazy(() => import('../components/ui/PropertyType'));
const PropertyTwo = lazy(() => import('../components/property/PropertyTwo'));
const MessageThree = lazy(() => import('../components/layout/MessageThree'));
const PropertyManagementShowcase = lazy(() => import('../components/ui/PropertyManagementShowcase'));
const Newsletter = lazy(() => import('../components/ui/Newsletter'));
const AppDownload = lazy(() => import('../components/ui/AppDownload'));
const TestimonialThree = lazy(() => import('../components/ui/TestimonialThree'));
const CounterThree = lazy(() => import('../components/ui/CounterThree'));
const AIAgentShowcase = lazy(() => import('../components/ui/AIAgentShowcase'));
const ToolShowcase = lazy(() => import('../components/ui/ToolShowcase'));
const Faq = lazy(() => import('../components/layout/Faq'));
const BlogFeed = lazy(() => import('../components/blog/BlogFeed'));
const AiFactSheet = lazy(() => import('../components/seo/AiFactSheet'));
const ReviewDisplay = lazy(() => import('../components/reviews/ReviewDisplay'));
const ReviewCapture = lazy(() => import('../components/reviews/ReviewCapture'));
const Footer = lazy(() => import('../common/layout/Footer'));

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
    const { t } = useTranslation('home');
    const [tSeo] = useTranslation('seo');
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
                title={tSeo('home.title')}
                description={tSeo('home.description')}
                keywords={siteMetadata.defaultKeywords}
                canonical="/"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={homeStructuredData}
            />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">

                {/* Above-fold — eagerly loaded */}
                <Header />
                <BannerThree />
                <div className="speakable-summary" style={{ display: 'none' }} aria-hidden="true">
                    360Ghar is India&apos;s first AI and VR-first real estate platform. We convert every property listing into a studio-quality 360 degree virtual walkthrough, allowing buyers to explore properties remotely before scheduling a physical visit. We verify all properties to connect buyers and tenants directly to owners. Zero upfront fees. No fake listings. AI-powered search across Gurugram and Delhi NCR.
                </div>
                <AboutThree />

                {/* Below-fold — lazy-loaded as user scrolls */}
                <LazySection minHeight="200px">
                    <Suspense fallback={<SectionLoader height="200px" type="cta" />}>
                        <ReferEarnCta />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="300px">
                    <Suspense fallback={<SectionLoader height="300px" />}>
                        <PropertyType />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="400px">
                    <Suspense fallback={<SectionLoader height="400px" type="card" />}>
                        <PropertyTwo />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="200px">
                    <Suspense fallback={<SectionLoader height="200px" />}>
                        <MessageThree />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="300px">
                    <Suspense fallback={<SectionLoader height="300px" />}>
                        <PropertyManagementShowcase />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="200px">
                    <Suspense fallback={<SectionLoader height="200px" />}>
                        <Newsletter />
                        <AppDownload />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="300px">
                    <Suspense fallback={<SectionLoader height="300px" type="card" />}>
                        <TestimonialThree />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="200px">
                    <Suspense fallback={<SectionLoader height="200px" type="stats" />}>
                        <CounterThree />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="300px">
                    <Suspense fallback={<SectionLoader height="300px" />}>
                        <AIAgentShowcase />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="300px">
                    <Suspense fallback={<SectionLoader height="300px" />}>
                        <ToolShowcase />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="300px">
                    <Suspense fallback={<SectionLoader height="300px" type="list" />}>
                        <Faq />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="400px">
                    <Suspense fallback={<SectionLoader height="400px" type="card" />}>
                        <BlogFeed />
                    </Suspense>
                </LazySection>

                {/* Explore 360Ghar — internal linking hub */}
                <LazySection minHeight="300px">
                    <section className="padding-y-60 bg-white">
                        <div className="container container-two">
                            <div className="section-heading text-center mb-4">
                                <h2 className="section-heading__title">{t('explore.title')}</h2>
                                <p className="section-heading__desc">{t('explore.desc')}</p>
                            </div>
                            <div className="row g-3">
                                {[
                                    { to: '/localities', label: t('explore.link1'), icon: 'fa-map-marker-alt' },
                                    { to: '/circle-rates', label: t('explore.link2'), icon: 'fa-indian-rupee-sign' },
                                    { to: '/bank-auctions', label: t('explore.link3'), icon: 'fa-gavel' },
                                    { to: '/emi-calculator', label: t('explore.link4'), icon: 'fa-calculator' },
                                    { to: '/area-converter', label: t('explore.link5'), icon: 'fa-ruler-combined' },
                                    { to: '/about-us', label: t('explore.link6'), icon: 'fa-building' },
                                    { to: '/faq', label: t('explore.link7'), icon: 'fa-question-circle' },
                                    { to: '/contact', label: t('explore.link8'), icon: 'fa-envelope' },
                                    { to: '/gurgaon/buy/flats', label: t('explore.link9'), icon: 'fa-home' },
                                    { to: '/gurgaon/rent/flats', label: t('explore.link10'), icon: 'fa-key' },
                                    { to: '/vs/nobroker', label: t('explore.link11'), icon: 'fa-exchange-alt' },
                                ].map((link) => (
                                    <div className="col-lg-3 col-md-4 col-sm-6" key={link.to}>
                                        <I18nLink
                                            to={link.to}
                                            className="d-flex align-items-center gap-3 p-3 rounded-3 border text-decoration-none h-100"
                                            style={{ transition: 'box-shadow 0.2s', color: 'inherit' }}
                                        >
                                            <i className={`fas ${link.icon} text-gradient`} style={{ fontSize: '1.25rem', width: '24px', textAlign: 'center' }} />
                                            <span className="fw-medium">{link.label}</span>
                                        </I18nLink>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </LazySection>

                <LazySection minHeight="200px">
                    <Suspense fallback={<SectionLoader height="200px" />}>
                        <AiFactSheet context="homepage" />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="300px">
                    <Suspense fallback={<SectionLoader height="300px" />}>
                        <ReviewDisplay
                            reviews={[
                                { rating: 5, text: 'Excellent VR tours helped me shortlist without visiting 10 properties. RM handled everything from visits to registration.', name: 'Rahul S.', role: 'Buyer' },
                                { rating: 5, text: 'Listed my flat for free. The team came, verified, and created the VR tour same day. Got genuine buyers within a week.', name: 'Priya M.', role: 'Seller' },
                                { rating: 4, text: 'Found a great 2 BHK near Sector 56 metro. The virtual tour matched the actual property exactly. Very transparent process.', name: 'Amit K.', role: 'Tenant' },
                            ]}
                            averageRating={4.7}
                            totalCount={128}
                        />
                    </Suspense>
                </LazySection>

                <LazySection minHeight="200px">
                    <Suspense fallback={<SectionLoader height="200px" />}>
                        <section className="padding-y-60">
                            <div className="container container-two">
                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        <ReviewCapture role="buyer" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Suspense>
                </LazySection>

                <LazySection minHeight="400px">
                    <Suspense fallback={<SectionLoader height="400px" />}>
                        <Footer />
                    </Suspense>
                </LazySection>

            </main>
        </>
    );
};

export default Home;

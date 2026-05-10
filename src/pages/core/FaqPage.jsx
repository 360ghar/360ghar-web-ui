import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import FaqTwo from '../../components/layout/FaqTwo';
import FaqContactUs from '../../components/layout/FaqContactUs';
import CounterFour from '../../components/ui/CounterFour';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { faqs } from '../../data/HomeThreeData';

const FaqPage = () => {
    const { t } = useTranslation('policies');
    const [tSeo] = useTranslation('seo');
    return (
        <>
            <SEO
                title={tSeo('faq.title')}
                description={tSeo('faq.description')}
                keywords="360Ghar FAQ, virtual tours FAQ, property FAQ, Gurugram, Gurgaon"
                canonical="/faq"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                  {
                    '@type': 'FAQPage',
                    mainEntity: faqs.map((f) => ({
                      '@type': 'Question',
                      name: f.btnText,
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: f.bodyText,
                      },
                    })),
                  },
                  generateBreadcrumbStructuredData([
                    { name: 'Home', url: 'https://360ghar.com/' },
                    { name: 'FAQ', url: 'https://360ghar.com/faq' }
                  ])
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
            </main>
        </>
    );
};

export default FaqPage;

import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import BlogDetailsSection from '../../components/blog/BlogDetailsSection';
import SEO from '../../common/SEO';
import ErrorBoundary from '../../common/ErrorBoundary';
const BlogDetails = () => {
    const { t } = useTranslation();
    return (
        <>
            <SEO title={t('blog:blogDetails.defaultSeoTitle', 'Real Estate Blog | 360Ghar')} description={t('blog:blogDetails.defaultSeoDesc', 'Read the latest real estate insights')} />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText={t('common:header.postProperty')}
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <ErrorBoundary>
                    <BlogDetailsSection />
                </ErrorBoundary>

                <Cta ctaClass="" />

                <Footer />
            </main>
        </>
    );
};

export default BlogDetails;

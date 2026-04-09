import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import BlogDetailsSection from '../../components/blog/BlogDetailsSection';
import { useTranslation } from 'react-i18next';

const BlogDetails = () => {
    return (
        <>
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText="Post Property"
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <BlogDetailsSection />

                <Cta ctaClass="" />

                <Footer />
            </main>
        </>
    );
};

export default BlogDetails;

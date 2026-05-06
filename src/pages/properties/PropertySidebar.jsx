import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import PropertySidebarSection from '../../components/property/PropertySidebarSection';
import SEO from '../../common/SEO';
import { useTranslation } from 'react-i18next';

const Property = () => {
    const { t } = useTranslation('properties');
    const [tSeo] = useTranslation('seo');

    return (
        <>
            <SEO
                title={tSeo('propertySidebar.title')}
                description={tSeo('propertySidebar.description')}
                canonical="/property-sidebar"
                noindex
            />
            <main className="body-bg">

                {/* Header */}
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/add-new-listing"
                    btnText={t('addListing.addListing')}
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />


                {/* Property Sidebar Section */}
                <PropertySidebarSection />

                {/* Cta */}
                <Cta ctaClass="" />

                {/* Footer */}
                <Footer />

            </main>

            <MobileMenu />
            <OffCanvas />
        </>
    );
};

export default Property;

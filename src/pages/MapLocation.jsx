import Header from '../common/layout/Header';
import Footer from '../common/layout/Footer';
import MobileMenu from '../common/layout/MobileMenu';
import OffCanvas from '../common/layout/OffCanvas';
import Cta from '../components/ui/Cta';
import MapLocationSection from '../components/layout/MapLocationSection';
import SEO from '../common/SEO';
import { useTranslation } from 'react-i18next';
import { siteMetadata } from '../seo/siteMetadata';

const MapLocation = () => {
    const { t } = useTranslation('properties');

    return (
        <>
        <SEO
            title={t('mapLocation.seoTitle')}
            description={t('mapLocation.seoDescription')}
            keywords={t('mapLocation.seoKeywords')}
            canonical="/map-location"
            noindex
            image={siteMetadata.defaultOgImage}
            type="website"
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


            {/* Map Location  */}
            <MapLocationSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>
        </>
    );
};

export default MapLocation;

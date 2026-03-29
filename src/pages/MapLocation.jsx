import Header from '../common/layout/Header';
import Footer from '../common/layout/Footer';
import MobileMenu from '../common/layout/MobileMenu';
import OffCanvas from '../common/layout/OffCanvas';
import Cta from '../components/ui/Cta';
import MapLocationSection from '../components/layout/MapLocationSection';
import SEO from '../common/SEO';
import { siteMetadata } from '../seo/siteMetadata';

const MapLocation = () => {
    return (
        <>
        <SEO
            title="Properties on Map | Find Real Estate Near You | 360Ghar"
            description="Explore properties on an interactive map. Find homes, apartments, and commercial spaces near you in Gurugram."
            keywords="map search, properties near me, real estate map, Gurugram properties map"
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
                btnText="Post Property"
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

import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/ui/Cta';
import PropertySidebarSection from '../../components/property/PropertySidebarSection';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';

const Property = () => {
    return (
        <>
            <SEO
                title="Properties with Filter Sidebar | 360Ghar"
                description="Filter and search verified properties in Gurugram on 360Ghar's property portal."
                canonical="/property-sidebar"
            />
            <PageTitle title="360Ghar - Property With Sidebar" />

            <main className="body-bg">

                {/* Header */}
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/add-new-listing"
                    btnText="Add Listing"
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
        </>
    );
};

export default Property;
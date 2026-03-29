import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import AddListingSection from '../../components/forms/AddListingSection';
import SEO from '../../common/SEO';

const AddListing = () => {
    return (
        <>
        <SEO title="Add Listing | 360Ghar" description="Add a new property listing." canonical="/add-new-listing" noindex />
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

          
            {/* Add Listing */}
            <AddListingSection/>

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>

        <MobileMenu />
        <OffCanvas />
        </>
    );
};

export default AddListing;

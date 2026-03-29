import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import AccountSection from '../../components/account/AccountSection';
import SEO from '../../common/SEO';
import PageLoader from '../../common/PageLoader';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store';

const Account = () => {
    const { isAuthenticated, isInitializing } = useAuthStore();

    if (isInitializing) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return (
            <>
            <SEO title="Account | 360Ghar" description="Manage your 360Ghar account." canonical="/account" noindex />
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

                <section className="padding-y-120">
                    <div className="container container-two">
                        <div className="contact-form bg-white text-center">
                            <div className="section-heading">
                                <span className="section-heading__subtitle bg-gray-100">
                                    <span className="text-gradient fw-semibold">Sign in required</span>
                                </span>
                                <h1 className="section-heading__title">Access your 360Ghar account</h1>
                                <p className="section-heading__desc">
                                    Sign in to view saved properties, manage your profile, and continue your property search.
                                </p>
                            </div>
                            <div className="d-flex justify-content-center gap-3 flex-wrap">
                                <Link to="/login" className="btn btn-main">Sign in</Link>
                                <Link to="/register" className="btn btn-outline-main">Create account</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <Cta ctaClass=""/>
                <Footer/>
            </main>
            </>
        );
    }

    return (
        <>
        <SEO title="Account | 360Ghar" description="Manage your 360Ghar account." canonical="/account" noindex />
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

  
            {/* Account Section */}
            <AccountSection/>    

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default Account;

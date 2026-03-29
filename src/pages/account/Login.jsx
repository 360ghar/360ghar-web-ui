import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import LoginRegister from '../../components/forms/LoginRegister';
import SEO from '../../common/SEO';

const Login = () => {
    return (
        <>
        <SEO title="Login | 360Ghar" description="User login page." canonical="/login" noindex />
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

    
            {/* Login Section */}
            <LoginRegister
                titleText="Sign in"
                firstNameCol="col-sm-6 col-xs-6" 
                showFirstName={false}
                lastNameCol="col-sm-6 col-xs-6" 
                showLastName={false}
                passwordCol="col-lg-12" 
                showConfirm={false}
                btnText="Login"
                showForgotRemember={true}
                showTermCondition={false}
                haveAccountText="Don't Have An Account? "
                haveAccountLinkText = "Register"
                haveAccountLink = "/register"
                isLogin={true}
            />
            
            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>   
        </>
    );
};

export default Login;

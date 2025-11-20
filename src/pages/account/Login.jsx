import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/ui/Cta';
import LoginRegister from '../../components/forms/LoginRegister';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';

const Login = () => {
    return (
        <>
        <SEO title="Login | 360Ghar" description="User login page." canonical="/login" noindex />
        <PageTitle title="360Ghar - Login" />

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
                haveAccountText = "Don't Have An Account? "
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

import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import LoginRegister from '../../components/forms/LoginRegister';
import SEO from '../../common/SEO';

const Login = () => {
    const { t } = useTranslation('account');

    return (
        <>
        <SEO title={t('login.title')} description={t('login.description')} canonical="/login" noindex />
        <OffCanvas />
        <MobileMenu />

        <main className="body-bg">

            {/* Header */}
            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/post-property"
                btnText={t('common.postProperty')}
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />


            {/* Login Section */}
            <LoginRegister
                titleText={t('login.heading')}
                firstNameCol="col-sm-6 col-xs-6"
                showFirstName={false}
                lastNameCol="col-sm-6 col-xs-6"
                showLastName={false}
                passwordCol="col-lg-12"
                showConfirm={false}
                btnText={t('login.btnText')}
                showForgotRemember={true}
                showTermCondition={false}
                haveAccountText={t('login.haveAccountText')}
                haveAccountLinkText={t('login.haveAccountLinkText')}
                haveAccountLink="/register"
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

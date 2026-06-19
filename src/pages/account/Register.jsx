import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import LoginRegister from '../../components/forms/LoginRegister';
import SEO from '../../common/SEO';

const Register = () => {
    const { t } = useTranslation('account');

    return (
        <>
        <SEO title={t('register.title')} description={t('register.description')} canonical="/register" noindex />
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


            {/* Register Section */}
            {/* AUDIT FIX (1.2): RegisterFlow ignores the legacy layout props
                (showFirstName, showLastName, firstNameCol, lastNameCol,
                passwordCol). Stop passing them so the migration is complete
                and the API surface matches the implementation. */}
            <LoginRegister
                titleText={t('register.heading')}
                showConfirm={true}
                btnText={t('register.btnText')}
                showForgotRemember={false}
                showTermCondition={true}
                haveAccountText={t('register.haveAccountText')}
                haveAccountLinkText={t('register.haveAccountLinkText')}
                haveAccountLink="/login"
            />

            {/* Cta */}
            <Cta ctaClass=""/>

            {/* Footer */}
            <Footer/>

        </main>
        </>
    );
};

export default Register;

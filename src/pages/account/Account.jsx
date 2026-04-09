import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import AccountSection from '../../components/account/AccountSection';
import SEO from '../../common/SEO';
import PageLoader from '../../common/PageLoader';
import { I18nLink } from '../../i18n/I18nLink';
import { useAuthStore } from '../../store';

const Account = () => {
    const { isAuthenticated, isInitializing } = useAuthStore();
    const { t } = useTranslation('account');

    if (isInitializing) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return (
            <>
            <SEO title={t('account.title')} description={t('account.description')} canonical="/account" noindex />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText={t('common.postProperty')}
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <section className="padding-y-120">
                    <div className="container container-two">
                        <div className="contact-form bg-white text-center">
                            <div className="section-heading">
                                <span className="section-heading__subtitle bg-gray-100">
                                    <span className="text-gradient fw-semibold">{t('account.signInRequired')}</span>
                                </span>
                                <h1 className="section-heading__title">{t('account.accessAccount')}</h1>
                                <p className="section-heading__desc">
                                    {t('account.signInDesc')}
                                </p>
                            </div>
                            <div className="d-flex justify-content-center gap-3 flex-wrap">
                                <I18nLink to="/login" className="btn btn-main">{t('account.signIn')}</I18nLink>
                                <I18nLink to="/register" className="btn btn-outline-main">{t('account.createAccount')}</I18nLink>
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
        <SEO title={t('account.title')} description={t('account.description')} canonical="/account" noindex />
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

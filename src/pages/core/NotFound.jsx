import { useTranslation } from 'react-i18next';
import Button from '../../common/ui/Button';
import SEO from '../../common/SEO';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

const NotFound = () => {
    const { t } = useTranslation('policies');
    const [tSeo] = useTranslation('seo');
    
    return (
        <>
            <SEO
                title={tSeo('notFound.title')}
                description={tSeo('notFound.description')}
                canonical={undefined}
                noindex={true}
                type="website"
            />

            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText={t('common:header.postProperty')}
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <section className="padding-y-120">
                    <div className="not-found text-center">
                        <div className="not-found__inner">
                            <span className="not-found__icon">
                                <i className="far fa-frown text-body"></i>
                            </span>
                            <h1 className="mt-4 mb-5">404 Page Not Found</h1>   
                            <Button 
                                btnLink="/" 
                                btnClass="btn-main" 
                                btnText="Back To Home" 
                                spanClass="icon-right" 
                                iconClass="" 
                            />
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
};

export default NotFound;

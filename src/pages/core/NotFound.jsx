import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../common/ui/Button';
import SEO from '../../common/SEO';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import { I18nLink } from '../../i18n/I18nLink';

const NotFound = () => {
    const { t } = useTranslation('policies');
    const [tSeo] = useTranslation('seo');
    const [tC] = useTranslation('common');
    const navigate = useNavigate();
    // AUDIT FIX (4.2): search bar so users can find what they need from the 404.
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/properties?q=${encodeURIComponent(query.trim())}&city=Gurgaon`);
        }
    };

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
                            {/* UX FIX (audit 4.2): richer 404 with search bar + helpful links. */}
                            <h1 className="mt-4 mb-3">404 Page Not Found</h1>
                            <p className="text-muted mb-4">
                                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                            </p>
                            <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
                                <Button
                                    btnLink="/"
                                    btnClass="btn-main"
                                    btnText="Back To Home"
                                    spanClass="icon-right"
                                    iconClass=""
                                />
                                <Button
                                    btnLink="/properties"
                                    btnClass="btn-outline-main"
                                    btnText="Browse Properties"
                                    spanClass="icon-right"
                                    iconClass=""
                                />
                            </div>
                            {/* AUDIT FIX (4.2): search bar */}
                            <div className="row justify-content-center mb-4">
                                <div className="col-lg-6">
                                    <p className="text-muted small mb-2">{tC('contentSeo.notFoundSearchHint')}</p>
                                    <form className="d-flex gap-2" onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={tC('contentSeo.notFoundSearchPlaceholder')}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            aria-label={tC('contentSeo.notFoundSearchPlaceholder')}
                                        />
                                        <button type="submit" className="btn btn-outline-main">
                                            <i className="fas fa-search me-1" />
                                            {tC('contentSeo.notFoundSearchBtn')}
                                        </button>
                                    </form>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-muted small mb-2">{tC('contentSeo.popularPages')}</p>
                                <div className="d-flex flex-wrap gap-3 justify-content-center">
                                    <I18nLink to="/properties" className="text-main text-decoration-none">Properties</I18nLink>
                                    <I18nLink to="/localities" className="text-main text-decoration-none">{tC('contentSeo.notFoundLocalities')}</I18nLink>
                                    <I18nLink to="/emi-calculator" className="text-main text-decoration-none">EMI Calculator</I18nLink>
                                    <I18nLink to="/vastu-checker" className="text-main text-decoration-none">Vastu Checker</I18nLink>
                                    <I18nLink to="/blog" className="text-main text-decoration-none">Blog</I18nLink>
                                    <I18nLink to="/about-us" className="text-main text-decoration-none">About Us</I18nLink>
                                    <I18nLink to="/contact" className="text-main text-decoration-none">Contact</I18nLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
};

export default NotFound;

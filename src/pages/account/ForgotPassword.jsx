import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';

const ForgotPassword = () => {
    const { t } = useTranslation(['account', 'forms']);
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const validationSchema = yup.object().shape({
        email: yup
            .string()
            .email(t('forms:email.invalidShort'))
            .required(t('forms:email.required')),
    });

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                await authService.sendPasswordResetEmail(values.email);
                setEmailSent(true);
                toast.success(t('forgotPassword.successMessage'));
            } catch (error) {
                toast.error(error.message || t('forgotPassword.errorMessage'));
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <>
            <SEO
                title={t('forgotPassword.title')}
                description={t('forgotPassword.description')}
                canonical="/forgot-password"
                noindex
            />
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

                <section className="login-section pt-120 pb-120">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-8">
                                <div className="login-wrapper" style={{
                                    background: '#fff',
                                    border: '1px solid var(--border-color-light)',
                                    borderRadius: '18px',
                                    padding: '40px',
                                    boxShadow: '0 12px 24px rgba(16, 24, 40, 0.04)',
                                }}>
                                    <div className="text-center mb-4">
                                        <h3 className="mb-2">{t('forgotPassword.heading')}</h3>
                                        <p className="text-muted">{t('forgotPassword.description')}</p>
                                    </div>

                                    {emailSent ? (
                                        <div className="text-center py-4">
                                            <div className="mb-3">
                                                <i className="fas fa-envelope-open-text" style={{ fontSize: '3rem', color: 'var(--main-color)' }}></i>
                                            </div>
                                            <h5 className="mb-2">{t('forgotPassword.emailSentTitle')}</h5>
                                            <p className="text-muted mb-4">{t('forgotPassword.emailSentDesc')}</p>
                                            <I18nLink to="/login" className="btn btn-main">
                                                {t('forgotPassword.backToLogin')}
                                            </I18nLink>
                                        </div>
                                    ) : (
                                        <form onSubmit={formik.handleSubmit}>
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <label className="form-label">{t('forms:email.label')}</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                                        placeholder={t('forms:email.placeholder')}
                                                        value={formik.values.email}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={isLoading}
                                                    />
                                                    {formik.touched.email && formik.errors.email && (
                                                        <div className="invalid-feedback d-block">{formik.errors.email}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-12 mt-3">
                                                <button
                                                    type="submit"
                                                    className="btn btn-main w-100"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <><i className="fas fa-spinner fa-spin me-2"></i>{t('forgotPassword.sending')}</>
                                                    ) : (
                                                        t('forgotPassword.sendBtn')
                                                    )}
                                                </button>
                                            </div>

                                            <div className="col-12 mt-3 text-center">
                                                <I18nLink to="/login" className="text-decoration-underline text-main font-14">
                                                    {t('forgotPassword.backToLogin')}
                                                </I18nLink>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Cta ctaClass="" />
                <Footer />
            </main>
        </>
    );
};

export default ForgotPassword;

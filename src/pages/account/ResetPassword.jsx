import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18nNavigate } from '../../i18n/I18nLink';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { ensureSupabaseClient } from '../../services/supabaseClient';
import { maskIdentifier } from '../../services/lastAuthMethod';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import PageLoader from '../../common/PageLoader';

const ResetPassword = () => {
    const { t } = useTranslation(['account', 'forms']);
    const navigate = useI18nNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [isValidSession, setIsValidSession] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [maskedAccount, setMaskedAccount] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const client = await ensureSupabaseClient();
                const { data: { session } } = await client.auth.getSession();
                // AUDIT FIX (1.4): getSession() may return a session object
                // that has actually expired (the JWT in localStorage is stale
                // until the next refresh). Validate the expiry timestamp before
                // trusting it; an expired session is treated as invalid so
                // updateUser won't fail silently with a confusing error later.
                const expiresAt = session?.expires_at;
                const isExpired = expiresAt ? expiresAt * 1000 <= Date.now() : false;
                if (session && !isExpired) {
                    setIsValidSession(true);
                    setMaskedAccount(maskIdentifier(session.user?.email || session.user?.phone || ''));
                } else if (session && isExpired) {
                    // Try to refresh; if that fails the session is unusable.
                    try {
                        const { data: { session: refreshed } } = await client.auth.refreshSession();
                        if (refreshed) {
                            setIsValidSession(true);
                            setMaskedAccount(maskIdentifier(refreshed.user?.email || refreshed.user?.phone || ''));
                        }
                    } catch {
                        setIsValidSession(false);
                    }
                }
            } catch {
                setIsValidSession(false);
            } finally {
                setVerifying(false);
            }
        })();
    }, []);

    const validationSchema = yup.object().shape({
        password: yup
            .string()
            .min(8, t('forms:password.minLength'))
            .matches(/[A-Z]/, t('forms:password.uppercase'))
            .matches(/[0-9]/, t('forms:password.number'))
            .required(t('forms:password.required')),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password')], t('forms:password.mustMatch'))
            .required(t('forms:password.confirmRequired')),
    });

    const formik = useFormik({
        initialValues: { password: '', confirmPassword: '' },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                await authService.resetPassword(values.password);
                // AUDIT FIX (1.7): The session used to authorize this reset was
                // a transient recovery session created by the OTP verification
                // (see ForgotPassword.jsx). It is not a real login. Sign it out
                // so the user is returned to a clean, unauthenticated state and
                // must sign in with the new password — keeping session state
                // unambiguous.
                try {
                    sessionStorage.removeItem('passwordResetFlow');
                } catch {
                    // Non-fatal.
                }
                try {
                    await authService.logout();
                } catch {
                    // Best-effort cleanup.
                }
                toast.success(t('resetPassword.successMessage'));
                navigate('/login');
            } catch (error) {
                toast.error(error.message || t('resetPassword.errorMessage'));
            } finally {
                setIsLoading(false);
            }
        },
    });

    if (verifying) {
        return <PageLoader />;
    }

    if (!isValidSession) {
        return (
            <>
                <SEO
                    title={t('resetPassword.title')}
                    description={t('resetPassword.description')}
                    canonical="/reset-password"
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
                                    <div className="text-center py-5" style={{
                                        background: '#fff',
                                        border: '1px solid var(--border-color-light)',
                                        borderRadius: '18px',
                                        padding: '40px',
                                        boxShadow: '0 12px 24px rgba(16, 24, 40, 0.04)',
                                    }}>
                                        <i className="fas fa-exclamation-triangle mb-3" style={{ fontSize: '3rem', color: 'var(--warning-color)' }}></i>
                                        <h5 className="mb-2">{t('resetPassword.invalidTitle')}</h5>
                                        <p className="text-muted mb-4">{t('resetPassword.invalidDesc')}</p>
                                        <a href="/forgot-password" className="btn btn-main">
                                            {t('resetPassword.requestNewLink')}
                                        </a>
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
    }

    return (
        <>
            <SEO
                title={t('resetPassword.title')}
                description={t('resetPassword.description')}
                canonical="/reset-password"
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
                                <div style={{
                                    background: '#fff',
                                    border: '1px solid var(--border-color-light)',
                                    borderRadius: '18px',
                                    padding: '40px',
                                    boxShadow: '0 12px 24px rgba(16, 24, 40, 0.04)',
                                }}>
                                    <div className="text-center mb-4">
                                        <h3 className="mb-2">{t('resetPassword.heading')}</h3>
                                        <p className="text-muted">{t('resetPassword.description')}</p>
                                        {maskedAccount && (
                                            <p className="mt-2 mb-0" style={{
                                                fontFamily: 'var(--font-body)',
                                                color: 'var(--text-secondary)',
                                                background: 'var(--bg-light)',
                                                border: '1px solid var(--border-color-light)',
                                                borderRadius: '8px',
                                                display: 'inline-block',
                                                padding: '6px 14px',
                                                fontSize: '0.9rem',
                                            }}>
                                                <i className="fas fa-user-shield me-2" style={{ color: 'var(--main-color)' }}></i>
                                                {maskedAccount}
                                            </p>
                                        )}
                                    </div>

                                    <form onSubmit={formik.handleSubmit}>
                                        <div className="col-12 mb-3">
                                            <div className="form-group">
                                                <label className="form-label">{t('forms:password.label')}</label>
                                                <div className="position-relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        className={`form-control pe-5 ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                                        placeholder={t('forms:password.placeholder')}
                                                        value={formik.values.password}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={isLoading}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-show-hide-btn"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        aria-label={showPassword ? t('forms:password.hidePassword') : t('forms:password.showPassword')}
                                                    >
                                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                                {formik.touched.password && formik.errors.password && (
                                                    <div className="invalid-feedback d-block">{formik.errors.password}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 mb-3">
                                            <div className="form-group">
                                                <label className="form-label">{t('forms:password.labelConfirm')}</label>
                                                <div className="position-relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        name="confirmPassword"
                                                        className={`form-control pe-5 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                                                        placeholder={t('forms:password.placeholderConfirm')}
                                                        value={formik.values.confirmPassword}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        disabled={isLoading}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-show-hide-btn"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        aria-label={showConfirmPassword ? t('forms:password.hidePassword') : t('forms:password.showPassword')}
                                                    >
                                                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                                    <div className="invalid-feedback d-block">{formik.errors.confirmPassword}</div>
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
                                                    <><i className="fas fa-spinner fa-spin me-2"></i>{t('resetPassword.resetting')}</>
                                                ) : (
                                                    t('resetPassword.resetBtn')
                                                )}
                                            </button>
                                        </div>
                                    </form>
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

export default ResetPassword;

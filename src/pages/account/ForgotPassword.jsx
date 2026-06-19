import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18nNavigate } from '../../i18n/I18nLink';
import { I18nLink } from '../../i18n/I18nLink';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { useResendTimer } from '../../hooks/useResendTimer';
import useWebOtp from '../../hooks/useWebOtp';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';

// Reuse the same helper from LoginRegister.
const looksLikeEmail = (value) => (value || '').includes('@');
const normalizePhone = (value) => {
  const digits = (value || '').replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
};

const ForgotPassword = () => {
    const { t } = useTranslation(['account', 'forms']);
    const navigate = useI18nNavigate();

    // State machine: 'input' | 'otp'
    const [step, setStep] = useState('input');
    const [identifier, setIdentifier] = useState('');
    const [identifierError, setIdentifierError] = useState('');
    const [channel, setChannel] = useState(null); // 'phone' | 'email'
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Standard 30s resend cooldown for the OTP step.
    const resend = useResendTimer();

    // WebOTP autofill on the OTP step (SMS only — email OTP is not delivered via SMS).
    useWebOtp((code) => setOtp((code || '').replace(/\D/g, '').slice(0, 6)), step === 'otp' && channel === 'phone');

    // ---- Step: input (email or phone) ----
    const handleInputSubmit = async (event) => {
        event.preventDefault();
        setIdentifierError('');

        const value = identifier.trim();
        if (!value) {
            setIdentifierError(t('forms:identifier.required'));
            return;
        }

        const isEmail = looksLikeEmail(value);

        if (isEmail) {
            // Email path: validate → send 6-digit email OTP → show OTP input.
            // OTP for both channels (decision 1); never create an account on reset.
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setIdentifierError(t('forms:email.invalidShort'));
                return;
            }
            setChannel('email');
            setIsLoading(true);
            try {
                await authService.sendEmailOtp(value, { shouldCreateUser: false });
                resend.start();
                setStep('otp');
            } catch (error) {
                toast.error(error.message || t('forgotPassword.errorMessage'));
            } finally {
                setIsLoading(false);
            }
        } else {
            // Phone path: validate → send OTP → show OTP input.
            const phone = normalizePhone(value);
            if (!/^[6-9]\d{9}$/.test(phone)) {
                setIdentifierError(t('forms:phone.invalid'));
                return;
            }
            setChannel('phone');
            setIsLoading(true);
            try {
                await authService.sendPhoneOtp(`+91${phone}`, { shouldCreateUser: false });
                resend.start();
                setStep('otp');
            } catch (error) {
                toast.error(error.message || t('forgotPassword.errorMessage'));
            } finally {
                setIsLoading(false);
            }
        }
    };

    // ---- Step: OTP (email or phone) ----
    const handleResend = async () => {
        if (!resend.canResend) return;
        setIsLoading(true);
        try {
            if (channel === 'email') {
                await authService.sendEmailOtp(identifier.trim(), { shouldCreateUser: false });
            } else {
                await authService.sendPhoneOtp(`+91${normalizePhone(identifier.trim())}`, { shouldCreateUser: false });
            }
            resend.start();
        } catch (error) {
            toast.error(error.message || t('forgotPassword.errorMessage'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (event) => {
        event.preventDefault();
        setOtpError('');
        const code = otp.replace(/\D/g, '');
        if (code.length !== 6) {
            setOtpError(t('forms:otp.invalidLength'));
            return;
        }
        setIsLoading(true);
        try {
            if (channel === 'email') {
                await authService.verifyEmailOtp(identifier.trim(), code);
            } else {
                await authService.verifyPhoneOtp(`+91${normalizePhone(identifier.trim())}`, code);
            }
            // AUDIT FIX (1.7): verifyEmailOtp/verifyPhoneOtp establish a full
            // Supabase sign-in session. For a password-reset flow this session
            // is only meant to authorize `authService.resetPassword()` (which
            // calls updateUser) — it is NOT a real login. Flag the session as
            // transient so ResetPassword.jsx clears it after the new password
            // is set, keeping session state unambiguous (no lingering "logged
            // in as recovery" state).
            try {
                sessionStorage.setItem('passwordResetFlow', '1');
            } catch {
                // sessionStorage may be unavailable (private mode); non-fatal.
            }
            // OTP verified — redirect to the reset-password page where the
            // user can set a new password via the live Supabase session.
            toast.success(t('forgotPassword.otpVerified') || 'Verified! Set your new password.');
            navigate('/reset-password');
        } catch (error) {
            setOtpError(error.message || t('forms:otp.verifyFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const resetToInput = () => {
        setStep('input');
        setOtp('');
        setOtpError('');
        setChannel(null);
        setIdentifierError('');
        resend.reset();
    };

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

                                    {/* ----- Step: input (email or phone) ----- */}
                                    {step === 'input' && (
                                        <form onSubmit={handleInputSubmit}>
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <label className="form-label">{t('forgotPassword.identifierLabel') || t('forms:identifier.label')}</label>
                                                    <input
                                                        type="text"
                                                        inputMode="email"
                                                        autoComplete="username"
                                                        name="identifier"
                                                        className={`form-control ${identifierError ? 'is-invalid' : ''}`}
                                                        placeholder={t('forgotPassword.identifierPlaceholder') || t('forms:identifier.placeholder')}
                                                        value={identifier}
                                                        onChange={(e) => setIdentifier(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    {identifierError && (
                                                        <div className="invalid-feedback d-block">{identifierError}</div>
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

                                    {/* ----- Step: OTP (email or phone) ----- */}
                                    {step === 'otp' && (
                                        <form onSubmit={handleOtpSubmit}>
                                            <div className="col-12">
                                                <p className="text-muted mb-0 small">
                                                    {channel === 'email' ? t('forms:otp.sentToEmail') : t('forms:otp.sentToPhone')}{' '}
                                                    <button type="button" className="btn btn-link p-0 align-baseline text-main" onClick={resetToInput}>
                                                        {t('forms:identifier.useDifferent')}
                                                    </button>
                                                </p>
                                            </div>
                                            <div className="col-12 mt-3">
                                                <div className="form-group">
                                                    <label className="form-label">{t('forms:otp.label')}</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="one-time-code"
                                                        maxLength={6}
                                                        className={`form-control ${otpError ? 'is-invalid' : ''}`}
                                                        placeholder={t('forms:otp.placeholder')}
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        disabled={isLoading}
                                                        autoFocus
                                                    />
                                                    {otpError && (
                                                        <div className="invalid-feedback d-block">{otpError}</div>
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
                                                        <><i className="fas fa-spinner fa-spin me-2"></i>{t('forms:otp.verifying')}</>
                                                    ) : (
                                                        t('forms:otp.verify')
                                                    )}
                                                </button>
                                            </div>

                                            <div className="col-12 mt-3 text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-link text-main"
                                                    onClick={handleResend}
                                                    disabled={isLoading || !resend.canResend}
                                                >
                                                    {resend.canResend ? t('forms:otp.resend') : t('forms:otp.resendIn', { seconds: resend.secondsLeft })}
                                                </button>
                                            </div>

                                            <div className="col-12 mt-2 text-center">
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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18nNavigate } from '../../i18n/I18nLink';
import { I18nLink } from '../../i18n/I18nLink';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store';
import api from '../../services/api';
import { authService } from '../../services/authService';
import { getLastAuthMethod, AUTH_METHODS, maskIdentifier } from '../../services/lastAuthMethod';
import { getRedirectPathForStage, fetchAuthStage } from '../../utils/authStage';
import useWebOtp from '../../hooks/useWebOtp';
import { useResendTimer } from '../../hooks/useResendTimer';

import LoginRegisterThumb from '/assets/images/thumbs/login-img.avif';

import LazyImage from '../../common/ui/LazyImage';

// Detect whether a raw identifier is an email or an Indian phone number.
const looksLikeEmail = (value) => (value || '').includes('@');
// CRITICAL FIX (audit 1.5): normalizePhone previously silently left a
// wrong-digit-count input unchanged, then the `^[6-9]\d{9}$` check produced a
// generic "invalid phone" error. Now we only strip the country code when the
// length is exactly 12 and the number starts with 91; everything else is
// passed through unchanged and validated explicitly by validateIdentifier
// below, which surfaces a precise "wrong length" error.
const normalizePhone = (value) => {
  const digits = (value || '').replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
};

// Mirrors the registration password rule: min 8 chars, at least one uppercase
// letter and one number. Used by the forced set-password step too.
const isStrongPassword = (value) =>
  typeof value === 'string' &&
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /[0-9]/.test(value);

// Tooltip for form field help - defined at module scope to avoid re-creation on each render
const Tooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div
            className="tooltip-wrapper d-inline-flex align-items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="custom-tooltip">
                    {text}
                    <div className="custom-tooltip__arrow" />
                </div>
            )}
        </div>
    );
};

// "Continue with Google" button + divider — shared by login & register.
const GoogleButton = ({ disabled, onClick, t }) => (
    <>
        <div className="col-12">
            <button
                type="button"
                className="btn btn-outline-main w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={onClick}
                disabled={disabled}
            >
                <i className="fab fa-google" aria-hidden="true"></i>
                {disabled ? t('forms:google.connecting') : t('forms:google.continueWith')}
            </button>
        </div>
        <div className="col-12">
            <div className="auth-divider d-flex align-items-center gap-2 text-muted">
                <span className="flex-grow-1 border-top"></span>
                <span className="small text-uppercase">{t('forms:or')}</span>
                <span className="flex-grow-1 border-top"></span>
            </div>
        </div>
    </>
);

// Top-level dispatcher: login pages render the step-based state machine,
// registration pages render the password-required signup form. Splitting them
// into separate components keeps Hook ordering stable.
const LoginRegister = (props) => {
    if (props.isLogin) {
        return <LoginFlow {...props} />;
    }
    return <RegisterFlow {...props} />;
};

// ==================== Registration state-machine ====================
// Step 1: identifier + name → Step 2: OTP → Step 3: set password
const RegisterFlow = ({titleText, btnText, showTermCondition, haveAccountText, haveAccountLink, haveAccountLinkText}) => {

    const { t } = useTranslation(['forms', 'account']);
    const navigate = useI18nNavigate();

    const [step, setStep] = useState('identifier'); // 'identifier' | 'otp' | 'setPassword'
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [channel, setChannel] = useState(null); // 'phone' | 'email' | null
    const [identifierError, setIdentifierError] = useState('');
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [termsError, setTermsError] = useState(false);

    // Standard 30s resend cooldown for the OTP step.
    const resend = useResendTimer();

    // WebOTP autofill on the OTP step.
    useWebOtp((code) => setOtp((code || '').replace(/\D/g, '').slice(0, 6)), step === 'otp');

    // ---- Google (redirect flow) ----
    const [googleLoading, setGoogleLoading] = useState(false);
    const handleGoogle = async () => {
        setGoogleLoading(true);
        try {
            await authService.signInWithGoogle('/');
        } catch (err) {
            setGoogleLoading(false);
            toast.error(err.message || t('forms:google.failed'), { theme: 'colored' });
        }
    };

    // Password strength helpers (shared with the old registration form).
    const getPasswordStrength = (pw) => {
        if (!pw) return 0;
        let s = 0;
        if (pw.length >= 8) s += 1;
        if (/[A-Z]/.test(pw)) s += 1;
        if (/[0-9]/.test(pw)) s += 1;
        if (/[^A-Za-z0-9]/.test(pw)) s += 1;
        if (pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s += 1;
        return s;
    };
    const strengthLabel = (s) => {
        const l = ['', t('forms:password.strength.weak'), t('forms:password.strength.fair'), t('forms:password.strength.good'), t('forms:password.strength.strong'), t('forms:password.strength.veryStrong')];
        return l[s] || '';
    };
    const strengthColor = (s) => {
        const c = ['#e9ecef', '#dc3545', '#fd7e14', '#ffc107', '#20c997', '#198754'];
        return c[s] || '#e9ecef';
    };

    const resetToIdentifier = () => {
        setStep('identifier');
        setOtp('');
        setOtpError('');
        setPassword('');
        setConfirmPassword('');
        setChannel(null);
        setIdentifierError('');
        resend.reset();
    };

    // ---- Step 1 validation & submit ----
    const handleIdentifierSubmit = async (event) => {
        event.preventDefault();
        setIdentifierError('');

        const phoneVal = phone.trim();
        const emailVal = email.trim();

        // At least one of phone / email is required.
        if (!phoneVal && !emailVal) {
            setIdentifierError(t('forms:identifier.required'));
            return;
        }

        // Validate phone if provided.
        if (phoneVal) {
            const digits = phoneVal.replace(/\D/g, '');
            if (!/^[6-9]\d{9}$/.test(digits)) {
                setIdentifierError(t('forms:phone.invalid'));
                return;
            }
        }

        // Validate email if provided.
        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            setIdentifierError(t('forms:email.invalid'));
            return;
        }

        // Terms check (before sending OTP).
        if (showTermCondition && !agreedToTerms) {
            setTermsError(true);
            return;
        }

        // Determine which channel to use for OTP. Prefer phone when both are
        // provided; fall back to email.
        const useChannel = phoneVal ? 'phone' : 'email';
        setChannel(useChannel);
        setBusy(true);

        try {
            // Signup OTP send — create the account if it doesn't exist yet
            // (shouldCreateUser:true is correct ONLY on the signup path).
            if (useChannel === 'phone') {
                await authService.sendPhoneOtp(`+91${normalizePhone(phoneVal)}`, { shouldCreateUser: true });
            } else {
                await authService.sendEmailOtp(emailVal, { shouldCreateUser: true });
            }
            resend.start();
            setStep('otp');
        } catch (err) {
            toast.error(err.message || t('forms:otp.sendFailed'), { theme: 'colored' });
        } finally {
            setBusy(false);
        }
    };

    // ---- Step 2: OTP verification ----
    const handleResend = async () => {
        if (!resend.canResend) return;
        setBusy(true);
        try {
            if (channel === 'phone') {
                await authService.sendPhoneOtp(`+91${normalizePhone(phone.trim())}`, { shouldCreateUser: true });
            } else {
                await authService.sendEmailOtp(email.trim(), { shouldCreateUser: true });
            }
            resend.start();
        } catch (err) {
            toast.error(err.message || t('forms:otp.sendFailed'), { theme: 'colored' });
        } finally {
            setBusy(false);
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
        setBusy(true);
        try {
            if (channel === 'phone') {
                await authService.verifyPhoneOtp(`+91${normalizePhone(phone.trim())}`, code);
            } else {
                await authService.verifyEmailOtp(email.trim(), code);
            }
            // OTP verified — move to set-password step.
            setStep('setPassword');
        } catch (err) {
            setOtpError(err.message || t('forms:otp.verifyFailed'));
        } finally {
            setBusy(false);
        }
    };

    // ---- Step 3: Set password ----
    const passwordValid = isStrongPassword(password) && password === confirmPassword;

    const handleSetPasswordSubmit = async (event) => {
        event.preventDefault();
        if (!passwordValid) return;
        setBusy(true);
        try {
            await authService.setPasswordAfterSignup(password);
            toast.success(t('forms:generic.registerSuccess'), { theme: 'colored' });
            navigate('/account');
        } catch (err) {
            toast.error(err.message || t('forms:generic.registerFailed'), { theme: 'colored' });
        } finally {
            setBusy(false);
        }
    };

    // Masked identifier for display on the set-password step.
    const maskedIdentifier = maskIdentifier(channel === 'phone' ? phone : email);

    return (
        <section className="loginRegister padding-y-120">
            <div className="container container-two">
                <div className="loginRegister-box card common-card">
                    <div className="card-body">
                        <div className="row gy-4">
                            <div className="col-lg-6">
                                <div className="loginRegister-thumb rounded overflow-hidden me-lg-2 d-flex h-100">
                                    <LazyImage src={LoginRegisterThumb} alt="360Ghar real estate platform" width={540} height={600}/>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="loginRegister-content">
                                    {/* Mobile image - shown only on small screens */}
                                    <div className="d-lg-none mb-4">
                                        <div className="loginRegister-thumb-mobile rounded overflow-hidden">
                                            <LazyImage src={LoginRegisterThumb} alt="360Ghar real estate" className="loginRegister-thumb-mobile__image" />
                                        </div>
                                    </div>

                                    <h3 className="loginRegister__title text-poppins">{t('forms:loginRegister.titleTo', { title: titleText })}</h3>
                                    <p className="loginRegister__desc mb-4 font-18">{t('forms:loginRegister.registerDesc')}</p>
                                    <div className="auth-trust-strip">
                                        <span><i className="fas fa-shield-alt" aria-hidden="true"></i> {t('forms:loginRegister.verifiedPlatform')}</span>
                                        <span><i className="fas fa-lock" aria-hidden="true"></i> {t('forms:loginRegister.secureLogin')}</span>
                                        <span><i className="fas fa-user-check" aria-hidden="true"></i> {t('forms:loginRegister.trustedAgents')}</span>
                                    </div>

                                    {/* ----- Step: identifier + name ----- */}
                                    {step === 'identifier' && (
                                        <form onSubmit={handleIdentifierSubmit} method="POST">
                                            <div className="row gy-lg-4 gy-3">
                                                <GoogleButton disabled={googleLoading} onClick={handleGoogle} t={t} />

                                                <div className="col-sm-12">
                                                    <label htmlFor="reg-fullname" className="form-label">{t('forms:name.labelFirstName')}</label>
                                                    <input
                                                        type="text"
                                                        autoComplete="name"
                                                        placeholder={t('forms:name.placeholderFirstName')}
                                                        id="reg-fullname"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="common-input"
                                                        disabled={busy}
                                                    />
                                                </div>

                                                <div className="col-sm-12">
                                                    <label htmlFor="reg-phone" className="form-label d-flex align-items-center gap-2">
                                                        {t('forms:phone.label')}
                                                        <Tooltip text={t('forms:phone.tooltip')}>
                                                            <i className="far fa-question-circle text-muted field-help-icon"></i>
                                                        </Tooltip>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        inputMode="tel"
                                                        autoComplete="tel"
                                                        placeholder={t('forms:phone.placeholder')}
                                                        id="reg-phone"
                                                        maxLength={10}
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                        className="common-input"
                                                        disabled={busy}
                                                    />
                                                    <small className="text-muted">{t('forms:phone.helper')}</small>
                                                </div>

                                                <div className="col-sm-12">
                                                    <label htmlFor="reg-email" className="form-label">{t('forms:email.label')}</label>
                                                    <input
                                                        type="email"
                                                        inputMode="email"
                                                        autoComplete="username"
                                                        placeholder={t('forms:email.placeholder')}
                                                        id="reg-email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="common-input"
                                                        disabled={busy}
                                                    />
                                                </div>

                                                {/* UX FIX (audit 1.3): clarify that EITHER phone OR email works. */}
                                                <div className="col-12">
                                                    <small className="text-muted">
                                                        {t('forms:identifier.eitherHint')}
                                                    </small>
                                                </div>

                                                {identifierError && (
                                                    <div className="col-12">
                                                        <span className="text-danger">{identifierError}</span>
                                                    </div>
                                                )}

                                                {showTermCondition && (
                                                    <div className="col-12 py-2">
                                                        <div className="common-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="accept-terms-reg"
                                                                checked={agreedToTerms}
                                                                onChange={(e) => {
                                                                    setAgreedToTerms(e.target.checked);
                                                                    if (e.target.checked) setTermsError(false);
                                                                }}
                                                            />
                                                            <div className="form-check-label">
                                                                <label htmlFor="accept-terms-reg"> {t('forms:generic.iAgreeWith')} </label>
                                                                <I18nLink to="/policies/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-main">{t('forms:generic.termsOfService')}</I18nLink>
                                                                <label htmlFor="accept-terms-reg"> {t('forms:generic.and')} </label>
                                                                <I18nLink to="/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-main">{t('forms:generic.privacyPolicy')}</I18nLink>
                                                            </div>
                                                        </div>
                                                        {termsError && (
                                                            <span className="text-danger font-12 d-block mt-1">
                                                                {t('forms:generic.mustAgreeTerms')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={busy}>
                                                        {busy ? (
                                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('forms:identifier.checking')}</>
                                                        ) : (
                                                            <>
                                                                {t('forms:identifier.continue')}
                                                                <span className="icon-right"> <i className="far fa-paper-plane"></i> </span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="col-sm-12 mb-0">
                                                    <div className="have-account text-center">
                                                        <p className="text">{haveAccountText}
                                                            <I18nLink to={haveAccountLink} className="link text-main text-decoration-underline font-14 text-poppins">{haveAccountLinkText}</I18nLink>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* ----- Step: OTP ----- */}
                                    {step === 'otp' && (
                                        <form onSubmit={handleOtpSubmit} method="POST">
                                            <div className="row gy-lg-4 gy-3">
                                                <div className="col-12">
                                                    <p className="text-muted mb-0 small">
                                                        {channel === 'email' ? t('forms:otp.sentToEmail') : t('forms:otp.sentToPhone')}{' '}
                                                        <button type="button" className="btn btn-link p-0 align-baseline text-main" onClick={resetToIdentifier}>
                                                            {t('forms:identifier.useDifferent')}
                                                        </button>
                                                    </p>
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="reg-otp" className="form-label">{t('forms:otp.label')}</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="one-time-code"
                                                        maxLength={6}
                                                        id="reg-otp"
                                                        placeholder={t('forms:otp.placeholder')}
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        className={`common-input ${otpError ? 'is-invalid' : ''}`}
                                                        disabled={busy}
                                                        autoFocus
                                                    />
                                                    {otpError && <span className="text-danger">{otpError}</span>}
                                                </div>
                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={busy}>
                                                        {busy ? (
                                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('forms:otp.verifying')}</>
                                                        ) : t('forms:otp.verify')}
                                                    </button>
                                                </div>
                                                <div className="col-12 text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link text-main"
                                                        onClick={handleResend}
                                                        disabled={busy || !resend.canResend}
                                                    >
                                                        {resend.canResend ? t('forms:otp.resend') : t('forms:otp.resendIn', { seconds: resend.secondsLeft })}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* ----- Step: set password ----- */}
                                    {step === 'setPassword' && (
                                        <form onSubmit={handleSetPasswordSubmit} method="POST">
                                            <div className="row gy-lg-4 gy-3">
                                                <div className="col-12">
                                                    <h5 className="mb-1">{t('forms:setPassword.heading')}</h5>
                                                    <p className="text-muted small mb-1">{t('forms:setPassword.required')}</p>
                                                    <p className="text-muted small mb-0 fw-semibold">
                                                        {t('forms:setPassword.forAccount', { identifier: maskedIdentifier })}
                                                    </p>
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="reg-password" className="form-label d-flex align-items-center gap-2">
                                                        {t('forms:password.label')}
                                                        <Tooltip text={t('forms:password.tooltipRequirements')}>
                                                            <i className="far fa-question-circle text-muted field-help-icon"></i>
                                                        </Tooltip>
                                                    </label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            autoComplete="new-password"
                                                            id="reg-password"
                                                            placeholder={t('forms:password.placeholder')}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="common-input"
                                                            disabled={busy}
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            className="password-show-hide-btn"
                                                            onClick={() => setShowPassword((v) => !v)}
                                                            aria-label={showPassword ? t('forms:password.hidePassword') : t('forms:password.showPassword')}
                                                        >
                                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                    </div>

                                                    {password && (
                                                        <div className="mt-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <small className="text-muted">{t('forms:password.strengthLabel')}</small>
                                                                <small style={{ color: strengthColor(getPasswordStrength(password)) }}>
                                                                    {strengthLabel(getPasswordStrength(password))}
                                                                </small>
                                                            </div>
                                                            <div className="progress" style={{ height: '4px' }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    role="progressbar"
                                                                    style={{
                                                                        width: `${(getPasswordStrength(password) + 1) * 20}%`,
                                                                        backgroundColor: strengthColor(getPasswordStrength(password)),
                                                                    }}
                                                                ></div>
                                                            </div>

                                                            <div className="mt-3">
                                                                <small className="text-muted d-block mb-2">{t('forms:password.requirementsLabel')}</small>
                                                                <ul className="list-unstyled mb-0">
                                                                    <li className="small">
                                                                        <i className={`fas ${password.length >= 8 ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        {t('forms:password.atLeast8')}
                                                                    </li>
                                                                    <li className="small">
                                                                        <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        {t('forms:password.atLeast1Uppercase')}
                                                                    </li>
                                                                    <li className="small">
                                                                        <i className={`fas ${/[0-9]/.test(password) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        {t('forms:password.atLeast1Number')}
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-12">
                                                    <label htmlFor="reg-confirm-password" className="form-label">{t('forms:password.labelConfirm')}</label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            autoComplete="new-password"
                                                            id="reg-confirm-password"
                                                            placeholder={t('forms:password.placeholderConfirm')}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="common-input"
                                                            disabled={busy}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="password-show-hide-btn"
                                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                                            aria-label={showConfirmPassword ? t('forms:password.hidePassword') : t('forms:password.showPassword')}
                                                        >
                                                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                    </div>
                                                    {confirmPassword && confirmPassword !== password && (
                                                        <span className="text-danger">{t('forms:password.confirmMismatch')}</span>
                                                    )}
                                                </div>

                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={busy || !passwordValid}>
                                                        {busy ? (
                                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('forms:loginRegister.registering')}</>
                                                        ) : (
                                                            <>
                                                                {btnText}
                                                                <span className="icon-right"> <i className="far fa-paper-plane"></i> </span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ==================== Login state-machine ====================
// identifier -> (password | OTP -> set-password)
const LoginFlow = ({
    titleText, btnText, showForgotRemember,
    haveAccountText, haveAccountLink, haveAccountLinkText,
}) => {
    const { t } = useTranslation(['forms', 'account']);
    const navigate = useI18nNavigate();
    const { login, error, clearError } = useAuthStore();

    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => setShowPassword((v) => !v);

    // ---- Google (redirect flow) ----
    const [googleLoading, setGoogleLoading] = useState(false);
    const handleGoogle = async () => {
        clearError();
        setGoogleLoading(true);
        try {
            await authService.signInWithGoogle('/');
            // On success the browser redirects to Google; no further action here.
        } catch (err) {
            setGoogleLoading(false);
            toast.error(err.message || t('forms:google.failed'), { theme: 'colored' });
        }
    };

    // ---- Last-used method (highlight / hint) ----
    const [lastMethod, setLastMethod] = useState(null);
    useEffect(() => {
        setLastMethod(getLastAuthMethod());
    }, []);
    const lastMethodLabel = lastMethod
        ? t('forms:lastUsed.label', { method: t(`forms:lastUsed.${lastMethod.method}`) })
        : '';

    const [step, setStep] = useState('identifier'); // 'identifier' | 'password' | 'otp' | 'setPassword'
    const [identifier, setIdentifier] = useState('');
    const [identifierError, setIdentifierError] = useState('');
    const [busy, setBusy] = useState(false);

    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [channel, setChannel] = useState('phone'); // 'phone' | 'email'
    // `has_password` from /auth/identifier-status. Unknown identifier ⇒ false.
    // When false, the OTP flow FORCES a (non-skippable) set-password step.
    const [hasPassword, setHasPassword] = useState(false);
    // True only when the identifier is unknown (a signup) — then the OTP send is
    // allowed to create the account. Existing-unverified accounts must NOT create.
    const [otpShouldCreateUser, setOtpShouldCreateUser] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleShowConfirmPassword = () => setShowConfirmPassword((v) => !v);

    // Standard 30s resend cooldown for the OTP step.
    const resend = useResendTimer();

    // WebOTP autofill on the OTP step.
    useWebOtp((code) => setOtp((code || '').replace(/\D/g, '').slice(0, 6)), step === 'otp');

    // Build the channel-qualified identifier the SDK expects.
    const buildSupabaseIdentifier = () => {
        if (channel === 'email') return identifier.trim();
        return `+91${normalizePhone(identifier)}`;
    };

    const resetToIdentifier = () => {
        setStep('identifier');
        setPassword('');
        setOtp('');
        setOtpError('');
        setNewPassword('');
        setConfirmNewPassword('');
        resend.reset();
        clearError();
    };

    const validateIdentifier = () => {
        const value = identifier.trim();
        if (!value) {
            setIdentifierError(t('forms:identifier.required'));
            return null;
        }
        if (looksLikeEmail(value)) {
            // Lightweight email check (the backend is the source of truth).
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setIdentifierError(t('forms:identifier.invalid'));
                return null;
            }
            return { value, channel: 'email' };
        }
        const phone = normalizePhone(value);
        // CRITICAL FIX (audit 1.5): give a precise error for wrong digit
        // counts instead of a generic "invalid phone".
        if (!/^\d+$/.test(phone)) {
            setIdentifierError(t('forms:identifier.phoneDigitsOnly'));
            return null;
        }
        if (phone.length !== 10) {
            setIdentifierError(t('forms:identifier.phoneWrongLength', { count: phone.length }));
            return null;
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            setIdentifierError(t('forms:identifier.phoneInvalidStart'));
            return null;
        }
        return { value: phone, channel: 'phone' };
    };

    const handleIdentifierSubmit = async (event) => {
        event.preventDefault();
        clearError();
        setIdentifierError('');
        const parsed = validateIdentifier();
        if (!parsed) return;

        setChannel(parsed.channel);
        setBusy(true);
        try {
            const status = await authService.checkIdentifierStatus(parsed.value);
            if (status?.next_step === 'password') {
                setStep('password');
            } else {
                // OTP path — new or unverified account. Track whether the account
                // already has a password; an unknown identifier (has_password
                // undefined/null) is treated as NO password, so the set-password
                // step is forced after OTP verification.
                setHasPassword(status?.has_password === true);
                // Only create the account on send when the identifier is unknown
                // (a signup). Existing-but-unverified accounts must not be re-created.
                const shouldCreateUser = status?.exists !== true;
                setOtpShouldCreateUser(shouldCreateUser);
                if (parsed.channel === 'email') {
                    await authService.sendEmailOtp(parsed.value, { shouldCreateUser });
                } else {
                    await authService.sendPhoneOtp(`+91${parsed.value}`, { shouldCreateUser });
                }
                resend.start();
                setStep('otp');
            }
        } catch (err) {
            toast.error(err.message || t('forms:otp.sendFailed'), { theme: 'colored' });
        } finally {
            setBusy(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        clearError();
        if (!password) return;
        setBusy(true);
        try {
            const success = await login(buildSupabaseIdentifier(), password);
            if (success) {
                toast.success(t('forms:generic.loginSuccess'), { theme: 'colored' });
                // Navigate based on the backend gate evaluation.
                const stage = useAuthStore.getState().authStage;
                navigate(getRedirectPathForStage(stage));
            } else {
                toast.error(error || t('forms:generic.loginFailed'), { theme: 'colored' });
            }
        } catch (err) {
            toast.error(err?.message || error || t('forms:generic.loginFailed'), { theme: 'colored' });
        } finally {
            setBusy(false);
        }
    };

    const handleResend = async () => {
        if (!resend.canResend) return;
        setBusy(true);
        try {
            if (channel === 'email') {
                await authService.sendEmailOtp(identifier.trim(), { shouldCreateUser: otpShouldCreateUser });
            } else {
                await authService.sendPhoneOtp(`+91${normalizePhone(identifier)}`, { shouldCreateUser: otpShouldCreateUser });
            }
            resend.start();
        } catch (err) {
            toast.error(err.message || t('forms:otp.sendFailed'), { theme: 'colored' });
        } finally {
            setBusy(false);
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
        setBusy(true);
        try {
            if (channel === 'email') {
                await authService.verifyEmailOtp(identifier.trim(), code);
                authService.afterAuthSuccess(AUTH_METHODS.EMAIL_OTP, identifier.trim());
            } else {
                await authService.verifyPhoneOtp(`+91${normalizePhone(identifier)}`, code);
                authService.afterAuthSuccess(AUTH_METHODS.PHONE_OTP, normalizePhone(identifier));
            }

            // REQUIRED (req 6): if the account has no password yet, force a
            // non-skippable set-password step before completing login. Applies
            // to BOTH the unknown-identifier and existing-unverified branches.
            if (!hasPassword) {
                setStep('setPassword');
            } else {
                toast.success(t('forms:generic.loginSuccess'), { theme: 'colored' });
                // Fetch auth gate state explicitly (syncUserProfile may not
                // have completed yet since it is triggered by the async
                // Supabase auth state change event).
                const stage = useAuthStore.getState().authStage || await fetchAuthStage(api);
                navigate(getRedirectPathForStage(stage));
            }
        } catch (err) {
            setOtpError(err.message || t('forms:otp.verifyFailed'));
        } finally {
            setBusy(false);
        }
    };

    const setPasswordValid =
        isStrongPassword(newPassword) && newPassword === confirmNewPassword;

    const handleSetPasswordSubmit = async (event) => {
        event.preventDefault();
        // Hard guard: never proceed without a valid, confirmed strong password.
        if (!setPasswordValid) return;
        setBusy(true);
        try {
            await authService.setPasswordAfterSignup(newPassword);
            // The account now has a password — record the password-based method.
            if (channel === 'email') {
                authService.afterAuthSuccess(AUTH_METHODS.EMAIL_PASSWORD, identifier.trim());
            } else {
                authService.afterAuthSuccess(AUTH_METHODS.PHONE_PASSWORD, normalizePhone(identifier));
            }
            setHasPassword(true);
            toast.success(t('forms:generic.loginSuccess'), { theme: 'colored' });
            // Fetch auth gate state explicitly (syncUserProfile may not
            // have completed yet since it is triggered by the async
            // Supabase auth state change event).
            const stage = useAuthStore.getState().authStage || await fetchAuthStage(api);
            navigate(getRedirectPathForStage(stage));
        } catch (err) {
            toast.error(err.message || t('forms:generic.loginFailed'), { theme: 'colored' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="loginRegister padding-y-120">
            <div className="container container-two">
                <div className="loginRegister-box card common-card">
                    <div className="card-body">
                        <div className="row gy-4">
                            <div className="col-lg-6">
                                <div className="loginRegister-thumb rounded overflow-hidden me-lg-2 d-flex h-100">
                                    <LazyImage src={LoginRegisterThumb} alt="360Ghar real estate platform" width={540} height={600}/>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="loginRegister-content">
                                    <div className="d-lg-none mb-4">
                                        <div className="loginRegister-thumb-mobile rounded overflow-hidden">
                                            <LazyImage src={LoginRegisterThumb} alt="360Ghar real estate" className="loginRegister-thumb-mobile__image" />
                                        </div>
                                    </div>

                                    <h3 className="loginRegister__title text-poppins">{t('forms:loginRegister.titleTo', { title: titleText })}</h3>
                                    <p className="loginRegister__desc mb-4 font-18">{t('forms:loginRegister.loginDesc')}</p>
                                    <div className="auth-trust-strip">
                                        <span><i className="fas fa-shield-alt" aria-hidden="true"></i> {t('forms:loginRegister.verifiedPlatform')}</span>
                                        <span><i className="fas fa-lock" aria-hidden="true"></i> {t('forms:loginRegister.secureLogin')}</span>
                                        <span><i className="fas fa-user-check" aria-hidden="true"></i> {t('forms:loginRegister.trustedAgents')}</span>
                                    </div>

                                    {lastMethod && (
                                        <div className="alert alert-info py-2 small d-flex align-items-center gap-2" role="status">
                                            <span className="badge bg-primary">{t('forms:lastUsed.badge')}</span>
                                            <span>{lastMethodLabel}{lastMethod.identifierHint ? ` (${lastMethod.identifierHint})` : ''}</span>
                                        </div>
                                    )}

                                    {error && <div className="alert alert-danger">{error}</div>}

                                    {/* ----- Step: identifier ----- */}
                                    {step === 'identifier' && (
                                        <form onSubmit={handleIdentifierSubmit} method="POST">
                                            <div className="row gy-lg-4 gy-3">
                                                <GoogleButton disabled={googleLoading} onClick={handleGoogle} t={t} />

                                                <div className="col-12">
                                                    <label htmlFor="identifier" className="form-label">{t('forms:identifier.label')}</label>
                                                    <input
                                                        type="text"
                                                        inputMode="email"
                                                        autoComplete="username"
                                                        id="identifier"
                                                        name="identifier"
                                                        placeholder={t('forms:identifier.placeholder')}
                                                        value={identifier}
                                                        onChange={(e) => setIdentifier(e.target.value)}
                                                        className={`common-input ${identifierError ? 'is-invalid' : ''}`}
                                                        disabled={busy}
                                                        autoFocus
                                                    />
                                                    {identifierError && <span className="text-danger">{identifierError}</span>}
                                                </div>

                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={busy}>
                                                        {busy ? (
                                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('forms:identifier.checking')}</>
                                                        ) : t('forms:identifier.continue')}
                                                    </button>
                                                </div>

                                                <div className="col-sm-12 mb-0">
                                                    <div className="have-account text-center">
                                                        <p className="text">{haveAccountText}
                                                            <I18nLink to={haveAccountLink} className="link text-main text-decoration-underline font-14 text-poppins">{haveAccountLinkText}</I18nLink>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* ----- Step: password ----- */}
                                    {step === 'password' && (
                                        <form onSubmit={handlePasswordSubmit} method="POST">
                                            <div className="row gy-lg-4 gy-3">
                                                <div className="col-12">
                                                    <p className="text-muted mb-0 small">{identifier}{' '}
                                                        <button type="button" className="btn btn-link p-0 align-baseline text-main" onClick={resetToIdentifier}>
                                                            {t('forms:identifier.useDifferent')}
                                                        </button>
                                                    </p>
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="login-password" className="form-label">{t('forms:password.label')}</label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            autoComplete="current-password"
                                                            id="login-password"
                                                            name="password"
                                                            placeholder={t('forms:password.placeholder')}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="common-input"
                                                            disabled={busy}
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            className="password-show-hide-btn"
                                                            onClick={handleShowPassword}
                                                            aria-label={showPassword ? t('forms:password.hidePassword') : t('forms:password.showPassword')}
                                                        >
                                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {showForgotRemember && (
                                                    <div className="col-12">
                                                        <div className="form-group py-1 flx-between">
                                                            <span></span>
                                                            <I18nLink to="/forgot-password" className="forgot-password text-decoration-underline text-main text-poppins font-14">{t('forms:generic.forgotPassword')}</I18nLink>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={busy}>
                                                        {busy ? (
                                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('forms:loginRegister.loggingIn')}</>
                                                        ) : btnText}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* ----- Step: OTP ----- */}
                                    {step === 'otp' && (
                                        <form onSubmit={handleOtpSubmit} method="POST">
                                            <div className="row gy-lg-4 gy-3">
                                                <div className="col-12">
                                                    <p className="text-muted mb-0 small">
                                                        {channel === 'email' ? t('forms:otp.sentToEmail') : t('forms:otp.sentToPhone')}{' '}
                                                        <button type="button" className="btn btn-link p-0 align-baseline text-main" onClick={resetToIdentifier}>
                                                            {t('forms:identifier.useDifferent')}
                                                        </button>
                                                    </p>
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="login-otp" className="form-label">{t('forms:otp.label')}</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="one-time-code"
                                                        maxLength={6}
                                                        id="login-otp"
                                                        name="otp"
                                                        placeholder={t('forms:otp.placeholder')}
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        className={`common-input ${otpError ? 'is-invalid' : ''}`}
                                                        disabled={busy}
                                                        autoFocus
                                                    />
                                                    {otpError && <span className="text-danger">{otpError}</span>}
                                                </div>
                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={busy}>
                                                        {busy ? (
                                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('forms:otp.verifying')}</>
                                                        ) : t('forms:otp.verify')}
                                                    </button>
                                                </div>
                                                <div className="col-12 text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link text-main"
                                                        onClick={handleResend}
                                                        disabled={busy || !resend.canResend}
                                                    >
                                                        {resend.canResend ? t('forms:otp.resend') : t('forms:otp.resendIn', { seconds: resend.secondsLeft })}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* ----- Step: set password after OTP (REQUIRED, non-skippable) ----- */}
                                    {step === 'setPassword' && (
                                        <form onSubmit={handleSetPasswordSubmit} method="POST">
                                            <div className="row gy-lg-4 gy-3">
                                                <div className="col-12">
                                                    <h5 className="mb-1">{t('forms:setPassword.heading')}</h5>
                                                    <p className="text-muted small mb-1">{t('forms:setPassword.required')}</p>
                                                    <p className="text-muted small mb-0 fw-semibold">
                                                        {t('forms:setPassword.forAccount', { identifier: maskIdentifier(identifier) })}
                                                    </p>
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="set-password" className="form-label">{t('forms:setPassword.label')}</label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            autoComplete="new-password"
                                                            id="set-password"
                                                            name="newPassword"
                                                            placeholder={t('forms:password.placeholder')}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="common-input"
                                                            disabled={busy}
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            className="password-show-hide-btn"
                                                            onClick={handleShowPassword}
                                                            aria-label={showPassword ? t('forms:password.hidePassword') : t('forms:password.showPassword')}
                                                        >
                                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                    </div>
                                                    {newPassword && !isStrongPassword(newPassword) && (
                                                        <ul className="list-unstyled mb-0 mt-2">
                                                            <li className="small">
                                                                <i className={`fas ${newPassword.length >= 8 ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                {t('forms:password.atLeast8')}
                                                            </li>
                                                            <li className="small">
                                                                <i className={`fas ${/[A-Z]/.test(newPassword) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                {t('forms:password.atLeast1Uppercase')}
                                                            </li>
                                                            <li className="small">
                                                                <i className={`fas ${/[0-9]/.test(newPassword) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                {t('forms:password.atLeast1Number')}
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="set-confirm-password" className="form-label">{t('forms:password.labelConfirm')}</label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            autoComplete="new-password"
                                                            id="set-confirm-password"
                                                            name="confirmNewPassword"
                                                            placeholder={t('forms:password.placeholderConfirm')}
                                                            value={confirmNewPassword}
                                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                            className="common-input"
                                                            disabled={busy}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="password-show-hide-btn"
                                                            onClick={handleShowConfirmPassword}
                                                            aria-label={showConfirmPassword ? t('forms:password.hidePassword') : t('forms:password.showPassword')}
                                                        >
                                                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                    </div>
                                                    {confirmNewPassword && confirmNewPassword !== newPassword && (
                                                        <span className="text-danger">{t('forms:password.confirmMismatch')}</span>
                                                    )}
                                                </div>
                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={busy || !setPasswordValid}>
                                                        {busy ? (
                                                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('forms:loginRegister.loggingIn')}</>
                                                        ) : btnText}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginRegister;

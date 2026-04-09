import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store';
import i18n from '../../i18n';

import LoginRegisterThumb from '/assets/images/thumbs/login-img.avif';

import LazyImage from '../../common/ui/LazyImage';

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

const LoginRegister = ({titleText, firstNameCol, showFirstName, lastNameCol, showLastName, passwordCol, showConfirm, btnText, showForgotRemember, showTermCondition, haveAccountText, haveAccountLink, haveAccountLinkText, isLogin = false}) => {

    const { t } = useTranslation(['forms', 'account']);

    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [termsError, setTermsError] = useState(false);

    // Navigate to Account Page
    const navigate = useNavigate();
    const { login, register, isLoading, error, clearError } = useAuthStore();

    // Password strength calculation with detailed requirements
    const getPasswordRequirements = (password) => {
        return {
            minLength: password?.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[^A-Za-z0-9]/.test(password)
        };
    };

    const getPasswordStrength = (password) => {
        if (!password) return 0;
        const reqs = getPasswordRequirements(password);
        let strength = 0;
        if (reqs.minLength) strength += 1;
        if (reqs.hasUppercase) strength += 1;
        if (reqs.hasNumber) strength += 1;
        if (reqs.hasSpecial) strength += 1;
        if (Object.values(reqs).every(req => req)) strength += 1;
        return strength;
    };

    const getPasswordStrengthLabel = (strength) => {
        const labels = [
          '',
          t('forms:password.strength.weak'),
          t('forms:password.strength.fair'),
          t('forms:password.strength.good'),
          t('forms:password.strength.strong'),
          t('forms:password.strength.veryStrong'),
        ];
        return labels[strength] || '';
    };

    const getPasswordStrengthColor = (strength) => {
        const colors = ['#e9ecef', '#dc3545', '#fd7e14', '#ffc107', '#20c997', '#198754'];
        return colors[strength] || '#e9ecef';
    };

    // **************************** Form Validation Start ************************
    const validationSchema = yup.object({
        // Phone number field - accepts Indian 10-digit numbers only
        phone: yup.string()
            .matches(/^[6-9]\d{9}$/, () => i18n.t('forms:phone.invalid'))
            .length(10, () => i18n.t('forms:phone.exact'))
            .required(() => i18n.t('forms:phone.required')),

        // Registration fields
        name: !isLogin ? yup.string().min(3, () => i18n.t('forms:name.tooShort')).required(() => i18n.t('forms:name.firstNameRequired')) : yup.string(),
        email: !isLogin ? yup.string().email(() => i18n.t('forms:email.invalid')).required(() => i18n.t('forms:email.required')) : yup.string(),
        lastName: !isLogin && showLastName ? yup.string().min(3, () => i18n.t('forms:name.tooShort')).required(() => i18n.t('forms:name.lastNameRequired')) : yup.string(),
        password: yup.string()
            .min(8, () => i18n.t('forms:password.minLength'))
            .matches(/[A-Z]/, () => i18n.t('forms:password.mustUppercase'))
            .matches(/[0-9]/, () => i18n.t('forms:password.mustNumber'))
            .required(() => i18n.t('forms:password.required')),
        confirm: showConfirm ? yup
            .string()
            .oneOf([yup.ref('password'), null], () => i18n.t('forms:password.confirmMismatch'))
            .required(() => i18n.t('forms:password.confirmRequired')) : yup.string(),
    });

    const formik = useFormik({
        initialValues: {
          phone: "",
          name: "",
          lastName: "",
          email: "",
          password: "",
          confirm: "",
        },
        validationSchema,

        onSubmit: async (values, { resetForm, setSubmitting }) => {
          clearError();

          // Validate terms checkbox for registration
          if (!isLogin && showTermCondition && !agreedToTerms) {
            setTermsError(true);
            setSubmitting(false);
            return;
          }

          try {
            let success = false;

            // Format phone number with +91 country code for API
            const formattedPhone = `+91${values.phone}`;

            if (isLogin) {
              success = await login(formattedPhone, values.password);
            } else {
              const registrationData = {
                phone: formattedPhone,
                full_name: `${values.name} ${values.lastName || ''}`.trim(),
                email: values.email,
                password: values.password,
              };
              success = await register(registrationData);
            }

            setSubmitting(false);

            if (success) {
              resetForm();
              setAgreedToTerms(false);
              toast.success(t(isLogin ? 'forms:generic.loginSuccess' : 'forms:generic.registerSuccess'), {
                theme: "colored",
              });

              // Navigate after successful auth
              if (isLogin) {
                navigate('/');
              } else {
                navigate('/account');
              }
            }
          } catch {
            setSubmitting(false);
            toast.error(error || t(isLogin ? 'forms:generic.loginFailed' : 'forms:generic.registerFailed'), {
              theme: "colored",
            });
          }
        },
    });

    // Render Errors Code Start
    const renderPhoneError = formik.touched.phone && formik.errors.phone && (
        <span className="text-danger">{formik.errors.phone}</span>
    );
    const renderEmailError = formik.touched.email && formik.errors.email && (
        <span className="text-danger">{formik.errors.email}</span>
    );
    const renderPasswordError = formik.touched.password && formik.errors.password && (
        <span className="text-danger">{formik.errors.password}</span>
    );
    const renderConfirmPasswordError = formik.touched.confirm && formik.errors.confirm && (
        <span className="text-danger">{formik.errors.confirm}</span>
    );
    const renderNameError = formik.touched.name && formik.errors.name && (
        <span className="text-danger">{formik.errors.name}</span>
    );
    const renderLastNameError = formik.touched.lastName && formik.errors.lastName && (
        <span className="text-danger">{formik.errors.lastName}</span>
    );

    // Global error from auth store
    const renderGlobalError = error && (
        <div className="alert alert-danger">{error}</div>
    );
    // Render Errors Code End
    // **************************** Form Validation End ************************

    return (
        <>
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
                                            <LazyImage
                                                src={LoginRegisterThumb}
                                                alt="360Ghar real estate"
                                                className="loginRegister-thumb-mobile__image"
                                            />
                                        </div>
                                    </div>
                                        <form onSubmit={formik.handleSubmit} method="POST">
                                            <h3 className="loginRegister__title text-poppins">{t('forms:loginRegister.titleTo', { title: titleText })}</h3>
                                            <p className="loginRegister__desc mb-4 font-18">{isLogin ? t('forms:loginRegister.loginDesc') : t('forms:loginRegister.registerDesc')}</p>
                                            <div className="auth-trust-strip">
                                                <span><i className="fas fa-shield-alt" aria-hidden="true"></i> {t('forms:loginRegister.verifiedPlatform')}</span>
                                                <span><i className="fas fa-lock" aria-hidden="true"></i> {t('forms:loginRegister.secureLogin')}</span>
                                                <span><i className="fas fa-user-check" aria-hidden="true"></i> {t('forms:loginRegister.trustedAgents')}</span>
                                            </div>

                                            {renderGlobalError}

                                            <div className="row gy-lg-4 gy-3">
                                                {/* Phone Number Field (Required for both login and registration) */}
                                                <div className="col-sm-12">
                                                    <label htmlFor="phone" className="form-label d-flex align-items-center gap-2">
                                                        {t('forms:phone.label')}
                                                        <Tooltip text={t('forms:phone.tooltip')}>
                                                            <i className="far fa-question-circle text-muted field-help-icon"></i>
                                                        </Tooltip>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        inputMode="tel"
                                                        placeholder={t('forms:phone.placeholder')}
                                                        name='phone'
                                                        id='phone'
                                                        maxLength={10}
                                                        onChange={(e) => {
                                                            // Only allow numbers
                                                            const value = e.target.value.replace(/\D/g, '');
                                                            formik.setFieldValue('phone', value);
                                                        }}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.phone}
                                                        className={`common-input ${
                                                            formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
                                                        }`}
                                                    />
                                                    {renderPhoneError}
                                                    <small className="text-muted">{t('forms:phone.helper')}</small>
                                                </div>

                                                {
                                                    !isLogin && showFirstName && (
                                                        <div className={firstNameCol}>
                                                            <label htmlFor="name" className="form-label">{t('forms:name.labelFirstName')}</label>
                                                            <input
                                                                type="text"
                                                                placeholder={t('forms:name.placeholderFirstName')}
                                                                name='name'
                                                                id='name'
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.name}
                                                                className={`common-input ${
                                                                    formik.touched.name && formik.errors.name ? "is-invalid" : ""
                                                                }`}
                                                            />
                                                            {renderNameError}
                                                        </div>
                                                    )
                                                }

                                                {
                                                    !isLogin && showLastName && (
                                                        <div className={lastNameCol}>
                                                            <label htmlFor="lastName" className="form-label">{t('forms:name.labelLastName')}</label>
                                                            <input
                                                                type="text"
                                                                placeholder={t('forms:name.placeholderLastName')}
                                                                name='lastName'
                                                                id='lastName'
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.lastName}
                                                                className={`common-input ${
                                                                    formik.touched.lastName && formik.errors.lastName ? "is-invalid" : ""
                                                                }`}
                                                            />
                                                            {renderLastNameError}
                                                        </div>
                                                    )
                                                }
                                                {
                                                    !isLogin && (
                                                        <div className="col-sm-6 col-xs-6">
                                                            <label htmlFor="Email" className="form-label">{t('forms:email.label')}</label>
                                                            <input
                                                                type="email"
                                                                inputMode="email"
                                                                placeholder={t('forms:email.placeholder')}
                                                                name='email'
                                                                id='Email'
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                value={formik.values.email}
                                                                className={`common-input ${
                                                                    formik.touched.email && formik.errors.email ? "is-invalid" : ""
                                                                }`}
                                                            />
                                                            {renderEmailError}
                                                        </div>
                                                    )
                                                }
                                                <div className={passwordCol}>
                                                    <label htmlFor="your-password" className="form-label d-flex align-items-center gap-2">
                                                        {t('forms:password.label')}
                                                        {!isLogin && (
                                                            <Tooltip text={t('forms:password.tooltipRequirements')}>
                                                                <i className="far fa-question-circle text-muted field-help-icon"></i>
                                                            </Tooltip>
                                                        )}
                                                    </label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={`${showPassword ? 'text': 'password'}`}
                                                            placeholder={t('forms:password.placeholder')}
                                                            name='password'
                                                            id='your-password'
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.password}
                                                            className={`common-input ${
                                                                formik.touched.password && formik.errors.password ? "is-invalid" : ""
                                                            }`}
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
                                                    {renderPasswordError}

                                                    {!isLogin && formik.values.password && (
                                                        <div className="mt-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <small className="text-muted">{t('forms:password.strengthLabel')}</small>
                                                                <small style={{ color: getPasswordStrengthColor(getPasswordStrength(formik.values.password)) }}>
                                                                    {getPasswordStrengthLabel(getPasswordStrength(formik.values.password))}
                                                                </small>
                                                            </div>
                                                            <div className="progress" style={{ height: '4px' }}>
                                                                <div
                                                                    className="progress-bar"
                                                                    role="progressbar"
                                                                    style={{
                                                                        width: `${(getPasswordStrength(formik.values.password) + 1) * 20}%`,
                                                                        backgroundColor: getPasswordStrengthColor(getPasswordStrength(formik.values.password)),
                                                                    }}
                                                                ></div>
                                                            </div>

                                                            <div className="mt-3">
                                                                <small className="text-muted d-block mb-2">{t('forms:password.requirementsLabel')}</small>
                                                                <ul className="list-unstyled mb-0">
                                                                    <li className="small">
                                                                        <i className={`fas ${formik.values.password.length >= 8 ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        {t('forms:password.atLeast8')}
                                                                    </li>
                                                                    <li className="small">
                                                                        <i className={`fas ${/[A-Z]/.test(formik.values.password) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        {t('forms:password.atLeast1Uppercase')}
                                                                    </li>
                                                                    <li className="small">
                                                                        <i className={`fas ${/[0-9]/.test(formik.values.password) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        {t('forms:password.atLeast1Number')}
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {
                                                    showConfirm && (
                                                        <div className="col-sm-6 col-xs-6">
                                                            <label htmlFor="confirm" className="form-label">{t('forms:password.labelConfirm')}</label>
                                                            <div className="position-relative">
                                                                <input
                                                                    type={`${showConfirmPassword ? 'text': 'password'}`}
                                                                    placeholder={t('forms:password.placeholderConfirm')}
                                                                    name='confirm'
                                                                    id='confirm'
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    value={formik.values.confirm}
                                                                    className={`common-input ${
                                                                        formik.touched.confirm && formik.errors.confirm ? "is-invalid" : ""
                                                                    }`}
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
                                                            { renderConfirmPasswordError }
                                                        </div>
                                                    )
                                                }

                                                {
                                                    showForgotRemember && (
                                                            <div className="col-12">
                                                            <div className="form-group py-2 flx-between">
                                                                <div className="common-check mb-0">
                                                                    <input className="form-check-input" type="checkbox" value="" id="remember-login"/>
                                                                    <label className="form-check-label" htmlFor="remember-login">{t('forms:generic.rememberMe')}</label>
                                                                </div>
                                                                <I18nLink to="/contact" className="forgot-password text-decoration-underline text-main text-poppins font-14">{t('forms:generic.forgotPassword')}</I18nLink>
                                                            </div>
                                                        </div>
                                                    )
                                                }

                                            {
                                                showTermCondition && (
                                                    <div className="col-12 py-2">
                                                        <div className="common-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="accept-terms"
                                                                checked={agreedToTerms}
                                                                onChange={(e) => {
                                                                    setAgreedToTerms(e.target.checked);
                                                                    if (e.target.checked) setTermsError(false);
                                                                }}
                                                            />
                                                            <div className="form-check-label">
                                                                <label className="" htmlFor="accept-terms"> {t('forms:generic.iAgreeWith')} </label>
                                                                <I18nLink to="/policies/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-main">{t('forms:generic.termsOfService')}</I18nLink>
                                                                <label className="" htmlFor="accept-terms"> {t('forms:generic.and')} </label>
                                                                <I18nLink to="/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-main">{t('forms:generic.privacyPolicy')}</I18nLink>
                                                            </div>
                                                        </div>
                                                        {termsError && (
                                                            <span className="text-danger font-12 d-block mt-1">
                                                                {t('forms:generic.mustAgreeTerms')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            }

                                                <div className="col-12">
                                                    <button type="submit" className="btn btn-main w-100" disabled={isLoading || formik.isSubmitting}>
                                                        {isLoading || formik.isSubmitting ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                {isLogin ? t('forms:loginRegister.loggingIn') : t('forms:loginRegister.registering')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {btnText}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LoginRegister;

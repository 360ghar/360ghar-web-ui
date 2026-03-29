import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store';

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
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
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
            .matches(/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number starting with 6-9')
            .length(10, 'Mobile number must be exactly 10 digits')
            .required('Mobile number is required'),

        // Registration fields
        name: !isLogin ? yup.string().min(3, "Too Short! Must be at least 3 characters long").required("First Name is required") : yup.string(),
        email: !isLogin ? yup.string().email("Your Email is not valid! Provide valid email").required() : yup.string(),
        lastName: !isLogin && showLastName ? yup.string().min(3, "Too Short! Must be at least 3 characters long").required("Last Name is required") : yup.string(),
        password: yup.string()
            .min(8, 'Password must be at least 8 characters')
            .matches(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
            .matches(/[0-9]/, 'Password must contain at least 1 number')
            .required('Password is required'),
        confirm: showConfirm ? yup
            .string()
            .oneOf([yup.ref('password'), null], "Confirm password doesn't match with password")
            .required() : yup.string(),
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
              toast.success(`${isLogin ? 'Login' : 'Registration'} successful!`, {
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
            toast.error(error || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`, {
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
                                            <h3 className="loginRegister__title text-poppins">{titleText} to 360Ghar</h3>
                                            <p className="loginRegister__desc mb-4 font-18">{isLogin ? 'Welcome back to 360Ghar! Please login to continue.' : 'Join 360Ghar to discover your dream property and connect with trusted real estate professionals.'}</p>
                                            <div className="auth-trust-strip">
                                                <span><i className="fas fa-shield-alt" aria-hidden="true"></i> Verified platform</span>
                                                <span><i className="fas fa-lock" aria-hidden="true"></i> Secure login</span>
                                                <span><i className="fas fa-user-check" aria-hidden="true"></i> Trusted agents</span>
                                            </div>

                                            {renderGlobalError}

                                            <div className="row gy-lg-4 gy-3">
                                                {/* Phone Number Field (Required for both login and registration) */}
                                                <div className="col-sm-12">
                                                    <label htmlFor="phone" className="form-label d-flex align-items-center gap-2">
                                                        Mobile Number
                                                        <Tooltip text="Enter a 10-digit Indian mobile number starting with 6-9 (e.g., 9876543210)">
                                                            <i className="far fa-question-circle text-muted field-help-icon"></i>
                                                        </Tooltip>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        inputMode="tel"
                                                        placeholder="Enter 10-digit mobile number"
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
                                                    <small className="text-muted">Enter your 10-digit mobile number (e.g., 9876543210)</small>
                                                </div>

                                                {
                                                    !isLogin && showFirstName && (
                                                        <div className={firstNameCol}>
                                                            <label htmlFor="name" className="form-label">First Name</label>
                                                            <input
                                                                type="text"
                                                                placeholder="First Name"
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
                                                            <label htmlFor="lastName" className="form-label">Last Name</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Last Name"
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
                                                            <label htmlFor="Email" className="form-label">Email</label>
                                                            <input
                                                                type="email"
                                                                inputMode="email"
                                                                placeholder="Email"
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
                                                        Password
                                                        {!isLogin && (
                                                            <Tooltip text="Must be at least 8 characters with uppercase, lowercase, number, and special character">
                                                                <i className="far fa-question-circle text-muted field-help-icon"></i>
                                                            </Tooltip>
                                                        )}
                                                    </label>
                                                    <div className="position-relative">
                                                        <input
                                                            type={`${showPassword ? 'text': 'password'}`}
                                                            placeholder="Enter your password"
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
                                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                                        >
                                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                    </div>
                                                    {renderPasswordError}

                                                    {!isLogin && formik.values.password && (
                                                        <div className="mt-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <small className="text-muted">Password Strength</small>
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
                                                                <small className="text-muted d-block mb-2">Password requirements:</small>
                                                                <ul className="list-unstyled mb-0">
                                                                    <li className="small">
                                                                        <i className={`fas ${formik.values.password.length >= 8 ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        At least 8 characters
                                                                    </li>
                                                                    <li className="small">
                                                                        <i className={`fas ${/[A-Z]/.test(formik.values.password) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        At least 1 uppercase letter
                                                                    </li>
                                                                    <li className="small">
                                                                        <i className={`fas ${/[0-9]/.test(formik.values.password) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                                                                        At least 1 number
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {
                                                    showConfirm && (
                                                        <div className="col-sm-6 col-xs-6">
                                                            <label htmlFor="confirm" className="form-label">Confirm Password</label>
                                                            <div className="position-relative">
                                                                <input 
                                                                    type={`${showConfirmPassword ? 'text': 'password'}`}
                                                                    placeholder="Confirm Password"
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
                                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                                                                    <label className="form-check-label" htmlFor="remember-login">Remember me </label>
                                                                </div>
                                                                <Link to="/contact" className="forgot-password text-decoration-underline text-main text-poppins font-14">Forgot Password?</Link>
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
                                                                <label className="" htmlFor="accept-terms"> I agree with </label>
                                                                <Link to="/policies/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-main">Terms of Service</Link>
                                                                <label className="" htmlFor="accept-terms"> and </label>
                                                                <Link to="/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-decoration-underline text-main">Privacy Policy</Link>
                                                            </div>
                                                        </div>
                                                        {termsError && (
                                                            <span className="text-danger font-12 d-block mt-1">
                                                                You must agree to terms
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
                                                                {isLogin ? 'Logging in...' : 'Registering...'}
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
                                                            <Link to={haveAccountLink} className="link text-main text-decoration-underline font-14 text-poppins">{haveAccountLinkText}</Link>
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

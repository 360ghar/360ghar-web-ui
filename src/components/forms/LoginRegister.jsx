import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from 'react-toastify';
import { useAuthStore } from '../../store';

import LoginRegisterThumb from '/assets/images/thumbs/login-img.avif';

import LazyImage from '../../common/LazyImage';
const LoginRegister = ({titleText, firstNameCol, showFirstName, lastNameCol, showLastName, passwordCol, showConfirm, btnText, showForgotRemember, showTermCondition, haveAccountText, haveAccountLink, haveAccountLinkText, isLogin = false}) => {

    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    // Navigate to Account Page
    const navigate = useNavigate();
    const { login, register, isLoading, error, clearError } = useAuthStore();

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
            .min(6, 'Password must be at least 6 characters')
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
              resetForm({ values: "" });
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
          } catch (err) {
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
        <ToastContainer/>
            <section className="loginRegister padding-y-120">
                <div className="container container-two">
                    <div className="loginRegister-box card common-card">
                        <div className="card-body">
                            <div className="row gy-4">
                                <div className="col-lg-6">
                                    <div className="loginRegister-thumb rounded overflow-hidden me-lg-2 d-flex h-100">
                                        <LazyImage src={LoginRegisterThumb} alt=""/>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="loginRegister-content">
                                        <form onSubmit={formik.handleSubmit} method="POST">
                                            <h3 className="loginRegister__title text-poppins">{titleText} to 360Ghar</h3>
                                            <p className="loginRegister__desc mb-4 font-18">{isLogin ? 'Welcome back to 360Ghar! Please login to continue.' : 'Join 360Ghar to discover your dream property and connect with trusted real estate professionals.'}</p>

                                            {renderGlobalError}

                                            <div className="row gy-lg-4 gy-3">
                                                {/* Phone Number Field (Required for both login and registration) */}
                                                <div className="col-sm-12">
                                                    <label htmlFor="phone" className="form-label">Mobile Number</label>
                                                    <input
                                                        type="tel"
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
                                                    <label htmlFor="your-password" className="form-label">Password</label>
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
                                                        <span className={`password-show-hide ${showPassword ? 'fas fa-eye ': 'fas fa-eye-slash'} `} onClick={()=>handleShowPassword()}> </span>
                                                    </div>
                                                    {renderPasswordError}
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
                                                                <span className={`password-show-hide ${showConfirmPassword ? 'fas fa-eye ': 'fas fa-eye-slash'} `} onClick={()=>handleShowConfirmPassword()}> </span>
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
                                                                    <input className="form-check-input" type="checkbox" value="" id="remember"/>
                                                                    <label className="form-check-label" htmlFor="remember">Remember me </label>
                                                                </div>
                                                                <Link to="#" className="forgot-password text-decoration-underline text-main text-poppins font-14">Forgot Password?</Link>
                                                            </div>
                                                        </div>
                                                    )
                                                }

                                            {
                                                showTermCondition && (
                                                    <div className="col-12 py-2">
                                                        <div className="common-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="remember"/>
                                                            <div className="form-check-label">
                                                                <label className="" htmlFor="remember"> I agree with </label>
                                                                <Link to="/policies/terms-of-service" className="text-decoration-underline text-main">Terms of Service</Link>
                                                                <label className="" htmlFor="remember"> and </label>
                                                                <Link to="/policies/privacy-policy" className="text-decoration-underline text-main">Privacy Policy</Link>
                                                            </div>
                                                        </div>
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
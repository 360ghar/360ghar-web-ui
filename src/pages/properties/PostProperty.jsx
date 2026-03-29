import { useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';

import SEO from '../../common/SEO';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { PROPERTY_TYPE_OPTIONS } from '../../utils/propertyTaxonomy';

const postPropertyTypeOptions = [
    ...PROPERTY_TYPE_OPTIONS,
    { value: 'other', label: 'Other (Tell us more)' }
];

const listingTypeOptions = [
    { value: 'buy', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
    { value: 'short_stay', label: 'Short Stay' }
];

const validationSchema = yup.object({
    full_name: yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full name is required'),
    email: yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    phone: yup.string()
        .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number')
        .required('Phone number is required'),
    property_type: yup.string()
        .required('Please select a property type'),
    property_location: yup.string()
        .min(3, 'Location must be at least 3 characters')
        .required('Property location is required'),
    property_size: yup.string(),
    budget_range: yup.string(),
    listing_type: yup.string(),
    property_description: yup.string(),
    terms_agreement: yup.boolean()
        .oneOf([true], 'You must agree to the Terms of Service and Privacy Policy')
});

const PostPropertyForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    const formik = useFormik({
        initialValues: {
            full_name: '',
            email: '',
            phone: '',
            property_type: '',
            property_location: '',
            property_size: '',
            budget_range: '',
            listing_type: '',
            property_description: '',
            terms_agreement: false
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);
            setGlobalError(null);

            try {
                const response = await fetch('https://formspree.io/f/mwpqglyb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        ...values,
                        phone: `+91${values.phone}`,
                        form_type: 'property_posting',
                    })
                });

                if (response.ok) {
                    setIsSuccess(true);
                    resetForm();
                    toast.success('Your property listing request has been submitted!', {
                        theme: 'colored'
                    });
                } else {
                    throw new Error('Failed to submit form');
                }
            } catch {
                setGlobalError('Failed to submit your request. Please try again.');
                toast.error('Failed to submit your request. Please try again.', {
                    theme: 'colored'
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    if (isSuccess) {
        return (
            <section className="padding-y-120">
                <div className="container container-two">
                    <div className="contact-form bg-white">
                        <div className="section-heading">
                            <span className="section-heading__subtitle bg-gray-100">
                                <span className="text-gradient fw-semibold">Success!</span>
                            </span>
                            <h2 className="section-heading__title">Thank You for Your Interest</h2>
                            <p className="section-heading__desc">We have received your property posting request! Our team will review your details and contact you within 24 hours to help you post your property on 360Ghar.</p>
                        </div>
                        <div className="text-center mt-4">
                            <Link to="/" className="btn btn-main">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="padding-y-120">
            <div className="container container-two">
                <div className="contact-form bg-white">
                    <div className="section-heading">
                        <span className="section-heading__subtitle bg-gray-100">
                            <span className="text-gradient fw-semibold">Post a Property</span>
                        </span>
                        <h2 className="section-heading__title">Ready to List Your Property?</h2>
                        <p className="section-heading__desc">Fill out the form below with basic details about your property, and our expert team will reach out to guide you through the listing process and help you get the best exposure for your property.</p>
                    </div>

                    {globalError && (
                        <div className="alert alert-danger mb-4">{globalError}</div>
                    )}

                    <div className="contact-form__form">
                        <form onSubmit={formik.handleSubmit} className="contact-form__form">
                            <div className="row gy-4">
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="full_name" className="form-label">Full Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        className={`common-input ${formik.touched.full_name && formik.errors.full_name ? 'is-invalid' : ''}`}
                                        placeholder="Full Name"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.full_name}
                                    />
                                    {formik.touched.full_name && formik.errors.full_name && (
                                        <span className="text-danger">{formik.errors.full_name}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="email" className="form-label">Email Address <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className={`common-input ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                        placeholder="Email Address"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <span className="text-danger">{formik.errors.email}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="phone" className="form-label">Phone Number <span className="text-danger">*</span></label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        maxLength={10}
                                        className={`common-input ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
                                        placeholder="10-digit mobile number"
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            formik.setFieldValue('phone', value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.phone}
                                    />
                                    {formik.touched.phone && formik.errors.phone && (
                                        <span className="text-danger">{formik.errors.phone}</span>
                                    )}
                                    <small className="text-muted">Enter 10-digit number (e.g., 9876543210)</small>
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="property_type" className="form-label">Property Type <span className="text-danger">*</span></label>
                                    <div className="select-has-icon icon-black">
                                        <select
                                            id="property_type"
                                            name="property_type"
                                            className={`select common-input ${formik.touched.property_type && formik.errors.property_type ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.property_type}
                                        >
                                            <option value="">Select Property Type</option>
                                            {postPropertyTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formik.touched.property_type && formik.errors.property_type && (
                                        <span className="text-danger">{formik.errors.property_type}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="property_location" className="form-label">Property Location <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="property_location"
                                        name="property_location"
                                        className={`common-input ${formik.touched.property_location && formik.errors.property_location ? 'is-invalid' : ''}`}
                                        placeholder="Property Location (City/Area)"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.property_location}
                                    />
                                    {formik.touched.property_location && formik.errors.property_location && (
                                        <span className="text-danger">{formik.errors.property_location}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="property_size" className="form-label">Property Size</label>
                                    <input
                                        type="text"
                                        id="property_size"
                                        name="property_size"
                                        className="common-input"
                                        placeholder="Property Size (sq ft)"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.property_size}
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="budget_range" className="form-label">Expected Price Range</label>
                                    <input
                                        type="text"
                                        id="budget_range"
                                        name="budget_range"
                                        className="common-input"
                                        placeholder="Expected Price Range"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.budget_range}
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="listing_type" className="form-label">Listing Type</label>
                                    <div className="select-has-icon icon-black">
                                        <select
                                            id="listing_type"
                                            name="listing_type"
                                            className="select common-input"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.listing_type}
                                        >
                                            <option value="">Select Listing Type</option>
                                            {listingTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label htmlFor="property_description" className="form-label">Property Description</label>
                                    <textarea
                                        id="property_description"
                                        name="property_description"
                                        className="common-input"
                                        placeholder="Brief description of your property (optional)"
                                        rows="4"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.property_description}
                                    />
                                </div>
                                <div className="col-12">
                                    <div className="common-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="terms_agreement"
                                            name="terms_agreement"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            checked={formik.values.terms_agreement}
                                        />
                                        <div className="form-check-label">
                                            <label htmlFor="terms_agreement">
                                                I agree to the <Link to="/policies/terms-of-service" className="text-decoration-underline text-main">Terms of Service</Link> and
                                                <Link to="/policies/privacy-policy" className="text-decoration-underline text-main"> Privacy Policy</Link>. I understand that 360Ghar team will contact me to discuss property listing details.
                                            </label>
                                        </div>
                                    </div>
                                    {formik.touched.terms_agreement && formik.errors.terms_agreement && (
                                        <span className="text-danger">{formik.errors.terms_agreement}</span>
                                    )}
                                </div>
                                <div className="col-12">
                                    <button type="submit" disabled={isSubmitting} className="btn btn-main w-100">
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Request Property Listing Assistance
                                                <span className="icon-right"><i className="far fa-paper-plane"></i></span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

const PostProperty = () => {
    return (
        <>
            <SEO title="Post a Property | 360Ghar" description="Request assistance to post your property on 360Ghar." canonical="/post-property" noindex />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">

                {/* Header */}
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText="Post Property"
                    spanClass="icon-right text-gradient"
                    showHeaderBtn={false}
                    showContactNumber={false}
                />

                {/* Post Property Form */}
                <PostPropertyForm />

                {/* Cta */}
                <Cta ctaClass="" />

                {/* Footer */}
                <Footer />

            </main>
        </>
    );
};

export default PostProperty;

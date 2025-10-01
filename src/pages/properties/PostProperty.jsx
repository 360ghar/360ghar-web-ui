import React from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/Cta';
import PageTitle from '../../common/PageTitle';
import { useForm, ValidationError } from '@formspree/react';
import { Link } from 'react-router-dom';

const PostPropertyForm = () => {
    const [state, handleSubmit] = useForm("mwpqglyb");

    if (state.succeeded) {
        return (
            <section className="contact-us-section padding-b-120">
                <div className="container container-two">
                    <div className="contact-form bg-white">
                        <div className="section-heading">
                            <span className="section-heading__subtitle bg-gray-100">
                                <span className="text-gradient fw-semibold">Success!</span>
                            </span>
                            <h2 className="section-heading__title">Thank You for Your Interest</h2>
                            <p className="section-heading__desc">We've received your property posting request! Our team will review your details and contact you within 24 hours to help you post your property on 360Ghar.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="contact-us-section padding-b-120">
            <div className="container container-two">
                <div className="contact-form bg-white">
                    <div className="section-heading">
                        <span className="section-heading__subtitle bg-gray-100">
                            <span className="text-gradient fw-semibold">Post a Property</span>
                        </span>
                        <h2 className="section-heading__title">Ready to List Your Property?</h2>
                        <p className="section-heading__desc">Fill out the form below with basic details about your property, and our expert team will reach out to guide you through the listing process and help you get the best exposure for your property.</p>
                    </div>
                    <div className="contact-form__form">
                        <form onSubmit={handleSubmit} action="https://formspree.io/f/mwpqglyb" method="POST" className="contact-form__form">
                            <div className="row gy-4">
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="full_name"
                                        type="text"
                                        name="full_name"
                                        className="common-input"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="common-input"
                                        placeholder="Email Address"
                                        required
                                    />
                                    <ValidationError
                                        prefix="Email"
                                        field="email"
                                        errors={state.errors}
                                        className="text-danger"
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        className="common-input"
                                        placeholder="Phone Number"
                                        required
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <select
                                        id="property_type"
                                        name="property_type"
                                        className="common-input"
                                        required
                                    >
                                        <option value="">Select Property Type</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="villa">Villa</option>
                                        <option value="plot">Plot</option>
                                        <option value="commercial">Commercial</option>
                                        <option value="office">Office Space</option>
                                        <option value="shop">Shop</option>
                                        <option value="warehouse">Warehouse</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="property_location"
                                        type="text"
                                        name="property_location"
                                        className="common-input"
                                        placeholder="Property Location (City/Area)"
                                        required
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="property_size"
                                        type="text"
                                        name="property_size"
                                        className="common-input"
                                        placeholder="Property Size (sq ft)"
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="budget_range"
                                        type="text"
                                        name="budget_range"
                                        className="common-input"
                                        placeholder="Expected Price Range"
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <select
                                        id="listing_type"
                                        name="listing_type"
                                        className="common-input"
                                    >
                                        <option value="">Listing Type</option>
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <textarea
                                        id="property_description"
                                        name="property_description"
                                        className="common-input"
                                        placeholder="Brief description of your property (optional)"
                                        rows="4"
                                    />
                                </div>
                                <div className="col-12">
                                    <div className="common-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="terms_agreement"
                                            name="terms_agreement"
                                            required
                                        />
                                        <label className="form-check-label" htmlFor="terms_agreement">
                                            I agree to the <Link to="/policies/terms-of-service" className="text-decoration-underline text-main">Terms of Service</Link> and
                                            <Link to="/policies/privacy-policy" className="text-decoration-underline text-main"> Privacy Policy</Link>. I understand that 360Ghar team will contact me to discuss property listing details.
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <button type="submit" disabled={state.submitting} className="btn btn-main w-100">
                                        Request Property Listing Assistance
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
            <PageTitle title="360Ghar - Post a Property" />

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
                <Cta ctaClass=""/>

                {/* Footer */}
                <Footer/>

            </main>
        </>
    );
};

export default PostProperty;

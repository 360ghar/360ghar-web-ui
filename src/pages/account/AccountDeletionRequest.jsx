import { useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { useForm, ValidationError } from '@formspree/react';
import '../../styles/account-deletion.scss';

const AccountDeletionRequest = () => {
    const [state, handleSubmit] = useForm("mwpqglyb");
    const [selectedType, setSelectedType] = useState('account');
    const [selectedReason, setSelectedReason] = useState('');

    const handleTypeChange = (value) => {
        setSelectedType(value);
    };

    const handleReasonChange = (e) => {
        setSelectedReason(e.target.value);
    };

    const handleOptionClick = (value) => {
        handleTypeChange(value);
    };

    const handleKeyPress = (e, value) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTypeChange(value);
        }
    };

    const onFormSubmit = (e) => {
        // Ensure the selected values are included in the form data
        const form = e.target;

        // Update the hidden field with current selection
        if (form.elements.deletion_type) {
            form.elements.deletion_type.value = selectedType;
        }

        handleSubmit(e);
    };

    if (state.succeeded) {
        return (
            <>
            <SEO title="Account Deletion Request | 360Ghar" description="Request deletion of your account or data." canonical="/delete-account" noindex />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText="Post Property"
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <section className="contact-us-section padding-b-120">
                    <div className="container container-two">
                        <div className="contact-form bg-white">
                            <div className="section-heading text-center">
                                <div className="success-icon mb-4">
                                    <div className="success-check">
                                        <i className="fas fa-check-circle text-success"></i>
                                    </div>
                                </div>
                                <span className="section-heading__subtitle bg-gray-100">
                                    <span className="text-gradient fw-semibold">Request Received</span>
                                </span>
                                <h2 className="section-heading__title">Deletion Request Submitted Successfully!</h2>
                                <p className="section-heading__desc">
                                    Thank you for contacting us! We have received your account deletion request and will get back to you within 24 hours.
                                </p>
                                <div className="mt-4">
                                    <a
                                        href="/"
                                        className="btn btn-main"
                                    >
                                        <i className="fas fa-home me-2"></i>
                                        Return to Home
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Cta ctaClass=""/>
                <Footer/>
            </main>
            </>
        );
    }

    return (
        <>
        <SEO title="Account Deletion Request | 360Ghar" description="Request deletion of your account or data." canonical="/delete-account" noindex />
        <OffCanvas />
        <MobileMenu />

        <main className="body-bg">
            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/post-property"
                btnText="Post Property"
                spanClass="icon-right text-gradient"
                showContactNumber={false}
            />

            {/* Account Deletion Request Section */}
            <section className="contact-us-section padding-b-120">
                <div className="container container-two">
                    <div className="contact-form bg-white">
                        <div className="section-heading text-center">
                            <span className="section-heading__subtitle bg-gray-100">
                                <span className="text-gradient fw-semibold">Privacy Request</span>
                            </span>
                            <h2 className="section-heading__title">Account & Data Deletion</h2>
                            <p className="section-heading__desc">
                                Request deletion of your account or personal data from our platform.
                                We take privacy seriously and will process your request promptly.
                            </p>
                        </div>

                        <form onSubmit={onFormSubmit} className="contact-form__form">
                            <input type="hidden" name="form_type" value="account_deletion" />
                            <div className="row gy-4">
                                {/* Email */}
                                <div className="col-lg-12">
                                    <div className="deletion-form-group">
                                        <label htmlFor="user_email" className="form-label">
                                            <i className="fas fa-envelope me-2 text-gradient"></i>
                                            Email Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="user_email"
                                            name="user_email"
                                            className="common-input"
                                            placeholder="Enter your registered email address"
                                            required
                                        />
                                        <ValidationError
                                            prefix="Email"
                                            field="user_email"
                                            errors={state.errors}
                                            className="text-danger mt-2"
                                        />
                                        {/* Hidden field to identify this as a deletion request */}
                                        <input
                                            type="hidden"
                                            name="subject"
                                            value="Account Deletion Request"
                                        />
                                        {/* Hidden field to pass the selected deletion type */}
                                        <input
                                            type="hidden"
                                            name="deletion_type"
                                            value={selectedType}
                                        />
                                    </div>
                                </div>

                                {/* Request Type */}
                                <div className="col-lg-12">
                                    <div className="deletion-form-group">
                                        <label className="form-label">
                                            <i className="fas fa-trash-alt me-2 text-gradient"></i>
                                            What would you like to delete? <span className="text-danger">*</span>
                                        </label>
                                        <div className="deletion-options">
                                            <div
                                                className={`deletion-option ${selectedType === 'account' ? 'active' : ''}`}
                                                onClick={() => handleOptionClick('account')}
                                                onKeyDown={(e) => handleKeyPress(e, 'account')}
                                                tabIndex={0}
                                                role="radio"
                                                aria-checked={selectedType === 'account'}
                                                aria-label="Full Account Deletion"
                                            >
                                                <input
                                                    type="radio"
                                                    id="delete_account"
                                                    name="request_type"
                                                    value="account"
                                                    checked={selectedType === 'account'}
                                                    onChange={() => handleOptionClick('account')}
                                                    required
                                                />
                                                <div className="option-content">
                                                    <div className="option-icon">
                                                        <i className="fas fa-user-times"></i>
                                                    </div>
                                                    <div className="option-details">
                                                        <h5>Full Account Deletion</h5>
                                                        <p>Delete my entire account and all associated data</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`deletion-option ${selectedType === 'personal' ? 'active' : ''}`}
                                                onClick={() => handleOptionClick('personal')}
                                                onKeyDown={(e) => handleKeyPress(e, 'personal')}
                                                tabIndex={0}
                                                role="radio"
                                                aria-checked={selectedType === 'personal'}
                                                aria-label="Personal Information Only"
                                            >
                                                <input
                                                    type="radio"
                                                    id="delete_personal"
                                                    name="request_type"
                                                    value="personal"
                                                    checked={selectedType === 'personal'}
                                                    onChange={() => handleOptionClick('personal')}
                                                />
                                                <div className="option-content">
                                                    <div className="option-icon">
                                                        <i className="fas fa-user-shield"></i>
                                                    </div>
                                                    <div className="option-details">
                                                        <h5>Personal Information Only</h5>
                                                        <p>Delete only my personal information while keeping account</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`deletion-option ${selectedType === 'properties' ? 'active' : ''}`}
                                                onClick={() => handleOptionClick('properties')}
                                                onKeyDown={(e) => handleKeyPress(e, 'properties')}
                                                tabIndex={0}
                                                role="radio"
                                                aria-checked={selectedType === 'properties'}
                                                aria-label="Property Listings Only"
                                            >
                                                <input
                                                    type="radio"
                                                    id="delete_properties"
                                                    name="request_type"
                                                    value="properties"
                                                    checked={selectedType === 'properties'}
                                                    onChange={() => handleOptionClick('properties')}
                                                />
                                                <div className="option-content">
                                                    <div className="option-icon">
                                                        <i className="fas fa-home"></i>
                                                    </div>
                                                    <div className="option-details">
                                                        <h5>Property Listings Only</h5>
                                                        <p>Delete only my property listings and related data</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`deletion-option ${selectedType === 'specific' ? 'active' : ''}`}
                                                onClick={() => handleOptionClick('specific')}
                                                onKeyDown={(e) => handleKeyPress(e, 'specific')}
                                                tabIndex={0}
                                                role="radio"
                                                aria-checked={selectedType === 'specific'}
                                                aria-label="Specific Data"
                                            >
                                                <input
                                                    type="radio"
                                                    id="delete_specific"
                                                    name="request_type"
                                                    value="specific"
                                                    checked={selectedType === 'specific'}
                                                    onChange={() => handleOptionClick('specific')}
                                                />
                                                <div className="option-content">
                                                    <div className="option-icon">
                                                        <i className="fas fa-cog"></i>
                                                    </div>
                                                    <div className="option-details">
                                                        <h5>Specific Data</h5>
                                                        <p>Delete specific data (please specify in details below)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="col-lg-12">
                                    <div className="deletion-form-group">
                                        <label htmlFor="deletion_reason" className="form-label">
                                            <i className="fas fa-question-circle me-2 text-gradient"></i>
                                            Reason for deletion <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="deletion_reason"
                                            name="deletion_reason"
                                            className="common-select"
                                            value={selectedReason}
                                            onChange={handleReasonChange}
                                            required
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="privacy">Privacy concerns</option>
                                            <option value="inactivity">No longer using the platform</option>
                                            <option value="duplicate">Duplicate account</option>
                                            <option value="security">Security concerns</option>
                                            <option value="poor_experience">Poor user experience</option>
                                            <option value="other">Other (please specify)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="col-lg-12">
                                    <div className="deletion-form-group">
                                        <label htmlFor="message" className="form-label">
                                            <i className="fas fa-comment-dots me-2 text-gradient"></i>
                                            Additional Details
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            className="common-textarea"
                                            rows="5"
                                            placeholder="Please provide any additional information about your deletion request..."
                                        ></textarea>
                                        <ValidationError
                                            prefix="Message"
                                            field="message"
                                            errors={state.errors}
                                            className="text-danger mt-2"
                                        />
                                    </div>
                                </div>

                                {/* Important Notice */}
                                <div className="col-lg-12">
                                    <div className="deletion-notice">
                                        <div className="notice-header">
                                            <div className="notice-icon">
                                                <i className="fas fa-exclamation-triangle"></i>
                                            </div>
                                            <h4 className="notice-title">Important Notice</h4>
                                        </div>
                                        <div className="notice-content">
                                            <ul>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    Account deletion is <strong>irreversible</strong>
                                                </li>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    All your data will be <strong>permanently removed</strong>
                                                </li>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    You will lose access to saved properties, messages, and account settings
                                                </li>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    We will verify your identity before processing the request
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="col-lg-12 text-center">
                                    <button
                                        type="submit"
                                        className="btn btn-main btn-deletion"
                                        disabled={state.submitting}
                                    >
                                        {state.submitting ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin me-2"></i>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Submit Deletion Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <Cta ctaClass=""/>
            <Footer/>
        </main>
        </>
    );
};

export default AccountDeletionRequest;

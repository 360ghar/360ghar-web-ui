import React, { useState } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import Cta from '../../components/ui/Cta';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { useForm, ValidationError } from '@formspree/react';

/* Custom CSS for Account Deletion Page */
const customStyles = `
/* Ensure header visibility */
.header {
    position: relative !important;
    z-index: 1000 !important;
}

/* Success screen styles */
.success-check {
    font-size: 4rem;
    color: #28a745;
    margin-bottom: 1rem;
    animation: checkmark 0.6s ease-in-out;
}

@keyframes checkmark {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Deletion form specific styles */
.deletion-form-group {
    margin-bottom: 2rem;
}

.deletion-form-group .form-label {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
}

.deletion-form-group .common-input,
.deletion-form-group .common-select,
.deletion-form-group .common-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e5e5;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #fff;
}

.deletion-form-group .common-input:focus,
.deletion-form-group .common-select:focus,
.deletion-form-group .common-textarea:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.deletion-form-group .common-textarea {
    resize: vertical;
    min-height: 120px;
}

.deletion-options {
    display: grid;
    gap: 1rem;
}

.deletion-option {
    position: relative;
    padding: 1.5rem;
    border: 2px solid #e5e5e5;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;
    user-select: none;
}

.deletion-option:hover {
    border-color: #ff6b35;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.deletion-option.active {
    border-color: #ff6b35 !important;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(255, 107, 53, 0.02)) !important;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.15) !important;
}

.deletion-option.active .option-icon {
    background: linear-gradient(135deg, #ff6b35, #ff8f65) !important;
    color: white !important;
    transform: scale(1.1);
    transition: all 0.3s ease;
}

.deletion-option:not(.active) .option-icon {
    background: #f8f9fa;
    color: #6c757d;
    transition: all 0.3s ease;
}

.deletion-option input[type="radio"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.deletion-option:focus {
    outline: 2px solid #ff6b35;
    outline-offset: 2px;
}

.option-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.option-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.option-details h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
}

.option-details p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

.deletion-notice {
    background: linear-gradient(135deg, #fff3cd, #fff8e1);
    border: 2px solid #ffc107;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 2rem 0;
}

.notice-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.notice-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #ffc107;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.notice-title {
    margin: 0;
    color: #856404;
    font-size: 1.2rem;
    font-weight: 600;
}

.notice-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.notice-content li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem 0;
    color: #856404;
    line-height: 1.5;
}

.notice-content li i {
    color: #ffc107;
    margin-top: 2px;
    flex-shrink: 0;
}

.btn-deletion {
    background: linear-gradient(135deg, #ff6b35, #ff8f65);
    border: none;
    padding: 14px 32px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 50px;
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.btn-deletion:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
    background: linear-gradient(135deg, #ff5722, #ff6b35);
    color: white;
}

.btn-deletion:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .option-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .option-icon {
        margin: 0 auto;
    }

    .notice-header {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }

    .btn-deletion {
        width: 100%;
    }
}
`;

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
            <PageTitle title="360Ghar - Account Deletion Request" />
            <style>{customStyles}</style>
            <main className="body-bg">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/add-new-listing"
                    btnText="Add Listing"
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
        <PageTitle title="360Ghar - Account Deletion Request" />
        <style>{customStyles}</style>

        <main className="body-bg">

            <Header
                headerClass="dark-header has-border"
                headerMenusClass="mx-auto"
                btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                btnLink="/add-new-listing"
                btnText="Add Listing"
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
                                            <option value="privacy">
                                                <i className="fas fa-lock"></i> Privacy concerns
                                            </option>
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

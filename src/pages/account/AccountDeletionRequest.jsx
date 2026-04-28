import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { useForm, ValidationError } from '@formspree/react';
import '../../styles/account-deletion.scss';

const AccountDeletionRequest = () => {
    const { t } = useTranslation('account');
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
            <SEO title={t('deletion.title')} description={t('deletion.description')} canonical="/delete-account" noindex />
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
                                    <span className="text-gradient fw-semibold">{t('deletion.requestReceived')}</span>
                                </span>
                                <h2 className="section-heading__title">{t('deletion.successTitle')}</h2>
                                <p className="section-heading__desc">
                                    {t('deletion.successDesc')}
                                </p>
                                <div className="mt-4">
                                    <I18nLink
                                        to="/"
                                        className="btn btn-main"
                                    >
                                        <i className="fas fa-home me-2"></i>
                                        {t('deletion.returnHome')}
                                    </I18nLink>
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
        <SEO title={t('deletion.title')} description={t('deletion.description')} canonical="/delete-account" noindex />
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

            {/* Account Deletion Request Section */}
            <section className="contact-us-section padding-b-120">
                <div className="container container-two">
                    <div className="contact-form bg-white">
                        <div className="section-heading text-center">
                            <span className="section-heading__subtitle bg-gray-100">
                                <span className="text-gradient fw-semibold">{t('deletion.privacyRequest')}</span>
                            </span>
                            <h2 className="section-heading__title">{t('deletion.heading')}</h2>
                            <p className="section-heading__desc">
                                {t('deletion.description2')}
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
                                            {t('deletion.emailLabel')} <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="user_email"
                                            name="user_email"
                                            className="common-input"
                                            placeholder={t('deletion.emailPlaceholder')}
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
                                            value={t('deletion.subject')}
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
                                            {t('deletion.deleteWhat')} <span className="text-danger">*</span>
                                        </label>
                                        <div className="deletion-options">
                                            <div
                                                className={`deletion-option ${selectedType === 'account' ? 'active' : ''}`}
                                                onClick={() => handleOptionClick('account')}
                                                onKeyDown={(e) => handleKeyPress(e, 'account')}
                                                tabIndex={0}
                                                role="radio"
                                                aria-checked={selectedType === 'account'}
                                                aria-label={t('deletion.fullAccount')}
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
                                                        <h5>{t('deletion.fullAccount')}</h5>
                                                        <p>{t('deletion.fullAccountDesc')}</p>
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
                                                aria-label={t('deletion.personalOnly')}
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
                                                        <h5>{t('deletion.personalOnly')}</h5>
                                                        <p>{t('deletion.personalOnlyDesc')}</p>
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
                                                aria-label={t('deletion.propertiesOnly')}
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
                                                        <h5>{t('deletion.propertiesOnly')}</h5>
                                                        <p>{t('deletion.propertiesOnlyDesc')}</p>
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
                                                aria-label={t('deletion.specificData')}
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
                                                        <h5>{t('deletion.specificData')}</h5>
                                                        <p>{t('deletion.specificDataDesc')}</p>
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
                                            {t('deletion.reasonLabel')} <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="deletion_reason"
                                            name="deletion_reason"
                                            className="common-select"
                                            value={selectedReason}
                                            onChange={handleReasonChange}
                                            required
                                        >
                                            <option value="">{t('deletion.reasonPlaceholder')}</option>
                                            <option value="privacy">{t('deletion.reasonPrivacy')}</option>
                                            <option value="inactivity">{t('deletion.reasonInactivity')}</option>
                                            <option value="duplicate">{t('deletion.reasonDuplicate')}</option>
                                            <option value="security">{t('deletion.reasonSecurity')}</option>
                                            <option value="poor_experience">{t('deletion.reasonPoorExperience')}</option>
                                            <option value="other">{t('deletion.reasonOther')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="col-lg-12">
                                    <div className="deletion-form-group">
                                        <label htmlFor="message" className="form-label">
                                            <i className="fas fa-comment-dots me-2 text-gradient"></i>
                                            {t('deletion.detailsLabel')}
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            className="common-textarea"
                                            rows="5"
                                            placeholder={t('deletion.detailsPlaceholder')}
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
                                            <h4 className="notice-title">{t('deletion.importantNotice')}</h4>
                                        </div>
                                        <div className="notice-content">
                                            <ul>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    <span dangerouslySetInnerHTML={{ __html: t('deletion.noticeIrreversible') }} />
                                                </li>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    <span dangerouslySetInnerHTML={{ __html: t('deletion.noticePermanentlyRemoved') }} />
                                                </li>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    {t('deletion.noticeLoseAccess')}
                                                </li>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    {t('deletion.noticeVerifyIdentity')}
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
                                                {t('deletion.submitting')}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                {t('deletion.submitBtn')}
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

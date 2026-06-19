import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { I18nLink, useI18nNavigate } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import { deletionService } from '../../services/deletionService';
import '../../styles/account-deletion.scss';

const AccountDeletionRequest = () => {
    const { t } = useTranslation('account');
    // CRITICAL FIX (audit 1.3 / 1.12): replace Formspree with our own backend
    // service. Pre-fill the email from the auth store when the user is logged
    // in, but keep the form accessible to anonymous users (GDPR right).
    const navigate = useI18nNavigate();
    const authUser = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [submitting, setSubmitting] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [selectedType, setSelectedType] = useState('account');
    const [selectedReason, setSelectedReason] = useState('');
    const [email, setEmail] = useState(authUser?.email || '');

    const handleTypeChange = (value) => {
        setSelectedType(value);
    };

    const handleReasonChange = (e) => {
        setSelectedReason(e.target.value);
    };

    const handleOptionClick = handleTypeChange;

    const handleKeyPress = (e, value) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTypeChange(value);
        }
    };

    const onFormSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const form = e.target;
            const payload = {
                email: (form.elements.user_email?.value || email || '').trim(),
                deletion_type: selectedType,
                reason: selectedReason,
                message: form.elements.message?.value || '',
            };
            await deletionService.submitDeletionRequest(payload);
            setSucceeded(true);
            toast.success(t('deletion.successTitle'), { theme: 'colored' });
        } catch (err) {
            const msg =
                err?.response?.data?.detail?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                t('deletion.submitError');
            setSubmitError(typeof msg === 'string' ? msg : t('deletion.submitError'));
            toast.error(t('deletion.submitError'), { theme: 'colored' });
        } finally {
            setSubmitting(false);
        }
    };

    // Logged-in users go through the new /auth/delete-account flow: a single
    // confirmation that posts immediately, then signs the user out and
    // redirects to home. Anonymous users keep the legacy GDPR request form
    // so they can still submit a contact email + reason.
    const handleImmediateDelete = async () => {
        if (submitting) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            await useAuthStore.getState().logout({ deleteAccount: true });
            toast.success(t('deletion.successTitle'), { theme: 'colored' });
            navigate('/');
        } catch (err) {
            const msg =
                err?.response?.data?.detail?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                t('deletion.submitError');
            setSubmitError(typeof msg === 'string' ? msg : t('deletion.submitError'));
            toast.error(t('deletion.submitError'), { theme: 'colored' });
        } finally {
            setSubmitting(false);
        }
    };

    if (succeeded) {
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

    // ---- Logged-in branch: simple confirmation screen ----------------------
    // Identified users bypass the multi-step request form and use the
    // /auth/delete-account endpoint (returns 204). After the call we sign
    // them out via `logout({ deleteAccount: true })` and redirect home.
    if (isAuthenticated) {
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

                {/* Authenticated Account Deletion Confirmation */}
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

                            <div className="contact-form__form">
                                {submitError && (
                                    <div className="alert alert-danger" role="alert">
                                        {submitError}
                                    </div>
                                )}

                                {/* Important Notice */}
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
                                                <Trans i18nKey="deletion.noticeIrreversible" components={{ 0: <strong /> }} />
                                            </li>
                                            <li>
                                                <i className="fas fa-check-circle me-2"></i>
                                                <Trans i18nKey="deletion.noticePermanentlyRemoved" components={{ 0: <strong /> }} />
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

                                {/* Confirm Button */}
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-main btn-deletion"
                                        onClick={handleImmediateDelete}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin me-2"></i>
                                                {t('deletion.submitting')}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-user-times me-2"></i>
                                                {t('deletion.submitBtn')}
                                            </>
                                        )}
                                    </button>
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
                            {submitError && (
                                <div className="alert alert-danger" role="alert">
                                    {submitError}
                                </div>
                            )}
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
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
                                                    <Trans i18nKey="deletion.noticeIrreversible" components={{ 0: <strong /> }} />
                                                </li>
                                                <li>
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    <Trans i18nKey="deletion.noticePermanentlyRemoved" components={{ 0: <strong /> }} />
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
                                        disabled={submitting}
                                    >
                                        {submitting ? (
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

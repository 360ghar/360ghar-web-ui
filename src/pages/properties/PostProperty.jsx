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
import { useTranslation, Trans } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import { PROPERTY_TYPE_OPTIONS } from '../../utils/propertyTaxonomy';
import { propertyService } from '../../services/propertyService';
import GooglePlacesInput from '../../common/search/GooglePlacesInput';

const PostPropertyForm = () => {
    const { t } = useTranslation('properties');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    const postPropertyTypeOptions = [
        ...PROPERTY_TYPE_OPTIONS,
        { value: 'other', label: t('postProperty.otherType'), labelKey: 'postProperty.otherType' }
    ];

    const listingTypeOptions = [
        { value: 'buy', label: t('postProperty.forSale') },
        { value: 'rent', label: t('postProperty.forRent') },
        { value: 'short_stay', label: t('postProperty.shortStay') }
    ];

    const validationSchema = yup.object({
        full_name: yup.string()
            .min(2, t('postProperty.validation.nameMin'))
            .required(t('postProperty.validation.nameRequired')),
        email: yup.string()
            .email(t('postProperty.validation.emailInvalid'))
            .required(t('postProperty.validation.emailRequired')),
        phone: yup.string()
            .matches(/^[6-9]\d{9}$/, t('postProperty.validation.phoneInvalid'))
            .required(t('postProperty.validation.phoneRequired')),
        property_type: yup.string()
            .required(t('postProperty.validation.propertyTypeRequired')),
        property_location: yup.string()
            .min(3, t('postProperty.validation.locationMin'))
            .required(t('postProperty.validation.locationRequired')),
        property_size: yup.string(),
        budget_range: yup.string(),
        listing_type: yup.string(),
        property_description: yup.string(),
        terms_agreement: yup.boolean()
            .oneOf([true], t('postProperty.validation.termsRequired'))
    });

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
                // CRITICAL FIX (audit 2.5): previously posted to Formspree,
                // bypassing the property management system. Wire to the app's
                // own propertyService so listings land in the real pipeline.
                // TODO(BACKEND): confirm whether a dedicated "lead" or
                // "owner-inquiry" endpoint is more appropriate than
                // POST /properties/ for this partial data shape. The current
                // form captures lead info (name/phone/location/budget) rather
                // than a full property record.
                await propertyService.createProperty({
                    title: `${values.property_type} - ${values.property_location}`,
                    description: values.property_description || '',
                    property_type: values.property_type,
                    listing_type: values.listing_type || 'rent',
                    location: values.property_location,
                    // Lead contact info (the backend may move these to a
                    // separate owner/lead table).
                    contact_name: values.full_name,
                    contact_email: values.email,
                    contact_phone: `+91${values.phone}`,
                    budget_range: values.budget_range || undefined,
                    property_size: values.property_size || undefined,
                    form_type: 'property_posting',
                });
                setIsSuccess(true);
                resetForm();
                toast.success(t('postProperty.submitSuccess'), {
                    theme: 'colored'
                });
            } catch (err) {
                const msg =
                    err?.response?.data?.detail?.message ||
                    err?.response?.data?.detail ||
                    t('postProperty.submitError');
                setGlobalError(typeof msg === 'string' ? msg : t('postProperty.submitError'));
                toast.error(t('postProperty.submitError'), {
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
                                <span className="text-gradient fw-semibold">{t('postProperty.successSubtitle')}</span>
                            </span>
                            <h2 className="section-heading__title">{t('postProperty.successTitle')}</h2>
                            <p className="section-heading__desc">{t('postProperty.successDescription')}</p>
                        </div>
                        <div className="text-center mt-4">
                            <I18nLink to="/" className="btn btn-main">
                                {t('postProperty.backToHome')}
                            </I18nLink>
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
                            <span className="text-gradient fw-semibold">{t('postProperty.title')}</span>
                        </span>
                        <h2 className="section-heading__title">{t('postProperty.heading')}</h2>
                        <p className="section-heading__desc">{t('postProperty.description')}</p>
                    </div>

                    {globalError && (
                        <div className="alert alert-danger mb-4">{globalError}</div>
                    )}

                    <div className="contact-form__form">
                        <form onSubmit={formik.handleSubmit} className="contact-form__form">
                            <div className="row gy-4">
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="full_name" className="form-label">{t('postProperty.fullName')} <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        className={`common-input ${formik.touched.full_name && formik.errors.full_name ? 'is-invalid' : ''}`}
                                        placeholder={t('postProperty.fullNamePlaceholder')}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.full_name}
                                    />
                                    {formik.touched.full_name && formik.errors.full_name && (
                                        <span className="text-danger">{formik.errors.full_name}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="email" className="form-label">{t('postProperty.emailAddress')} <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className={`common-input ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                        placeholder={t('postProperty.emailPlaceholder')}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <span className="text-danger">{formik.errors.email}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="phone" className="form-label">{t('postProperty.phoneNumber')} <span className="text-danger">*</span></label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        maxLength={10}
                                        className={`common-input ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
                                        placeholder={t('postProperty.phonePlaceholder')}
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
                                    <small className="text-muted">{t('postProperty.phoneHint')}</small>
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="property_type" className="form-label">{t('postProperty.propertyType')} <span className="text-danger">*</span></label>
                                    <div className="select-has-icon icon-black">
                                        <select
                                            id="property_type"
                                            name="property_type"
                                            className={`select common-input ${formik.touched.property_type && formik.errors.property_type ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.property_type}
                                        >
                                            <option value="">{t('postProperty.selectPropertyType')}</option>
                                            {postPropertyTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {t(option.labelKey)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formik.touched.property_type && formik.errors.property_type && (
                                        <span className="text-danger">{formik.errors.property_type}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="property_location" className="form-label">{t('postProperty.propertyLocation')} <span className="text-danger">*</span></label>
                                    {/* UX FIX (audit 2.6): use GooglePlacesInput for location autocomplete
                                        instead of a plain text input, so location data is consistent
                                        with the rest of the app. The selected formatted address is
                                        mirrored into the Formik field via onSelect. */}
                                    <GooglePlacesInput
                                        placeholder={t('postProperty.locationPlaceholder')}
                                        className={`common-input ${formik.touched.property_location && formik.errors.property_location ? 'is-invalid' : ''}`}
                                        onSelect={({ name }) => {
                                            formik.setFieldValue('property_location', name);
                                            formik.setFieldTouched('property_location', true, false);
                                        }}
                                    />
                                    {formik.touched.property_location && formik.errors.property_location && (
                                        <span className="text-danger">{formik.errors.property_location}</span>
                                    )}
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="property_size" className="form-label">{t('postProperty.propertySize')}</label>
                                    <input
                                        type="text"
                                        id="property_size"
                                        name="property_size"
                                        className="common-input"
                                        placeholder={t('postProperty.sizePlaceholder')}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.property_size}
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="budget_range" className="form-label">{t('postProperty.expectedPrice')}</label>
                                    <input
                                        type="text"
                                        id="budget_range"
                                        name="budget_range"
                                        className="common-input"
                                        placeholder={t('postProperty.pricePlaceholder')}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.budget_range}
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <label htmlFor="listing_type" className="form-label">{t('postProperty.listingType')}</label>
                                    <div className="select-has-icon icon-black">
                                        <select
                                            id="listing_type"
                                            name="listing_type"
                                            className="select common-input"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.listing_type}
                                        >
                                            <option value="">{t('postProperty.selectListingType')}</option>
                                            {listingTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label htmlFor="property_description" className="form-label">{t('postProperty.propertyDescription')}</label>
                                    <textarea
                                        id="property_description"
                                        name="property_description"
                                        className="common-input"
                                        placeholder={t('postProperty.descriptionPlaceholder')}
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
                                                <Trans
                                                    i18nKey="postProperty.termsAgreement"
                                                    components={{
                                                        termsLink: <I18nLink to="/policies/terms-of-service" className="text-decoration-underline text-main" />,
                                                        privacyLink: <I18nLink to="/policies/privacy-policy" className="text-decoration-underline text-main" />,
                                                    }}
                                                />
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
                                                {t('postProperty.submitting')}
                                            </>
                                        ) : (
                                            <>
                                                {t('postProperty.submitButton')}
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
    const { t } = useTranslation('properties');
    const [tSeo] = useTranslation('seo');

    return (
        <>
            <SEO title={tSeo('postProperty.title')} description={tSeo('postProperty.description')} canonical="/post-property" noindex />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">

                {/* Header */}
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText={t('postProperty.title')}
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

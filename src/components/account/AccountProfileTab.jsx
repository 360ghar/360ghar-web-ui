import { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store';
import { toast } from 'react-toastify';
import i18n from '../../i18n';

import LazyImage from '../../common/ui/LazyImage';

// AUDIT FIX (1.9): stale-while-revalidate window. If the profile was fetched
// within this window, skip the redundant refetch on remount (e.g. when
// switching tabs rapidly) and serve the cached data immediately. A background
// refresh is NOT triggered to keep the SWR behaviour simple and predictable.
const PROFILE_FRESH_MS = 30 * 1000; // 30s

const AccountProfileTab = () => {
    const { t } = useTranslation(['account', 'forms']);
    const { profile, getProfile, updateProfile, isLoading, error, clearError } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const lastFetchAt = useRef(0);

    useEffect(() => {
        // Stale-while-revalidate: only call getProfile() when there is no
        // cached profile OR the cached profile is older than the fresh window.
        const now = Date.now();
        if (!profile || now - lastFetchAt.current > PROFILE_FRESH_MS) {
            lastFetchAt.current = now;
            getProfile();
        }
    }, [getProfile, profile]);

    const validationSchema = yup.object({
        full_name: yup.string().min(3, () => i18n.t('forms:name.minLength')).required(() => i18n.t('forms:name.required')),
        email: yup.string().email(() => i18n.t('forms:email.invalidFormat')).required(() => i18n.t('forms:email.required')),
        phone: yup.string().matches(/^[+]?\d{10,15}$/, () => i18n.t('forms:phone.genericInvalid')).required(() => i18n.t('forms:phone.genericRequired')),
    });

    const formik = useFormik({
        initialValues: {
            full_name: profile?.full_name || '',
            email: profile?.email || '',
            phone: profile?.phone || '',
            date_of_birth: profile?.date_of_birth || '',
            profile_image_url: profile?.profile_image_url || '',
        },
        validationSchema,
        enableReinitialize: true,

        onSubmit: async (values, { setSubmitting }) => {
            clearError();
            const success = await updateProfile(values);
            setSubmitting(false);

            if (success) {
                setIsEditing(false);
                toast.success(t('account:tabs.profile.updateSuccess'), {
                    theme: "colored",
                });
            } else {
                toast.error(error || t('account:tabs.profile.updateFailed'), {
                    theme: "colored",
                });
            }
        },
    });

    if (isLoading && !profile) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">{t('account:tabs.profile.loadingProfile')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="card common-card mb-4">
                <div className="card-body">
                    <div className="profile-info d-flex gap-4 align-items-center">
                        <div className="profile-info__thumb">
                            <LazyImage
                                src={profile?.profile_image_url || '/assets/images/thumbs/team1.webp'}
                                alt="Profile"
                                className="rounded-circle"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="profile-info__content">
                            <span className="mb-1 fw-semibold text-main text-poppins font-13">{t('account:tabs.profile.propertySeeker')}</span>
                            <h4 className="profile-info__title text-poppins mb-2">{profile?.full_name || t('account:tabs.profile.user')}</h4>
                            <div className="contact-info d-flex gap-3 align-items-center mb-2">
                                <span className="contact-info__icon text-gradient">
                                    <i className="fas fa-envelope"></i>
                                </span>
                                <div className="contact-info__content">
                                    <span className="contact-info__address">{profile?.email || t('account:tabs.profile.noEmail')}</span>
                                </div>
                            </div>
                            <div className="contact-info d-flex gap-3 align-items-center mb-2">
                                <span className="contact-info__icon text-gradient">
                                    <i className="fas fa-phone"></i>
                                </span>
                                <div className="contact-info__content">
                                    <span className="contact-info__address">{profile?.phone || t('account:tabs.profile.noPhone')}</span>
                                </div>
                            </div>
                            {profile?.agent_id && (
                                <div className="contact-info d-flex gap-3 align-items-center mb-2">
                                    <span className="contact-info__icon text-gradient">
                                        <i className="fas fa-user-tie"></i>
                                    </span>
                                    <div className="contact-info__content">
                                        <span className="contact-info__address">{t('account:tabs.profile.agentAssigned')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card common-card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="loginRegister__title text-poppins mb-0">{t('account:tabs.profile.title')}</h6>
                        {!isEditing ? (
                            <button
                                type="button"
                                className="btn btn-sm btn-main"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="fas fa-edit me-2"></i>{t('account:tabs.profile.editProfile')}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    formik.resetForm();
                                }}
                            >
                                <i className="fas fa-times me-2"></i>{t('account:tabs.profile.cancel')}
                            </button>
                        )}
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={formik.handleSubmit}>
                        <div className="row gy-lg-4 gy-3">
                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="profile-full-name" className="form-label">{t('account:tabs.profile.fullName')}</label>
                                <input
                                    id="profile-full-name"
                                    type="text"
                                    name="full_name"
                                    value={formik.values.full_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={!isEditing}
                                    className={`common-input ${!isEditing ? 'bg-light' : ''} ${
                                        formik.touched.full_name && formik.errors.full_name ? "is-invalid" : ""
                                    }`}
                                />
                                {formik.touched.full_name && formik.errors.full_name && (
                                    <div className="text-danger">{formik.errors.full_name}</div>
                                )}
                            </div>

                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="profile-email" className="form-label">{t('account:tabs.profile.email')}</label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={!isEditing}
                                    className={`common-input ${!isEditing ? 'bg-light' : ''} ${
                                        formik.touched.email && formik.errors.email ? "is-invalid" : ""
                                    }`}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <div className="text-danger">{formik.errors.email}</div>
                                )}
                            </div>

                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="profile-phone" className="form-label">{t('account:tabs.profile.phone')}</label>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    name="phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={!isEditing}
                                    className={`common-input ${!isEditing ? 'bg-light' : ''} ${
                                        formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
                                    }`}
                                />
                                {formik.touched.phone && formik.errors.phone && (
                                    <div className="text-danger">{formik.errors.phone}</div>
                                )}
                            </div>

                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="profile-dob" className="form-label">{t('account:tabs.profile.dob')}</label>
                                <input
                                    id="profile-dob"
                                    type="date"
                                    name="date_of_birth"
                                    value={formik.values.date_of_birth}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={!isEditing}
                                    className={`common-input ${!isEditing ? 'bg-light' : ''}`}
                                />
                            </div>

                            <div className="col-sm-12">
                                <label htmlFor="profile-image-url" className="form-label">{t('account:tabs.profile.profileImageUrl')}</label>
                                <input
                                    id="profile-image-url"
                                    type="url"
                                    name="profile_image_url"
                                    value={formik.values.profile_image_url}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={!isEditing}
                                    placeholder="https://example.com/image.jpg"
                                    className={`common-input ${!isEditing ? 'bg-light' : ''}`}
                                />
                            </div>

                            {isEditing && (
                                <div className="col-sm-12">
                                    <button
                                        type="submit"
                                        className="btn btn-main"
                                        disabled={formik.isSubmitting || isLoading}
                                    >
                                        {formik.isSubmitting || isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                {t('account:tabs.profile.updating')}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>{t('account:tabs.profile.saveChanges')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AccountProfileTab;

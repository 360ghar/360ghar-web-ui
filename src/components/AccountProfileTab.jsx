import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useUserStore } from '../store';
import { ToastContainer, toast } from 'react-toastify';

const AccountProfileTab = () => {
    const { profile, getProfile, updateProfile, isLoading, error, clearError } = useUserStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    const validationSchema = yup.object({
        full_name: yup.string().min(3, "Name must be at least 3 characters").required("Name is required"),
        email: yup.string().email("Invalid email format").required("Email is required"),
        phone: yup.string().matches(/^[+]?\d{10,15}$/, 'Enter a valid phone number').required("Phone number is required"),
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
                toast.success("Profile updated successfully!", {
                    theme: "colored",
                });
            } else {
                toast.error(error || "Failed to update profile. Please try again.", {
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
                <p className="mt-2">Loading profile...</p>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <div className="card common-card mb-4">
                <div className="card-body">
                    <div className="profile-info d-flex gap-4 align-items-center">
                        <div className="profile-info__thumb">
                            <img
                                src={profile?.profile_image_url || '/assets/images/thumbs/team1.png'}
                                alt="Profile"
                                className="rounded-circle"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="profile-info__content">
                            <span className="mb-1 fw-semibold text-main text-poppins font-13">Property Seeker</span>
                            <h4 className="profile-info__title text-poppins mb-2">{profile?.full_name || 'User'}</h4>
                            <div className="contact-info d-flex gap-3 align-items-center mb-2">
                                <span className="contact-info__icon text-gradient">
                                    <i className="fas fa-envelope"></i>
                                </span>
                                <div className="contact-info__content">
                                    <span className="contact-info__address">{profile?.email || 'No email provided'}</span>
                                </div>
                            </div>
                            <div className="contact-info d-flex gap-3 align-items-center mb-2">
                                <span className="contact-info__icon text-gradient">
                                    <i className="fas fa-phone"></i>
                                </span>
                                <div className="contact-info__content">
                                    <span className="contact-info__address">{profile?.phone || 'No phone provided'}</span>
                                </div>
                            </div>
                            {profile?.agent_id && (
                                <div className="contact-info d-flex gap-3 align-items-center mb-2">
                                    <span className="contact-info__icon text-gradient">
                                        <i className="fas fa-user-tie"></i>
                                    </span>
                                    <div className="contact-info__content">
                                        <span className="contact-info__address">Agent assigned</span>
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
                        <h6 className="loginRegister__title text-poppins mb-0">Profile Information</h6>
                        {!isEditing ? (
                            <button
                                type="button"
                                className="btn btn-sm btn-main"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="fas fa-edit me-2"></i>Edit Profile
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
                                <i className="fas fa-times me-2"></i>Cancel
                            </button>
                        )}
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={formik.handleSubmit}>
                        <div className="row gy-lg-4 gy-3">
                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="full_name" className="form-label">Full Name</label>
                                <input
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
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
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
                                <label htmlFor="phone" className="form-label">Phone</label>
                                <input
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
                                <label htmlFor="date_of_birth" className="form-label">Date of Birth</label>
                                <input
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
                                <label htmlFor="profile_image_url" className="form-label">Profile Image URL</label>
                                <input
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
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>Save Changes
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
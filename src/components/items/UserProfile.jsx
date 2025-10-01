import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useUserStore } from '../../store';

const ProfileSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Phone number must be valid')
    .required('Phone number is required'),
});

const UserProfile = () => {
  const { profile, getProfile, updateProfile, isLoading, error, clearError } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!profile) getProfile();
  }, [profile, getProfile]);

  if (!profile) {
    return <div className="text-center py-5">Loading profile...</div>;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    clearError();
    setUpdateSuccess(false);
    
    const success = await updateProfile({
      full_name: values.full_name,
      phone: values.phone,
    });
    
    setSubmitting(false);
    
    if (success) {
      setUpdateSuccess(true);
      setIsEditing(false);
    }
  };

  return (
    <div className="user-profile">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Profile Information</h4>
          {!isEditing && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
        <div className="card-body">
          {updateSuccess && (
            <div className="alert alert-success">
              Profile updated successfully!
            </div>
          )}
          
          {error && <div className="alert alert-danger">{error}</div>}

          {isEditing ? (
            <Formik
              initialValues={{
                full_name: profile.full_name || '',
                phone: profile.phone || '',
              }}
              validationSchema={ProfileSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="full_name">Full Name</label>
                    <Field
                      type="text"
                      name="full_name"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="full_name"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
                    <small className="text-muted">
                      Email cannot be changed
                    </small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone">Phone Number</label>
                    <Field
                      type="text"
                      name="phone"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="profile-info">
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Full Name:</div>
                <div className="col-md-9">{profile.full_name}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Email:</div>
                <div className="col-md-9">{profile.email}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Phone:</div>
                <div className="col-md-9">{profile.phone}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Account Created:</div>
                <div className="col-md-9">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 
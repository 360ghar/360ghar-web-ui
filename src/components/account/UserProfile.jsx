import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useUserStore } from '../../store';
import i18n from '../../i18n';

const ProfileSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, () => i18n.t('forms:name.tooShortMin'))
    .max(50, () => i18n.t('forms:name.tooLong'))
    .required(() => i18n.t('forms:name.required')),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, () => i18n.t('forms:phone.mustBeValid'))
    .required(() => i18n.t('forms:phone.genericRequired')),
});

const UserProfile = () => {
  const { profile, getProfile, updateProfile, isUpdateLoading, error, clearError } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const { t } = useTranslation(['account', 'forms']);

  useEffect(() => {
    if (!profile) getProfile();
  }, [profile, getProfile]);

  if (!profile) {
    return <div className="text-center py-5">{t('account:userProfile.loadingProfile')}</div>;
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
          <h4 className="mb-0">{t('account:userProfile.title')}</h4>
          {!isEditing && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setIsEditing(true)}
            >
              {t('account:userProfile.editProfile')}
            </button>
          )}
        </div>
        <div className="card-body">
          {updateSuccess && (
            <div className="alert alert-success">
              {t('account:userProfile.updateSuccess')}
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
                    <label htmlFor="full_name">{t('account:userProfile.fullName')}</label>
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
                    <label htmlFor="email">{t('account:userProfile.email')}</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
                    <small className="text-muted">
                      {t('account:userProfile.emailCannotChange')}
                    </small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone">{t('account:userProfile.phoneNumber')}</label>
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
                      disabled={isSubmitting || isUpdateLoading}
                    >
                      {isUpdateLoading ? t('account:userProfile.saving') : t('account:userProfile.saveChanges')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      {t('account:userProfile.cancel')}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="profile-info">
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">{t('account:userProfile.fullNameLabel')}</div>
                <div className="col-md-9">{profile.full_name}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">{t('account:userProfile.emailLabel')}</div>
                <div className="col-md-9">{profile.email}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">{t('account:userProfile.phoneLabel')}</div>
                <div className="col-md-9">{profile.phone}</div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">{t('account:userProfile.accountCreated')}</div>
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

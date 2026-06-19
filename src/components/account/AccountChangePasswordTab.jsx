import { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import i18n from '../../i18n';

const AccountChangePasswordTab = () => {
  const { t } = useTranslation(['account', 'forms']);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = yup.object({
    currentPassword: yup
      .string()
      .required(() => i18n.t('forms:password.currentRequired')),
    newPassword: yup
      .string()
      .min(8, () => i18n.t('forms:password.minLength'))
      .matches(/[A-Z]/, () => i18n.t('forms:password.mustUppercase'))
      .matches(/[0-9]/, () => i18n.t('forms:password.mustNumber'))
      .required(() => i18n.t('forms:password.newRequired')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], () => i18n.t('forms:password.confirmMustMatch'))
      .required(() => i18n.t('forms:password.confirmRequired')),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);

      try {
        await authService.changePassword(values.currentPassword, values.newPassword);

        toast.success(t('account:tabs.changePassword.changeSuccess'), {
          theme: 'colored',
        });

        resetForm();
      } catch (error) {
        toast.error(error.message || t('account:tabs.changePassword.changeFailed'), {
          theme: 'colored',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // AUDIT FIX (1.imp5): align the password-strength indicator with the
  // registration flow's 5-level system (0–5). Previously this tab used a
  // different 4-level system (0–4) with different colors and labels, which was
  // inconsistent with LoginRegister's RegisterFlow.
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  };

  const passwordStrength = getPasswordStrength(formik.values.newPassword);
  // Mirrors the registration flow: index 0 is the empty/none label, 1–5 map to
  // weak → veryStrong.
  const strengthLabels = [
    '',
    t('forms:password.strength.weak'),
    t('forms:password.strength.fair'),
    t('forms:password.strength.good'),
    t('forms:password.strength.strong'),
    t('forms:password.strength.veryStrong'),
  ];
  const strengthColors = ['#e9ecef', '#dc3545', '#fd7e14', '#ffc107', '#20c997', '#198754'];

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="card common-card">
          <div className="card-body">
            <h6 className="loginRegister__title text-poppins">{t('account:tabs.changePassword.title')}</h6>

            <div className="row gy-lg-4 gy-3">
              <div className="col-12">
                <label htmlFor="current-password" className="form-label">{t('account:tabs.changePassword.currentPassword')}</label>
                <div className="position-relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`common-input ${
                      formik.touched.currentPassword && formik.errors.currentPassword ? 'is-invalid' : ''
                    }`}
                    placeholder={t('account:tabs.changePassword.currentPasswordPlaceholder')}
                    id="current-password"
                    autoComplete="current-password"
                    name="currentPassword"
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="password-show-hide password-toggle-btn"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={showCurrentPassword ? t('account:tabs.changePassword.hideCurrentPassword') : t('account:tabs.changePassword.showCurrentPassword')}
                  >
                    <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                  </button>
                </div>
                {formik.touched.currentPassword && formik.errors.currentPassword && (
                  <div className="text-danger mt-1">{formik.errors.currentPassword}</div>
                )}
              </div>

              <div className="col-12">
                <label htmlFor="new-password" className="form-label">{t('account:tabs.changePassword.newPassword')}</label>
                <div className="position-relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className={`common-input ${
                      formik.touched.newPassword && formik.errors.newPassword ? 'is-invalid' : ''
                    }`}
                    placeholder={t('account:tabs.changePassword.newPasswordPlaceholder')}
                    id="new-password"
                    autoComplete="new-password"
                    name="newPassword"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="password-show-hide password-toggle-btn"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? t('account:tabs.changePassword.hideNewPassword') : t('account:tabs.changePassword.showNewPassword')}
                  >
                    <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                  </button>
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <div className="text-danger mt-1">{formik.errors.newPassword}</div>
                )}

                {formik.values.newPassword && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">{t('forms:password.strengthLabel')}</small>
                      <small style={{ color: strengthColors[passwordStrength] }}>
                        {strengthLabels[passwordStrength]}
                      </small>
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${Math.min((passwordStrength + 1) * 20, 100)}%`,
                          backgroundColor: strengthColors[passwordStrength],
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <small className="text-muted d-block mb-2">{t('forms:password.requirementsLabel')}</small>
                  <ul className="list-unstyled mb-0">
                    <li className="small">
                      <i className={`fas ${formik.values.newPassword.length >= 8 ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                      {t('forms:password.atLeast8')}
                    </li>
                    <li className="small">
                      <i className={`fas ${/[A-Z]/.test(formik.values.newPassword) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                      {t('forms:password.atLeast1Uppercase')}
                    </li>
                    <li className="small">
                      <i className={`fas ${/[0-9]/.test(formik.values.newPassword) ? 'fa-check text-success' : 'fa-circle text-muted'} me-2`}></i>
                      {t('forms:password.atLeast1Number')}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-12">
                <label htmlFor="confirm-password" className="form-label">{t('account:tabs.changePassword.confirmPassword')}</label>
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`common-input ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''
                    }`}
                    placeholder={t('account:tabs.changePassword.confirmPasswordPlaceholder')}
                    id="confirm-password"
                    autoComplete="new-password"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="password-show-hide password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? t('account:tabs.changePassword.hideConfirmPassword') : t('account:tabs.changePassword.showConfirmPassword')}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <div className="text-danger mt-1">{formik.errors.confirmPassword}</div>
                )}
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-main w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {t('account:tabs.changePassword.saving')}
                    </>
                  ) : (
                    t('account:tabs.changePassword.saveChanges')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AccountChangePasswordTab;

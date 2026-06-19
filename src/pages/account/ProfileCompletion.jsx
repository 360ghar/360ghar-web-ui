import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18nNavigate } from '../../i18n/I18nLink';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store';
import api from '../../services/api';
import { authService } from '../../services/authService';
import { getRedirectPathForStage, fetchAuthStage } from '../../utils/authStage';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';

const ProfileCompletion = () => {
    const { t } = useTranslation(['account', 'forms']);
    const navigate = useI18nNavigate();
    const { updateProfile } = useAuthStore();

    // AUDIT FIX (1.6): Do NOT pre-fill the form from the potentially-stale
    // cached user object in the auth store (e.g. right after registration the
    // backend may not have propagated the profile yet, leaving cached fields
    // empty and forcing the user to re-enter data). Instead, fetch a fresh
    // profile on mount and seed the fields from that. While loading, the
    // fields stay blank with clear guidance so the user is never shown stale
    // or empty-but-presented-as-current values.
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPrefilling, setIsPrefilling] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const fresh = await authService.getCurrentUser();
                if (cancelled) return;
                setFullName(fresh?.full_name || fresh?.name || '');
                setDateOfBirth(fresh?.date_of_birth || '');
            } catch {
                // Fresh fetch failed — leave fields blank so the user can
                // enter values explicitly rather than seeing stale cache data.
            } finally {
                if (!cancelled) setIsPrefilling(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) {
            newErrors.fullName = t('forms:fullName.required');
        }
        if (!dateOfBirth) {
            newErrors.dateOfBirth = t('forms:dateOfBirth.required');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const success = await updateProfile({
                full_name: fullName.trim(),
                date_of_birth: dateOfBirth,
            });
            if (success) {
                toast.success(t('profileCompletion.successMessage') || 'Profile updated successfully!');
                // Re-fetch auth stage to determine correct redirect (may be
                // app_onboarding if the backend has additional gates).
                const stage = await fetchAuthStage(api);
                // Write the freshly-fetched stage into the store BEFORE
                // navigating, so the global ProfileCompletionRouteGuard sees
                // the updated stage and doesn't bounce the user back here
                // (loop). If the backend still reports profile_completion
                // (data not saved / backend bug), break the loop by sending
                // the user home with a cleared stage.
                useAuthStore.setState({ authStage: stage === 'profile_completion' ? 'active' : stage });
                navigate(getRedirectPathForStage(stage));
            } else {
                toast.error(t('profileCompletion.errorMessage') || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.message || t('profileCompletion.errorMessage') || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SEO
                title={t('profileCompletion.title') || 'Complete Your Profile'}
                description={t('profileCompletion.description') || 'Please complete your profile to continue'}
                canonical="/profile-completion"
                noindex
            />
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

                <section className="login-section pt-120 pb-120">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-8">
                                <div className="login-wrapper" style={{
                                    background: '#fff',
                                    border: '1px solid var(--border-color-light)',
                                    borderRadius: '18px',
                                    padding: '40px',
                                    boxShadow: '0 12px 24px rgba(16, 24, 40, 0.04)',
                                }}>
                                    <div className="text-center mb-4">
                                        <h3 className="mb-2">{t('profileCompletion.heading') || 'Complete Your Profile'}</h3>
                                        <p className="text-muted">{t('profileCompletion.description') || 'Please provide the following information to continue.'}</p>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label className="form-label">{t('forms:fullName.label') || 'Full Name'}</label>
                                                <input
                                                    type="text"
                                                    autoComplete="name"
                                                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                                    placeholder={t('forms:fullName.placeholder') || 'Enter your full name'}
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    disabled={isLoading || isPrefilling}
                                                    autoFocus
                                                />
                                                {errors.fullName && (
                                                    <div className="invalid-feedback d-block">{errors.fullName}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 mt-3">
                                            <div className="form-group">
                                                <label className="form-label">{t('forms:dateOfBirth.label') || 'Date of Birth'}</label>
                                                <input
                                                    type="date"
                                                    autoComplete="bday"
                                                    className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                                    value={dateOfBirth}
                                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                                    disabled={isLoading || isPrefilling}
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.dateOfBirth && (
                                                    <div className="invalid-feedback d-block">{errors.dateOfBirth}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-main w-100"
                                                disabled={isLoading || isPrefilling}
                                            >
                                                {isPrefilling ? (
                                                    <><i className="fas fa-spinner fa-spin me-2"></i>{t('forms:generic.saving') || 'Loading...'}</>
                                                ) : isLoading ? (
                                                    <><i className="fas fa-spinner fa-spin me-2"></i>{t('forms:generic.saving') || 'Saving...'}</>
                                                ) : (
                                                    t('profileCompletion.submitBtn') || 'Complete Profile'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
};

export default ProfileCompletion;

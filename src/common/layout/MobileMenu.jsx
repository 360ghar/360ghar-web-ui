import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Logo from '../Logo';
import NavMenu from './NavMenu';
import { useAuthStore, useUIStore } from '../../store';
import { useLazyToast } from '../useLazyToast';

import LazyImage from '../ui/LazyImage';
import LanguageSwitcher from './LanguageSwitcher';

const MobileMenu = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('common');
    const { toggleMobileMenu, handleMobileMenuClose } = useUIStore();
    const menuRef = useRef(null);
    const overlayRef = useRef(null);

    // Authentication state
    const { user, isAuthenticated, logout } = useAuthStore();
    const { success: toastSuccess } = useLazyToast();

    useEffect(() => {
        if (!toggleMobileMenu) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                handleMobileMenuClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [toggleMobileMenu, handleMobileMenuClose]);

    useEffect(() => {
        if (!toggleMobileMenu || !menuRef.current) {
            return;
        }

        const focusable = menuRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusable?.focus();
    }, [toggleMobileMenu]);

    const handleLogout = async () => {
        await logout();
        toastSuccess(t('header.loggedOutSuccess'));
        navigate('/');
        handleMobileMenuClose();
    };

    const handleNavigation = (path) => {
        navigate(path);
        handleMobileMenuClose();
    };

    const handleMenuNavigation = () => {
        handleMobileMenuClose();
    };

    return (
        <>
            {/* ==================== Mobile Menu Start Here ==================== */}
            <div
                ref={overlayRef}
                className={`side-overlay ${toggleMobileMenu ? 'show' : ''}`}
                onClick={handleMobileMenuClose}
            />

            <div
                ref={menuRef}
                className={`mobile-menu d-lg-none d-block ${toggleMobileMenu ? 'active' : ''}`}
                aria-hidden={!toggleMobileMenu}
            >
                <button
                    type="button"
                    className="close-button"
                    onClick={handleMobileMenuClose}
                    aria-label="Close menu"
                >
                    <i className="fas fa-times" />
                </button>
                <div className="mobile-menu__inner">

                    {/* Logo */}
                    <Logo/>

                    <div className="mobile-menu__menu">

                        {/* User Authentication Section */}
                        {isAuthenticated && (
                            <div className="mobile-user-section mb-4 p-3 border-bottom border-secondary">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="user-avatar">
                                        {user?.profile_image_url ? (
                                            <LazyImage
                                                src={user.profile_image_url}
                                                alt="Profile"
                                                className="rounded-circle"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="avatar-placeholder rounded-circle bg-main text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white fw-semibold">{user?.full_name || user?.email || 'User'}</div>
                                        <div className="text-white-50 small">{t('mobileMenu.welcomeBack')}</div>
                                    </div>
                                </div>

                                <div className="mobile-user-menu">
                                    <button
                                        className="btn btn-outline-light btn-sm w-100 text-start mb-2"
                                        onClick={() => handleNavigation('/account')}
                                    >
                                        <i className="fas fa-user-circle me-2"></i>
                                        {t('header.myAccount')}
                                    </button>
                                    <button
                                        className="btn btn-outline-light btn-sm w-100 text-start mb-2"
                                        onClick={() => handleNavigation('/account?tab=favorites')}
                                    >
                                        <i className="fas fa-heart me-2"></i>
                                        {t('header.favorites')}
                                    </button>
                                    <button
                                        className="btn btn-outline-light btn-sm w-100 text-start mb-2"
                                        onClick={() => handleNavigation('/account?tab=visits')}
                                    >
                                        <i className="fas fa-calendar me-2"></i>
                                        {t('header.myVisits')}
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm w-100 text-start"
                                        onClick={() => void handleLogout()}
                                    >
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        {t('header.logout')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Nav Menu */}
                        <NavMenu navMenusClass="nav-menu--mobile" onNavigate={handleMenuNavigation} />

                        {/* Authentication Buttons */}
                        {!isAuthenticated && (
                            <div className="mobile-auth-buttons mt-4 d-flex flex-column gap-2">
                                <I18nLink
                                    to="/login"
                                    className="btn btn-outline-light w-100"
                                    onClick={handleMobileMenuClose}
                                >
                                    {t('mobileMenu.signIn')}
                                </I18nLink>
                                <I18nLink
                                    to="/register"
                                    className="btn btn-main w-100"
                                    onClick={handleMobileMenuClose}
                                >
                                    {t('mobileMenu.signUp')}
                                </I18nLink>
                            </div>
                        )}

                        {/* Language Switcher */}
                        <div className="mt-4 pt-3 border-top border-secondary">
                            <LanguageSwitcher variant="dark" className="w-100 justify-content-center" />
                        </div>

                    </div>
                </div>
            </div>
            {/* ==================== Mobile Menu End Here ==================== */}
        </>
    );
};

export default MobileMenu;

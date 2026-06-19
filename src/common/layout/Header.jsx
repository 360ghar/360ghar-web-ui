import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NavMenu from './NavMenu';
import Logo from '../Logo';
import Button from '../ui/Button';
import { I18nLink, useI18nNavigate } from '../../i18n/I18nLink';
import LogoWhite from '../LogoWhite';
import { useAuthStore, useUIStore } from '../../store';
import { useLazyToast } from '../useLazyToast';

import LazyImage from '../ui/LazyImage';
import LanguageSwitcher from './LanguageSwitcher';
const Header = ({
    headerClass = "bg-transparent",
    logoBlack = true,
    logoWhite = false,
    headerMenusClass = "ms-auto menu-right",
    btnLink = "/post-property",
    btnText,
    spanClass = "icon-right",
    showHeaderBtn = true,
    showOffCanvasBtn = true,
    offCanvasBtnClass = ""
}) => {
    const { t } = useTranslation('common');
    const resolvedBtnText = btnText ?? t('header.postProperty');
    const navigate = useI18nNavigate();
    const { toggleMobileMenu, handleMobileMenuClick, handleOffCanvas } = useUIStore();

    // Authentication state
    const { user, isAuthenticated, logout } = useAuthStore();
    const { success: toastSuccess } = useLazyToast();

    // Sticky header Code
    const [stickyHeader, setStickyHeader] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.user-dropdown')) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        // UX FIX (audit 1.6): await logout() so the auth store clears
        // isAuthenticated BEFORE we navigate. This prevents a race with
        // PrivateRoute guards that might briefly redirect to /login.
        await logout();
        toastSuccess(t('header.loggedOutSuccess'));
        setShowUserDropdown(false);
        navigate('/');
    };

    const handleMobileMenuToggle = () => {
        handleMobileMenuClick();
    };

    const handleOffCanvasToggle = () => {
        handleOffCanvas();
    };
    
    useEffect(() => {
        let rafId = 0;
        let prevSticky = false;
        const handleScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const next = window.scrollY > 100;
                if (next !== prevSticky) {
                    prevSticky = next;
                    setStickyHeader(next);
                }
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            {/* UX FIX (audit 5.1): skip-to-content link for keyboard / screen-reader users. */}
            <a href="#main-content" className="skip-link visually-hidden-focusable">
                {t('header.skipToContent')}
            </a>
            {/* ==================== Header Start Here ==================== */}
            <header className={`header ${headerClass} ${stickyHeader ? 'fixed-header' : ''}`}>
                <div className="container container-two">
                    <nav className="header-inner flx-between">

                        {
                            logoBlack && (
                                <div className="logo">
                                    <Logo/>
                                </div>
                            )
                        }

                        {
                            logoWhite && (
                                <div className="logo">
                                    <LogoWhite/>
                                </div>
                            )
                        }

                        {/* Menu Start  */}
                        <div className={`header-menu d-lg-block d-none ${headerMenusClass}`}>
                            <NavMenu navMenusClass="" />
                        </div>
                        {/* Menu End  */}

                        {/* Header Right start */}
                        <div className="header-right flx-align">
                            {/* User Authentication Section */}
                            {isAuthenticated ? (
                                <div className="user-dropdown position-relative d-lg-block d-none">
                                    <button
                                        type="button"
                                        className="user-btn d-flex align-items-center gap-2 text-poppins text-gray-800 fw-500 border-0 bg-transparent"
                                        aria-haspopup="menu"
                                        aria-expanded={showUserDropdown}
                                        aria-controls="user-menu"
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    >
                                        <div className="user-avatar">
                                            {user?.profile_image_url ? (
                                                <LazyImage
                                                    src={user.profile_image_url}
                                                    alt="Profile"
                                                    className="user-avatar-img rounded-circle"
                                                />
                                            ) : (
                                                <div className="user-avatar-placeholder rounded-circle bg-main text-white d-flex align-items-center justify-content-center">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            )}
                                        </div>
                                        <span className="user-name">{user?.full_name || user?.email || 'User'}</span>
                                        <i className={`fas fa-chevron-${showUserDropdown ? 'up' : 'down'} font-12`}></i>
                                    </button>

                                    {showUserDropdown && (
                                        <div id="user-menu" role="menu" className="user-dropdown-menu">
                                            <div className="dropdown-item p-0">
                                                <I18nLink to="/account" role="menuitem" className="dropdown-link d-flex align-items-center gap-3">
                                                    <i className="fas fa-user-circle"></i>
                                                    <span>{t('header.myAccount')}</span>
                                                </I18nLink>
                                            </div>
                                            <div className="dropdown-item p-0">
                                                <I18nLink to="/account?tab=favorites" role="menuitem" className="dropdown-link d-flex align-items-center gap-3">
                                                    <i className="fas fa-heart"></i>
                                                    <span>{t('header.favorites')}</span>
                                                </I18nLink>
                                            </div>
                                            <div className="dropdown-item p-0">
                                                <I18nLink to="/account?tab=visits" role="menuitem" className="dropdown-link d-flex align-items-center gap-3">
                                                    <i className="fas fa-calendar"></i>
                                                    <span>{t('header.myVisits')}</span>
                                                </I18nLink>
                                            </div>
                                            <div className="dropdown-item p-0">
                                                <button
                                                    type="button"
                                                    className="dropdown-link text-danger d-flex align-items-center gap-3 w-100 border-0 bg-transparent"
                                                    role="menuitem"
                                                    onClick={() => void handleLogout()}
                                                >
                                                    <i className="fas fa-sign-out-alt"></i>
                                                    <span>{t('header.logout')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="header-cta-group d-lg-flex align-items-center d-none">
                                    <div className="auth-buttons">
                                        <I18nLink to="/login" className="btn btn-outline-main btn-sm">
                                            <i className="fas fa-sign-in-alt me-2"></i>
                                            {t('header.signIn')}
                                        </I18nLink>
                                    </div>
                                    {showHeaderBtn && (
                                        <Button
                                            btnLink={btnLink}
                                            btnClass="btn-main btn-sm d-lg-block d-none"
                                            btnText={resolvedBtnText}
                                            spanClass={spanClass}
                                            iconClass="fas fa-arrow-right"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Language Switcher - Desktop only */}
                            <div className="d-lg-block d-none">
                                <LanguageSwitcher variant="light" />
                            </div>

                            {
                                showOffCanvasBtn && (
                                    <button type="button" className={`offcanvas-btn d-lg-block d-none ${offCanvasBtnClass}`}
                                        onClick={handleOffCanvasToggle}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 30 24" fill="none">
                                            <line x1="0.0078125" y1="12.293" x2="30.0078" y2="12.293" stroke="#181616" strokeWidth="3"/>
                                            <path d="M5.00781 22.293H30.0078" stroke="#181616" strokeWidth="3"/>
                                            <path d="M10.0078 2.29297H30.0078" stroke="#181616" strokeWidth="3"/>
                                        </svg>
                                    </button>
                                )
                            }

                            {/* Post Property button is included above within header-cta-group for guests */}

                            <button type="button" className="toggle-mobileMenu d-lg-none ms-3"
                                aria-label="Toggle mobile menu"
                                aria-expanded={toggleMobileMenu}
                                onClick={handleMobileMenuToggle}
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                        </div>
                        
                        {/* Header Right End  */}
                    </nav>
                </div>
            </header>
            {/* ==================== Header End Here ==================== */}   
        </>
    );
};

export default Header;

import React, { useContext, useEffect, useState } from 'react';
import NavMenu from './NavMenu';
import Logo from './Logo';
import { MobileMenuContext } from '../contextApi/MobileMenuContext';
import { OffCanvasContext } from '../contextApi/OffCanvasContext';
import { ScrollHideContext } from '../contextApi/ScrollHideContext';
import Button from './Button';
import { Link, useNavigate } from 'react-router-dom';
import LogoWhite from './LogoWhite';
import { useAuthStore } from '../store';
import { ToastContainer, toast } from 'react-toastify';

const Header = ({
    headerClass = "bg-transparent",
    logoBlack = true,
    logoWhite = false,
    headerMenusClass = "ms-auto menu-right",
    btnClass = "btn btn-main d-lg-block d-none",
    btnLink = "/post-property",
    btnText = "Post Property",
    spanClass = "icon-right",
    showHeaderBtn = true,
    showOffCanvasBtn = false,
    offCanvasBtnClass = "",
    showContactNumber = true,
    ...otherProps
}) => {
    const navigate = useNavigate();
    const { handleMobileMenuClick } = useContext(MobileMenuContext);
    const { handleOffCanvas } = useContext(OffCanvasContext);
    const { handleScrollHide, handleScrollHideLg } = useContext(ScrollHideContext);

    // Authentication state
    const { user, isAuthenticated, logout } = useAuthStore();

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

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/');
        setShowUserDropdown(false);
    };
    
    useEffect(() => {
        window.addEventListener('scroll', function() {
            window.scrollY > 100 ? setStickyHeader(true) : setStickyHeader(false)
        });
    }, []);

    return (
        <>
            <ToastContainer />
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
                            {
                                showContactNumber && (
                                    <Link to={`mailto:info@360ghar.com`} className="contact-number text-poppins text-gray-800 fw-500 d-flex align-items-center gap-2">
                                        <span className="icon text-gradient font-20"><i className="fas fa-envelope"></i></span>
                                        <span className="text">info@360ghar.com</span>
                                    </Link>
                                )
                            }

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
                                                <img
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
                                                <Link to="/account" role="menuitem" className="dropdown-link d-flex align-items-center gap-3">
                                                    <i className="fas fa-user-circle"></i>
                                                    <span>My Account</span>
                                                </Link>
                                            </div>
                                            <div className="dropdown-item p-0">
                                                <Link to="/account?tab=favorites" role="menuitem" className="dropdown-link d-flex align-items-center gap-3">
                                                    <i className="fas fa-heart"></i>
                                                    <span>Favorites</span>
                                                </Link>
                                            </div>
                                            <div className="dropdown-item p-0">
                                                <Link to="/account?tab=visits" role="menuitem" className="dropdown-link d-flex align-items-center gap-3">
                                                    <i className="fas fa-calendar"></i>
                                                    <span>My Visits</span>
                                                </Link>
                                            </div>
                                            <div className="dropdown-item p-0">
                                                <button
                                                    type="button"
                                                    className="dropdown-link text-danger d-flex align-items-center gap-3 w-100 border-0 bg-transparent"
                                                    role="menuitem"
                                                    onClick={handleLogout}
                                                >
                                                    <i className="fas fa-sign-out-alt"></i>
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="auth-buttons d-lg-flex align-items-center gap-2 d-none">
                                    <Link to="/login" className="btn btn-outline-main btn-sm">
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn btn-main btn-sm">
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {
                                showOffCanvasBtn && (
                                    <button type="button" className={`offcanvas-btn d-lg-block d-none ${offCanvasBtnClass}`}
                                        onClick={() => { handleOffCanvas(); handleScrollHideLg(); }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 30 24" fill="none">
                                            <line x1="0.0078125" y1="12.293" x2="30.0078" y2="12.293" stroke="#181616" strokeWidth="3"/>
                                            <path d="M5.00781 22.293H30.0078" stroke="#181616" strokeWidth="3"/>
                                            <path d="M10.0078 2.29297H30.0078" stroke="#181616" strokeWidth="3"/>
                                        </svg>
                                    </button>
                                )
                            }

                            {showHeaderBtn && !isAuthenticated && (
                                <Button
                                    btnLink={btnLink}
                                    btnClass={btnClass}
                                    btnText={btnText}
                                    spanClass={spanClass}
                                    iconClass="fas fa-arrow-right"
                                />
                            )}

                            <button type="button" className="toggle-mobileMenu d-lg-none ms-3"
                                onClick={() => { handleMobileMenuClick(); handleScrollHide(); }}
                            >
                                <i className="las la-bars"></i>
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
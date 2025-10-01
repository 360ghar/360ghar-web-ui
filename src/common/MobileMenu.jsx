import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import NavMenu from './NavMenu';
import { MobileMenuContext } from '../contextApi/MobileMenuContext';
import { ScrollHideContext } from '../contextApi/ScrollHideContext';
import Button from './Button';
import { useAuthStore } from '../store';
import { toast } from 'react-toastify';

const MobileMenu = () => {
    const navigate = useNavigate();
    const { toggleMobileMenu, handleMobileMenuClose } = useContext(MobileMenuContext);
    const { handleScrollHideClose } = useContext(ScrollHideContext);

    // Authentication state
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/');
        handleMobileMenuClose();
        handleScrollHideClose();
    };

    const handleNavigation = (path) => {
        navigate(path);
        handleMobileMenuClose();
        handleScrollHideClose();
    }; 
    
    return (
        <>
            {/* ==================== Mobile Menu Start Here ==================== */}
            <div className={`side-overlay ${toggleMobileMenu ? 'show' : "" }`} onClick={()=> {handleMobileMenuClose(); handleScrollHideClose(); }}></div>
            
            <div className={`mobile-menu d-lg-none d-block ${toggleMobileMenu ? 'active' : "" }`}>
                <button type="button" className="close-button" onClick={ ()=> {handleMobileMenuClose(); handleScrollHideClose(); }}>
                    <i className="las la-times"></i> 
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
                                            <img
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
                                        <div className="text-white-50 small">Welcome back!</div>
                                    </div>
                                </div>

                                <div className="mobile-user-menu">
                                    <button
                                        className="btn btn-outline-light btn-sm w-100 text-start mb-2"
                                        onClick={() => handleNavigation('/account')}
                                    >
                                        <i className="fas fa-user-circle me-2"></i>
                                        My Account
                                    </button>
                                    <button
                                        className="btn btn-outline-light btn-sm w-100 text-start mb-2"
                                        onClick={() => handleNavigation('/account?tab=favorites')}
                                    >
                                        <i className="fas fa-heart me-2"></i>
                                        Favorites
                                    </button>
                                    <button
                                        className="btn btn-outline-light btn-sm w-100 text-start mb-2"
                                        onClick={() => handleNavigation('/account?tab=visits')}
                                    >
                                        <i className="fas fa-calendar me-2"></i>
                                        My Visits
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm w-100 text-start"
                                        onClick={handleLogout}
                                    >
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Nav Menu */}
                        <NavMenu navMenusClass="nav-menu--mobile" />

                        {/* Authentication Buttons */}
                        {!isAuthenticated && (
                            <div className="mobile-auth-buttons mt-4 d-flex flex-column gap-2">
                                <Link
                                    to="/login"
                                    className="btn btn-outline-light w-100"
                                    onClick={() => { handleMobileMenuClose(); handleScrollHideClose(); }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-main w-100"
                                    onClick={() => { handleMobileMenuClose(); handleScrollHideClose(); }}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            {/* ==================== Mobile Menu End Here ==================== */}
        </>
    );
};

export default MobileMenu;
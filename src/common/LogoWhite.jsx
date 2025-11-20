import React from 'react';
import { Link } from 'react-router-dom';

import LogoWhiteImage from '/assets/images/logo/logo.png';

import LazyImage from './LazyImage';
const LogoWhite = () => {
    return (
        <>
            <Link to="/" className="mobile-menu__logo">
                <LazyImage src={LogoWhiteImage} alt="Logo" priority />
            </Link>   
        </>
    );
};

export default LogoWhite;

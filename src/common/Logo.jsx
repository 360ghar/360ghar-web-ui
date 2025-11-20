import React from 'react';

import LogoImg from '/assets/images/logo/logo.png';
import { Link } from 'react-router-dom';

import LazyImage from './LazyImage';
const Logo = () => {
    return   (
        <>
            <Link to="/" className="link">
                <LazyImage src={LogoImg} alt="Logo" priority />
            </Link>
        </>
    );
};

export default Logo;    

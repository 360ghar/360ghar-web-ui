import { Link } from 'react-router-dom';
import LazyImage from './ui/LazyImage';

const LogoWhite = () => {
    return (
        <Link to="/" className="mobile-menu__logo">
            <LazyImage
                src="/assets/images/logo/logo.webp"
                srcSet="/assets/images/logo/logo-320w.webp 320w, /assets/images/logo/logo-640w.webp 640w"
                sizes="150px"
                alt="360Ghar Logo"
                priority
                width={150}
                height={150}
                style={{ height: 'auto', maxHeight: '50px', width: 'auto' }}
            />
        </Link>
    );
};

export default LogoWhite;

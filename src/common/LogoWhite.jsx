import { I18nLink } from '../i18n/I18nLink';
import LazyImage from './ui/LazyImage';

const LogoWhite = () => {
    return (
        <I18nLink to="/" className="mobile-menu__logo">
            <LazyImage
                src="/assets/images/logo/logo.webp"
                srcSet="/assets/images/logo/logo-320w.webp 320w, /assets/images/logo/logo-640w.webp 640w"
                sizes="150px"
                alt="360Ghar Logo"
                width={150}
                height={150}
                style={{ height: 'auto', maxHeight: '50px', width: 'auto' }}
            />
        </I18nLink>
    );
};

export default LogoWhite;

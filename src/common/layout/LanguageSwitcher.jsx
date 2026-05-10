import { useLocation, useNavigate } from 'react-router-dom';
import useLocaleStore from '../../store/localeStore';
import { localizePath, stripLocalePrefix } from '../../i18n/I18nLink';
import i18n from '../../i18n';

const LOCALE_LABELS = { en: 'EN', hi: 'HI' };

export default function LanguageSwitcher({ className = '', variant = 'light' }) {
  const { locale, setLocale } = useLocaleStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSwitch = () => {
    const nextLocale = locale === 'en' ? 'hi' : 'en';
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    const barePath = stripLocalePrefix(currentUrl);

    // Update Zustand store
    setLocale(nextLocale);

    // Update i18next language
    i18n.changeLanguage(nextLocale);

    // Update html lang attribute
    document.documentElement.lang = nextLocale;

    // Persist preference
    try {
      localStorage.setItem('i18nextLng', nextLocale);
    } catch {
      // Ignore
    }

    // Navigate to the localized path
    if (nextLocale === 'hi') {
      navigate(localizePath(barePath, 'hi'), { replace: true });
    } else {
      navigate(barePath, { replace: true });
    }
  };

  return (
    <button
      onClick={handleSwitch}
      className={`language-switcher language-switcher--${variant} ${className}`}
      aria-label={`Switch to ${locale === 'en' ? 'Hindi' : 'English'}`}
      title={`Switch to ${locale === 'en' ? 'हिंदी' : 'English'}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {LOCALE_LABELS[locale === 'en' ? 'hi' : 'en']}
    </button>
  );
}

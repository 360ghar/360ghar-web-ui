import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation('common');

    useEffect(() => {
        const handleScroll = () => {
            // UX FIX (audit 5.10): only appear after meaningful scroll so it
            // isn't distracting on short pages.
            setVisible(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    };

    return (
        <button
            type="button"
            className="scrollToTop"
            style={{ visibility: visible ? 'visible' : 'hidden' }}
            onClick={scrollToTop}
            aria-label={t('scrollToTop')}
        >
            <i className="fas fa-chevron-up text-gradient"></i>
        </button>
    );
};

export default ScrollToTop;
import { useState, useEffect } from 'react';

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 200);
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
            aria-label="Scroll to top"
        >
            <i className="fas fa-chevron-up text-gradient"></i>
        </button>
    );
};

export default ScrollToTop;
import { useEffect, useMemo, useRef, useState }  from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink, I18nNavLink } from '../../i18n/I18nLink';
import { navMenus } from '../../data/CommonData';

const NavMenu = (props) => {
    const { t } = useTranslation('common');

    const [activeIndex, setActiveIndex] = useState(null);
    const navRef = useRef(null);
    const navContainerRef = useRef(null);
    const measureItemRefs = useRef([]);
    const moreMeasureRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(navMenus.length);
    const isMobileMenu = props.navMenusClass?.includes('nav-menu--mobile');

    const visibleMenus = useMemo(() => (
        isMobileMenu ? navMenus : navMenus.slice(0, visibleCount)
    ), [isMobileMenu, visibleCount]);

    const overflowMenus = useMemo(() => (
        isMobileMenu ? [] : navMenus.slice(visibleCount)
    ), [isMobileMenu, visibleCount]);

    const closeMenus = () => {
        setActiveIndex(null);
    };

    const handleNavigate = () => {
        closeMenus();
        props.onNavigate?.();
    };

    const handleDropdownOpen = (e, index, hasSubmenu) => {
        if (hasSubmenu) {
            e.preventDefault();
            e.stopPropagation();
        }
        setActiveIndex((currentIndex) => currentIndex === index ? null : index);
    };

    const getActiveClass = ({ isActive }) => isActive ? 'nav-menu__link active' : 'nav-menu__link';

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveIndex(null);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setActiveIndex(null);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        if (isMobileMenu) {
            return;
        }

        const calculateVisibleItems = () => {
            if (!navContainerRef.current || typeof window === 'undefined') {
                return;
            }

            if (window.innerWidth > 1920) {
                setVisibleCount(navMenus.length);
                return;
            }

            const containerWidth = navContainerRef.current.getBoundingClientRect().width;
            const itemWidths = measureItemRefs.current.map((item) => item?.getBoundingClientRect().width || 0);
            const moreWidth = moreMeasureRef.current?.getBoundingClientRect().width || 90;

            let used = 0;
            let nextVisibleCount = 0;

            for (let i = 0; i < itemWidths.length; i += 1) {
                const remainingItems = itemWidths.length - (i + 1);
                const reserveForMore = remainingItems > 0 ? moreWidth : 0;

                if (used + itemWidths[i] + reserveForMore <= containerWidth) {
                    used += itemWidths[i];
                    nextVisibleCount = i + 1;
                } else {
                    break;
                }
            }

            setVisibleCount(Math.max(0, nextVisibleCount));
        };

        const rafId = requestAnimationFrame(calculateVisibleItems);
        const resizeObserver = new ResizeObserver(() => {
            calculateVisibleItems();
        });

        if (navContainerRef.current) {
            resizeObserver.observe(navContainerRef.current);
        }

        window.addEventListener('resize', calculateVisibleItems);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            window.removeEventListener('resize', calculateVisibleItems);
        };
    }, [isMobileMenu]);

    const renderNavItem = (navMenu, index, customKey = null) => {
        const hasSubmenu = navMenu.submenus && navMenu.submenus.length > 0;
        const itemKey = customKey || `menu-${index}`;

        return (
            <li
                className={`nav-menu__item ${hasSubmenu ? 'has-submenu' : ''} ${activeIndex === itemKey ? 'active' : ''}`}
                key={itemKey}
            >
                {hasSubmenu ? (
                    <button
                        type="button"
                        className="nav-menu__link bg-transparent border-0"
                        onClick={(e) => handleDropdownOpen(e, itemKey, hasSubmenu)}
                        aria-haspopup="menu"
                        aria-expanded={activeIndex === itemKey}
                        aria-controls={`submenu-${itemKey}`}
                    >
                        {navMenu.textKey ? t(navMenu.textKey) : navMenu.text}
                    </button>
                ) : (
                    <I18nNavLink to={navMenu.path} className={getActiveClass} onClick={handleNavigate}>{navMenu.textKey ? t(navMenu.textKey) : navMenu.text}</I18nNavLink>
                )}
                {hasSubmenu && (
                    <ul className="nav-submenu" id={`submenu-${itemKey}`}>
                        {navMenu.submenus.map((submenu, subIndex) => (
                            <li className="nav-submenu__item" key={subIndex}>
                                <I18nLink to={submenu.path} className="nav-submenu__link" onClick={handleNavigate}>{submenu.textKey ? t(submenu.textKey) : submenu.text}</I18nLink>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <>
            <div className="nav-menu-wrapper" ref={navRef}>
                <div className="nav-menu-container" ref={navContainerRef}>
                    <ul className={`nav-menu flx-align ${props.navMenusClass}`}>
                        {visibleMenus.map((navMenu, index) => renderNavItem(navMenu, index))}

                        {!isMobileMenu && overflowMenus.length > 0 && (
                            <li className={`nav-menu__item has-submenu nav-menu__item--more ${activeIndex === 'more-menu' ? 'active' : ''}`}>
                                <button
                                    type="button"
                                    className="nav-menu__link bg-transparent border-0"
                                    onClick={(e) => handleDropdownOpen(e, 'more-menu', true)}
                                    aria-haspopup="menu"
                                    aria-expanded={activeIndex === 'more-menu'}
                                    aria-controls="submenu-more-menu"
                                >
                                    {t('nav.more', 'More')}
                                </button>
                                <ul className="nav-submenu nav-submenu--more" id="submenu-more-menu">
                                    {overflowMenus.map((menuItem, menuIndex) => (
                                        menuItem.submenus?.length ? (
                                            <li className="nav-submenu__item nav-submenu__item--group" key={`overflow-${menuIndex}`}>
                                                <span className="nav-submenu__heading">{menuItem.textKey ? t(menuItem.textKey) : menuItem.text}</span>
                                                <ul className="nav-submenu__nested">
                                                    {menuItem.submenus.map((submenu, subIndex) => (
                                                        <li className="nav-submenu__item" key={`overflow-sub-${subIndex}`}>
                                                            <I18nLink to={submenu.path} className="nav-submenu__link" onClick={handleNavigate}>{submenu.textKey ? t(submenu.textKey) : submenu.text}</I18nLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ) : (
                                            <li className="nav-submenu__item" key={`overflow-${menuIndex}`}>
                                                <I18nLink to={menuItem.path} className="nav-submenu__link" onClick={handleNavigate}>{menuItem.textKey ? t(menuItem.textKey) : menuItem.text}</I18nLink>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>

                {!isMobileMenu && (
                    <ul className="nav-menu nav-menu--measure" aria-hidden="true">
                        {navMenus.map((menu, index) => (
                            <li className={`nav-menu__item ${menu.submenus?.length ? 'has-submenu' : ''}`} key={`measure-${index}`} ref={(element) => { measureItemRefs.current[index] = element; }}>
                                <span className="nav-menu__link">{menu.textKey ? t(menu.textKey) : menu.text}</span>
                            </li>
                        ))}
                        <li className="nav-menu__item has-submenu nav-menu__item--more" ref={moreMeasureRef}>
                            <span className="nav-menu__link">{t('nav.more', 'More')}</span>
                        </li>
                    </ul>
                )}
            </div>
        </>
    );
};

export default NavMenu;


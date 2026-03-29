import { useEffect, useMemo, useState } from 'react';
import { addListings } from '../../data/OthersPageData';

const ListingSidebar = () => {
    const sectionIds = useMemo(
        () => addListings.map((item) => item.link.replace(/^#/, '')),
        []
    );
    const [activeSection, setActiveSection] = useState(sectionIds[0] || '');

    useEffect(() => {
        if (sectionIds.length === 0 || typeof window === 'undefined') return undefined;

        const updateActiveSection = () => {
            const scrollOffset = 160;
            const currentSection = [...sectionIds]
                .reverse()
                .find((sectionId) => {
                    const section = document.getElementById(sectionId);
                    return Boolean(section && section.getBoundingClientRect().top <= scrollOffset);
                });

            if (currentSection) {
                setActiveSection(currentSection);
                return;
            }

            const hashSection = window.location.hash.replace(/^#/, '');
            if (hashSection && sectionIds.includes(hashSection)) {
                setActiveSection(hashSection);
                return;
            }

            setActiveSection(sectionIds[0]);
        };

        updateActiveSection();
        window.addEventListener('scroll', updateActiveSection, { passive: true });
        window.addEventListener('hashchange', updateActiveSection);

        return () => {
            window.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('hashchange', updateActiveSection);
        };
    }, [sectionIds]);

    const handleSectionClick = (event, sectionId) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        event.preventDefault();
        setActiveSection(sectionId);
        window.history.replaceState(null, '', `#${sectionId}`);
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <div className="listing-sidebar">
                <ul id="list-scroll" className="sidebar-list d-flex flex-column gap-2">
                    {
                        addListings.map((addListing, addListingIndex) => {
                            const sectionId = addListing.link.replace(/^#/, '');
                            return (
                                <li className="sidebar-list__item" key={addListingIndex}>
                                    <a
                                        href={addListing.link}
                                        className={`sidebar-list__link ${activeSection === sectionId ? 'active' : ''}`}
                                        onClick={(event) => handleSectionClick(event, sectionId)}
                                    >
                                        {addListing.text}
                                    </a>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>   
        </>
    );
};

export default ListingSidebar;

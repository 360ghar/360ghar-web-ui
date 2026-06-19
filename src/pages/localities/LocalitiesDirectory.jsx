import { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { useLocalitiesIndex } from '../../hooks/useLocalitiesIndex';

// Render locality groups in progressive batches to avoid mounting hundreds of
// DOM nodes at once when the directory first loads.
const GROUPS_PER_BATCH = 6;

const LocalitiesDirectory = () => {
    const { t } = useTranslation();
    const [tSeo] = useTranslation('seo');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    // Lazily load the (464 KB) localities index chunk — keeps it out of the
    // initial bundle and off the first-paint critical path.
    const { data: localities, loading } = useLocalitiesIndex();

    const entityTypes = useMemo(() => {
        const types = new Set(localities.map((item) => item.entityType || item.type || 'Locality'));
        return ['all', ...Array.from(types).sort((a, b) => a.localeCompare(b))];
    }, [localities]);

    const filteredLocalities = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return localities.filter((item) => {
            const itemType = item.entityType || item.type || 'Locality';
            const matchesType = selectedType === 'all' || itemType === selectedType;

            if (!matchesType) return false;
            if (!normalizedSearch) return true;

            return item.name.toLowerCase().includes(normalizedSearch);
        });
    }, [localities, searchQuery, selectedType]);

    const groupedLocalities = useMemo(() => {
        return filteredLocalities.reduce((groups, item) => {
            const letter = item.name.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(item);
            return groups;
        }, {});
    }, [filteredLocalities]);

    const letters = useMemo(() => Object.keys(groupedLocalities).sort((a, b) => a.localeCompare(b)), [groupedLocalities]);

    // Progressive rendering: mount a few letter groups at a time, appending more
    // when the sentinel nears the viewport. Resets whenever the filter changes.
    const [visibleCount, setVisibleCount] = useState(GROUPS_PER_BATCH);
    const sentinelRef = useRef(null);

    // Reset visible count when filters change — derived during render instead of
    // useEffect to satisfy the react-hooks/set-state-in-effect lint rule.
    // React supports conditional setState during render as long as it's guarded.
    const [prevSearch, setPrevSearch] = useState(searchQuery);
    const [prevType, setPrevType] = useState(selectedType);
    if (prevSearch !== searchQuery || prevType !== selectedType) {
        setPrevSearch(searchQuery);
        setPrevType(selectedType);
        setVisibleCount(GROUPS_PER_BATCH);
    }

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || visibleCount >= letters.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + GROUPS_PER_BATCH);
                }
            },
            { rootMargin: '400px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [visibleCount, letters.length]);

    const latestVerification = useMemo(() => {
        const values = localities
            .map((item) => item.lastVerifiedAt)
            .filter(Boolean)
            .map((value) => new Date(value))
            .filter((date) => !Number.isNaN(date.getTime()));

        if (!values.length) return 'Not available';

        const latestDate = values.sort((a, b) => b.getTime() - a.getTime())[0];
        return latestDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }, [localities]);

    const structuredData = useMemo(() => {
        const siteUrl = siteMetadata.siteUrl.replace(/\/$/, '');
        const topLocalities = [
            { name: 'DLF Phase 1', slug: 'dlf-phase-1-gurgaon' },
            { name: 'Golf Course Road', slug: 'golf-course-road-gurgaon' },
            { name: 'Sushant Lok 1', slug: 'sushant-lok-1-gurgaon' },
            { name: 'Sohna Road', slug: 'sohna-road-gurgaon' },
            { name: 'Sector 29', slug: 'sector-29-gurgaon' },
        ];

        const itemList = {
            '@type': 'ItemList',
            name: 'Top Gurugram Localities on 360Ghar',
            description: 'Discover verified locality pages with neighbourhood intelligence, connectivity notes, and property listings across Gurugram.',
            numberOfItems: topLocalities.length,
            itemListElement: topLocalities.map((loc, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: loc.name,
                url: `${siteUrl}/locality/${loc.slug}`,
            })),
        };

        const breadcrumb = generateBreadcrumbStructuredData([
            { name: 'Home', url: `${siteUrl}/` },
            { name: 'Localities', url: `${siteUrl}/localities` },
        ]);

        return [itemList, breadcrumb];
    }, []);

    return (
        <>
            <SEO
                title={tSeo('localitiesDirectory.title')}
                description={tSeo('localitiesDirectory.description')}
                keywords="Gurgaon localities, Gurugram localities directory, sectors in Gurgaon, Gurgaon locality prices, Gurugram neighborhood guide, best areas in Gurgaon, property prices Gurgaon sectors"
                canonical="/localities"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={structuredData}
            />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg locality-directory-v2">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText={t('common:header.postProperty')}
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <section className="locality-directory-v2__hero">
                    <div className="container container-two">
                        <div className="locality-directory-v2__hero-card">
                            <div className="row g-4 align-items-end">
                                <div className="col-lg-8">
                                    <span className="locality-section__eyebrow">Locality Discovery</span>
                                    <h1 className="locality-directory-v2__title">Explore Gurugram Localities with Verified Insights</h1>
                                    <p className="locality-directory-v2__desc mb-0">
                                        Compare sectors, neighborhoods, and premium pockets with structured insights before you shortlist properties.
                                    </p>
                                </div>
                                <div className="col-lg-4">
                                    <div className="locality-directory-v2__metrics">
                                        <div className="locality-stat-card">
                                            <span className="locality-stat-card__label">Total localities</span>
                                            <strong className="locality-stat-card__value">{localities.length}</strong>
                                        </div>
                                        <div className="locality-stat-card">
                                            <span className="locality-stat-card__label">Latest verification</span>
                                            <strong className="locality-stat-card__value">{latestVerification}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mt-2 mb-4">
                            <div className="col-lg-4">
                                <div className="locality-stat-card h-100">
                                    <span className="locality-stat-card__label">Coverage snapshot</span>
                                    <strong className="locality-stat-card__value">Neighborhood, sector, and project intelligence</strong>
                                    <p className="text-muted mb-0">Use this directory to jump into verified locality pages before you start comparing listings.</p>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="locality-stat-card h-100">
                                    <span className="locality-stat-card__label">Best for searchers</span>
                                    <strong className="locality-stat-card__value">Shortlist localities faster</strong>
                                    <p className="text-muted mb-0">Filter by locality type, scan the alphabetized directory, and move directly into detailed locality pages.</p>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="locality-stat-card h-100">
                                    <span className="locality-stat-card__label">Popular jumps</span>
                                    <p className="mb-0 d-flex flex-wrap gap-2">
                                        <I18nLink to="/locality/dlf-phase-1-gurgaon" className="btn btn-outline-main btn-sm">DLF Phase 1</I18nLink>
                                        <I18nLink to="/locality/golf-course-road-gurgaon" className="btn btn-outline-main btn-sm">Golf Course Road</I18nLink>
                                        <I18nLink to="/locality/sushant-lok-1-gurgaon" className="btn btn-outline-main btn-sm">Sushant Lok 1</I18nLink>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="locality-directory-v2__filters">
                            <div className="row g-3 align-items-center">
                                <div className="col-lg-7">
                                    <label className="form-label locality-filter-label" htmlFor="locality-search">Search locality</label>
                                    <div className="position-relative">
                                        <i className="fas fa-search locality-filter-icon" aria-hidden="true"></i>
                                        <input
                                            id="locality-search"
                                            type="text"
                                            className="form-control locality-filter-input"
                                            placeholder="Search by locality or sector"
                                            value={searchQuery}
                                            onChange={(event) => setSearchQuery(event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-3">
                                    <label className="form-label locality-filter-label" htmlFor="locality-type">Type</label>
                                    <select
                                        id="locality-type"
                                        className="form-select locality-filter-select"
                                        value={selectedType}
                                        onChange={(event) => setSelectedType(event.target.value)}
                                    >
                                        <option value="all">All locality types</option>
                                        {entityTypes.filter((type) => type !== 'all').map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-main w-100 locality-filter-reset"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedType('all');
                                        }}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <div className="locality-directory-v2__result-row">
                                <p className="mb-0">
                                    Showing <strong>{filteredLocalities.length}</strong> localities
                                    {selectedType !== 'all' ? ` in ${selectedType}` : ''}
                                </p>
                                <div className="locality-directory-v2__letters">
                                    {letters.slice(0, 18).map((letter) => (
                                        <a key={letter} href={`#locality-letter-${letter}`} className="locality-letter-chip">
                                            {letter}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="locality-directory-v2__content padding-b-80">
                    <div className="container container-two">
                        {loading ? (
                            <div className="locality-empty-state">
                                <h2 className="h3 mb-2">Loading localities…</h2>
                                <p className="text-muted mb-0">Indexing verified Gurugram neighborhoods.</p>
                            </div>
                        ) : filteredLocalities.length === 0 ? (
                            <div className="locality-empty-state">
                                <h2 className="h3 mb-2">No localities found</h2>
                                <p className="text-muted mb-4">Try a different search term or reset filters to browse the full directory.</p>
                                <button
                                    type="button"
                                    className="btn btn-main"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedType('all');
                                    }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="locality-directory-v2__group-list">
                                {letters.slice(0, visibleCount).map((letter) => (
                                    <section id={`locality-letter-${letter}`} className="locality-directory-group" key={letter}>
                                        <div className="locality-directory-group__header">
                                            <span>{letter}</span>
                                        </div>
                                        <div className="row g-3">
                                            {groupedLocalities[letter].map((loc) => (
                                                <div className="col-sm-6 col-lg-4" key={loc.slug}>
                                                    <I18nLink to={`/locality/${loc.slug}-gurgaon`} className="locality-directory-card text-decoration-none">
                                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                                            <h3 className="locality-directory-card__title mb-0">{loc.name}</h3>
                                                            <span className="locality-directory-card__type">{loc.entityType || loc.type || 'Locality'}</span>
                                                        </div>
                                                        <p className="locality-directory-card__meta mb-0">{loc.city || 'Gurugram'} • Verified locality insights</p>
                                                    </I18nLink>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                                {visibleCount < letters.length && (
                                    <div ref={sentinelRef} className="text-center py-4 text-muted" aria-hidden="true">
                                        <span>Loading more localities…</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <section className="padding-y-60 bg-white">
                    <div className="container container-two">
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <h2 className="h3 mb-3">How to use this locality directory</h2>
                                <p className="text-muted mb-0">
                                    Start with a neighborhood or sector you already know, then compare nearby pockets before you open listing pages. Each locality page is designed to help you evaluate fit before you spend time on visits.
                                </p>
                            </div>
                            <div className="col-lg-6">
                                <h2 className="h3 mb-3">What you will find on locality pages</h2>
                                <ul className="check-list style-two mb-0">
                                    <li className="check-list__item d-flex align-items-center"><span className="icon"><i className="fas fa-check"></i></span><span className="text fw-semibold">Connectivity notes, nearby areas, and neighborhood context</span></li>
                                    <li className="check-list__item d-flex align-items-center"><span className="icon"><i className="fas fa-check"></i></span><span className="text fw-semibold">Verification dates and structured locality signals</span></li>
                                    <li className="check-list__item d-flex align-items-center"><span className="icon"><i className="fas fa-check"></i></span><span className="text fw-semibold">Direct paths into verified property search on 360Ghar</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* AUDIT FIX (4.3): add CTA section to localities directory */}
                <Cta ctaClass="" />

                <Footer />
            </main>
        </>
    );
};

export default LocalitiesDirectory;

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';

let localitiesDataPromise = null;
let cachedLocalitiesData = null;

async function getLocalitiesData() {
    if (cachedLocalitiesData) return cachedLocalitiesData;
    if (!localitiesDataPromise) {
        localitiesDataPromise = import('../../data/localities.json').then((m) => {
            cachedLocalitiesData = m.default;
            return cachedLocalitiesData;
        });
    }
    return localitiesDataPromise;
}

const LocalitiesDirectory = () => {
    const [localities, setLocalities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        let cancelled = false;

        async function loadLocalities() {
            try {
                const data = await getLocalitiesData();
                if (!cancelled) {
                    const sorted = data.slice().sort((a, b) => a.name.localeCompare(b.name));
                    setLocalities(sorted);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load localities:', error);
                if (!cancelled) {
                    setLocalities([]);
                    setIsLoading(false);
                }
            }
        }

        loadLocalities();
        return () => { cancelled = true; };
    }, []);

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

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Discover Localities in Gurgaon | 360Ghar"
                description="Explore all sectors, colonies, and prime areas in Gurgaon. Get locality insights, verified inventory, and neighborhood intelligence in one place."
                keywords="Gurgaon localities, sectors in Gurgaon, colony search Gurgaon, Gurgaon neighborhood guide"
                canonical="/localities"
                image={siteMetadata.defaultOgImage}
                type="website"
            />
            <PageTitle title="Browse Localities | 360Ghar" />

            <OffCanvas />
            <MobileMenu />

            <main className="body-bg locality-directory-v2">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText="Post Property"
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <section className="locality-directory-v2__hero">
                    <div className="container container-two">
                        <div className="locality-directory-v2__hero-card">
                            <div className="row g-4 align-items-end">
                                <div className="col-lg-8">
                                    <span className="locality-section__eyebrow">Locality Discovery</span>
                                    <h1 className="locality-directory-v2__title">Explore Gurgaon Localities with Verified Insights</h1>
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
                        {filteredLocalities.length === 0 ? (
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
                                {letters.map((letter) => (
                                    <section id={`locality-letter-${letter}`} className="locality-directory-group" key={letter}>
                                        <div className="locality-directory-group__header">
                                            <span>{letter}</span>
                                        </div>
                                        <div className="row g-3">
                                            {groupedLocalities[letter].map((loc) => (
                                                <div className="col-sm-6 col-lg-4" key={loc.slug}>
                                                    <Link to={`/locality/${loc.slug}-gurgaon`} className="locality-directory-card text-decoration-none">
                                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                                            <h3 className="locality-directory-card__title mb-0">{loc.name}</h3>
                                                            <span className="locality-directory-card__type">{loc.entityType || loc.type || 'Locality'}</span>
                                                        </div>
                                                        <p className="locality-directory-card__meta mb-0">{loc.city || 'Gurgaon'} • Verified locality insights</p>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
};

export default LocalitiesDirectory;

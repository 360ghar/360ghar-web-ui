import { useParams, Navigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import PropertyTwo from '../../components/property/PropertyTwo';
import Cta from '../../components/ui/Cta';
import LocalityHero from '../../components/locality/LocalityHero';
import LocalityAmenities from '../../components/locality/LocalityAmenities';
import ConnectivitySection from '../../components/locality/ConnectivitySection';
import NearbyLocalities from '../../components/locality/NearbyLocalities';
import LocalityFaq from '../../components/locality/LocalityFaq';

let localitiesDataPromise = null;
let cachedLocalitiesData = null;

const HERO_IMAGES = [
    '/assets/images/thumbs/property-details-1.png',
    '/assets/images/thumbs/property-details-2.webp',
    '/assets/images/thumbs/property-details-3.webp',
    '/assets/images/thumbs/property-details-4.webp',
    '/assets/images/thumbs/project-details.webp',
    '/assets/images/thumbs/banner-img.webp'
];

const SECTION_LINKS = [
    { href: '#locality-overview', label: 'Overview', icon: 'fa-compass' },
    { href: '#locality-amenities', label: 'Amenities', icon: 'fa-tree' },
    { href: '#locality-connectivity', label: 'Connectivity', icon: 'fa-route' },
    { href: '#locality-properties', label: 'Listings', icon: 'fa-building' },
    { href: '#locality-nearby', label: 'Nearby', icon: 'fa-map-marked-alt' },
    { href: '#locality-faq', label: 'FAQ', icon: 'fa-question-circle' }
];

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

const toTitleCase = (value = '') => value
    .toString()
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value) => {
    if (!value) return 'Not Available';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Not Available';

    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const getMarketStatus = (confidence) => {
    if (typeof confidence !== 'number') {
        return {
            label: 'Market monitored',
            tone: 'neutral'
        };
    }

    if (confidence >= 0.8) {
        return {
            label: 'Strong demand signals',
            tone: 'positive'
        };
    }

    if (confidence >= 0.6) {
        return {
            label: 'Active demand signals',
            tone: 'positive'
        };
    }

    return {
        label: 'Emerging demand signals',
        tone: 'neutral'
    };
};

const getHeroImage = (slug = '') => {
    if (!slug) return HERO_IMAGES[0];
    const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return HERO_IMAGES[hash % HERO_IMAGES.length];
};

const getNearbyLocalities = (localityInfo, allLocalities) => {
    if (!localityInfo || !Array.isArray(allLocalities)) return [];

    const currentSlug = localityInfo.slug;
    const city = localityInfo.city;
    const nearbyFromContent = Array.isArray(localityInfo.contentBlocks?.nearby)
        ? localityInfo.contentBlocks.nearby
        : [];

    const normalizedFromContent = nearbyFromContent
        .map((entry) => {
            if (typeof entry === 'string') {
                return allLocalities.find((item) => item.slug === entry || item.name.toLowerCase() === entry.toLowerCase());
            }

            if (entry && typeof entry === 'object') {
                return allLocalities.find((item) => item.slug === entry.slug || item.name.toLowerCase() === String(entry.name || '').toLowerCase());
            }

            return null;
        })
        .filter(Boolean)
        .filter((item, index, arr) => arr.findIndex((candidate) => candidate.slug === item.slug) === index)
        .filter((item) => item.slug !== currentSlug)
        .slice(0, 6);

    if (normalizedFromContent.length > 0) return normalizedFromContent;

    return allLocalities
        .filter((item) => item.slug !== currentSlug && item.city === city)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 6);
};

const buildAmenityItems = (localityName, city) => [
    {
        icon: 'fa-route',
        title: 'Road Access',
        description: `Efficient links from ${localityName} to major travel corridors across ${city}.`
    },
    {
        icon: 'fa-subway',
        title: 'Transit Convenience',
        description: `Public transit options support daily travel for residents and working professionals.`
    },
    {
        icon: 'fa-hospital',
        title: 'Healthcare Reach',
        description: `Nearby clinics and hospitals offer reliable access to essential healthcare services.`
    },
    {
        icon: 'fa-graduation-cap',
        title: 'Schools and Education',
        description: `Families can access multiple school options and learning hubs in surrounding sectors.`
    },
    {
        icon: 'fa-shopping-bag',
        title: 'Retail and Daily Needs',
        description: `Grocery, convenience retail, and food outlets are available within easy reach.`
    },
    {
        icon: 'fa-home',
        title: 'Lifestyle Comfort',
        description: `Residential pockets and neighborhood facilities support long-term livability.`
    }
];

const buildConnectivityItems = (localityName, city) => [
    {
        icon: 'fa-subway',
        name: 'Metro Network',
        details: `Commuters in ${localityName} can plan practical routes through Gurgaon's metro corridors.`
    },
    {
        icon: 'fa-road',
        name: 'Arterial Roads',
        details: `Road connectivity supports daily travel to business, education, and retail hubs in ${city}.`
    },
    {
        icon: 'fa-plane-departure',
        name: 'Airport Accessibility',
        details: 'Intercity and airport travel is manageable for business professionals and frequent flyers.'
    },
    {
        icon: 'fa-briefcase',
        name: 'Office Connectivity',
        details: 'Key employment centers remain reachable for regular workday commuting.'
    }
];

const LocalityTemplate = () => {
    const params = useParams();
    const slugWithSuffix = params['slug-gurgaon'] || '';
    const slug = slugWithSuffix.replace(/-gurgaon$/i, '');

    const [localityInfo, setLocalityInfo] = useState(null);
    const [allLocalities, setAllLocalities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadLocality() {
            try {
                const data = await getLocalitiesData();
                if (!cancelled) {
                    const found = data.find((loc) => loc.slug === slug);
                    setLocalityInfo(found || null);
                    setAllLocalities(data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load localities data:', error);
                if (!cancelled) {
                    setLocalityInfo(null);
                    setAllLocalities([]);
                    setIsLoading(false);
                }
            }
        }

        loadLocality();
        return () => { cancelled = true; };
    }, [slug]);

    const computed = useMemo(() => {
        if (!localityInfo) return null;

        const localityName = localityInfo.name;
        const localitySlug = localityInfo.slug;
        const city = localityInfo.city || 'Gurgaon';
        const entityType = toTitleCase(localityInfo.entityType || localityInfo.type || 'Locality');
        const aliases = Array.isArray(localityInfo.aliases) ? localityInfo.aliases : [];
        const description = localityInfo.description || `Find verified properties, pricing trends, and locality insights in ${localityName}, ${city}.`;
        const overview = localityInfo.contentBlocks?.overview || `${localityName} is an established ${entityType.toLowerCase()} within ${city} with consistent buyer and tenant interest.`;
        const connectivitySummary = localityInfo.contentBlocks?.connectivity || `Compare road, metro, and business-hub connectivity for ${localityName} before finalizing your move.`;
        const marketSignals = localityInfo.contentBlocks?.marketSignals || `Monitor listing momentum and buyer demand indicators for ${localityName}.`;

        const marketStatus = getMarketStatus(localityInfo.confidence);
        const confidenceLabel = typeof localityInfo.confidence === 'number'
            ? `${Math.round(localityInfo.confidence * 100)}% confidence`
            : 'Confidence unavailable';

        const lastVerified = formatDate(localityInfo.lastVerifiedAt);
        const sourceCount = Array.isArray(localityInfo.sourceCoverage) ? localityInfo.sourceCoverage.length : 0;
        const heroImage = getHeroImage(localitySlug);

        const heroStats = [
            { label: 'Data confidence', value: confidenceLabel },
            { label: 'Entity type', value: entityType },
            { label: 'Last verified', value: lastVerified },
            { label: 'Coverage sources', value: `${sourceCount || 1} source${sourceCount === 1 ? '' : 's'}` }
        ];

        const highlights = [
            marketSignals,
            connectivitySummary,
            `Explore verified listings and 360 tours from ${localityName} through 360Ghar.`
        ];

        const quickFacts = [
            { label: 'Market status', value: marketStatus.label },
            { label: 'Locality type', value: entityType },
            { label: 'Last verified', value: lastVerified },
            { label: 'Alias names', value: aliases.length > 0 ? aliases.slice(0, 3).join(', ') : 'No alternate names listed' }
        ];

        return {
            localityName,
            localitySlug,
            city,
            entityType,
            aliases,
            description,
            overview,
            connectivitySummary,
            marketSignals,
            marketStatus,
            heroImage,
            heroStats,
            highlights,
            quickFacts,
            lastVerified,
            confidenceLabel
        };
    }, [localityInfo]);

    const nearbyLocalities = useMemo(() => getNearbyLocalities(localityInfo, allLocalities), [localityInfo, allLocalities]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!computed) {
        return <Navigate to="/properties" replace />;
    }

    const breadcrumbs = [
        { name: 'Home', url: 'https://360ghar.com/' },
        { name: `Properties in ${computed.city}`, url: 'https://360ghar.com/properties' },
        { name: `${computed.localityName}, ${computed.city}`, url: `https://360ghar.com/locality/${computed.localitySlug}-gurgaon` }
    ];

    const localityStructuredData = [
        generateBreadcrumbStructuredData(breadcrumbs),
        {
            '@type': 'Place',
            name: `${computed.localityName}, ${computed.city}`,
            description: computed.description,
            address: {
                '@type': 'PostalAddress',
                addressLocality: computed.city,
                addressRegion: 'Haryana',
                addressCountry: 'IN'
            }
        },
        {
            '@type': 'WebPage',
            name: `${computed.localityName}, ${computed.city}`,
            url: `https://360ghar.com/locality/${computed.localitySlug}-gurgaon`,
            dateModified: localityInfo.lastVerifiedAt || new Date().toISOString().split('T')[0]
        }
    ];

    return (
        <>
            <SEO
                title={localityInfo?.seo?.title || `${computed.localityName}, ${computed.city} | Real Estate Guide | 360Ghar`}
                description={localityInfo?.seo?.description || computed.description}
                keywords={localityInfo?.seo?.keywords || `${computed.localityName} ${computed.city} real estate, properties in ${computed.localityName}`}
                canonical={`/locality/${computed.localitySlug}-gurgaon`}
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={localityStructuredData}
            />
            <PageTitle title={`${computed.localityName}, ${computed.city} | 360Ghar Localities`} />

            <OffCanvas />
            <MobileMenu />

            <main className="body-bg locality-page-v2">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText="Post Property"
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                <LocalityHero
                    localityName={computed.localityName}
                    city={computed.city}
                    entityType={computed.entityType}
                    description={computed.description}
                    heroImage={computed.heroImage}
                    stats={computed.heroStats}
                    marketStatus={computed.marketStatus.label}
                />

                <section className="locality-anchor-strip">
                    <div className="container container-two">
                        <div className="locality-anchor-strip__inner" role="navigation" aria-label="Locality sections">
                            {SECTION_LINKS.map((item) => (
                                <a key={item.href} href={item.href} className="locality-anchor-strip__chip">
                                    <i className={`fas ${item.icon}`} aria-hidden="true"></i>
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="padding-y-60">
                    <div className="container container-two">
                        <div className="row g-4 g-xl-5">
                            <div className="col-xl-8">
                                <section id="locality-overview" className="locality-section locality-overview-v2">
                                    <div className="locality-section__head locality-section__head--compact">
                                        <span className="locality-section__eyebrow">Overview</span>
                                        <h2 className="locality-section__title mb-2">About {computed.localityName}</h2>
                                        <p className="locality-section__desc mb-0">{computed.overview}</p>
                                    </div>

                                    <div className="locality-editorial-card mt-4">
                                        <p className="mb-3">{computed.marketSignals}</p>
                                        <p className="mb-0">{computed.connectivitySummary}</p>
                                    </div>

                                    <div className="locality-highlights mt-4">
                                        {computed.highlights.map((text) => (
                                            <div className="locality-highlight-item" key={text}>
                                                <i className="fas fa-circle-check" aria-hidden="true"></i>
                                                <span>{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <LocalityAmenities
                                    localityName={computed.localityName}
                                    items={buildAmenityItems(computed.localityName, computed.city)}
                                />

                                <ConnectivitySection
                                    localityName={computed.localityName}
                                    summary={computed.connectivitySummary}
                                    items={buildConnectivityItems(computed.localityName, computed.city)}
                                />

                                <section id="locality-properties" className="locality-section locality-properties-v2">
                                    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 locality-section__head locality-section__head--compact">
                                        <div>
                                            <span className="locality-section__eyebrow">Verified Listings</span>
                                            <h2 className="locality-section__title mb-2">Properties in {computed.localityName}</h2>
                                            <p className="locality-section__desc mb-0">Explore active inventory and shortlist the right fit with on-ground verification support.</p>
                                        </div>
                                        <Link to="/properties" className="btn btn-outline-main rounded-pill">View Full Property Map</Link>
                                    </div>

                                    <div className="locality-property-shell mt-4">
                                        <PropertyTwo
                                            sectionClass="property-two locality-property-two"
                                            containerClass="locality-property-two__container"
                                            renderHeading={false}
                                            showTabs={false}
                                            maxItems={6}
                                            gridItemClass="col-md-6"
                                            propertyItemClass="style-two locality-compact-card"
                                            showFeatureBadges={false}
                                        />
                                    </div>
                                </section>

                                <NearbyLocalities
                                    currentLocality={computed.localityName}
                                    items={nearbyLocalities}
                                    city={computed.city}
                                />

                                <LocalityFaq localityName={computed.localityName} entityType={computed.entityType} />
                            </div>

                            <aside className="col-xl-4">
                                <div className="locality-sidebar-v2">
                                    <article className="locality-sidebar-card">
                                        <p className="locality-sidebar-card__eyebrow">Quick Facts</p>
                                        <h3 className="locality-sidebar-card__title">{computed.localityName} Snapshot</h3>
                                        <div className="locality-fact-list">
                                            {computed.quickFacts.map((fact) => (
                                                <div className="locality-fact-list__item" key={fact.label}>
                                                    <span>{fact.label}</span>
                                                    <strong>{fact.value}</strong>
                                                </div>
                                            ))}
                                        </div>
                                        <Link to="/contact" className="btn btn-main w-100 mt-4 rounded-pill">Get Locality Report</Link>
                                    </article>

                                    <article className="locality-sidebar-card locality-sidebar-card--dark">
                                        <p className="locality-sidebar-card__eyebrow">Need Expert Help?</p>
                                        <h3 className="locality-sidebar-card__title">Book a Personalized Consultation</h3>
                                        <p className="mb-4">Talk to our local property advisors for a curated shortlist in {computed.localityName}.</p>
                                        <Link to="/contact" className="btn btn-outline-light w-100 rounded-pill mb-2">Talk to an Expert</Link>
                                        <Link to="/post-property" className="btn btn-light w-100 rounded-pill">List Your Property</Link>
                                    </article>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>

                <Cta ctaClass="bg-white" />
                <Footer />
            </main>
        </>
    );
};

export default LocalityTemplate;

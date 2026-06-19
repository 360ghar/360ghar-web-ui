import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { I18nLink, localizePath } from '../../i18n/I18nLink';
import useLocaleStore from '../../store/localeStore';
import { useState, useEffect, useMemo } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData, generateLocalityStructuredData, generateEeaSignals } from '../../seo/structuredData';
import PropertyTwo from '../../components/property/PropertyTwo';
import Cta from '../../components/ui/Cta';
import LocalityHero from '../../components/locality/LocalityHero';
import LocalityAmenities from '../../components/locality/LocalityAmenities';
import ConnectivitySection from '../../components/locality/ConnectivitySection';
import NearbyLocalities from '../../components/locality/NearbyLocalities';
import LocalityFaq, { defaultFaqBuilder } from '../../components/locality/LocalityFaq';
import { getLocalityLandingLinks } from '../../utils/internalLinks';

let localitiesDataPromise = null;
let cachedLocalitiesData = null;

const HERO_IMAGES = [
    '/assets/images/thumbs/property-details-1.webp',
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

/**
 * Build amenity items that vary by entityType so that sector, society, project,
 * and other entity types get distinct amenity descriptions instead of identical
 * templates across all 3,195 pages.
 */
const buildAmenityItems = (localityName, city, entityType = 'locality') => {
    const rawEntityType = entityType.toLowerCase();

    // Sector-specific amenities
    if (rawEntityType === 'sector') {
        return [
            {
                icon: 'fa-route',
                title: 'Sector Road Network',
                description: `Planned sector roads in ${localityName} provide structured access to arterial highways and internal commercial zones across ${city}.`
            },
            {
                icon: 'fa-subway',
                title: 'Public Transit Access',
                description: `${localityName} benefits from city transit planning with bus routes and nearby metro stations serving daily commuters.`
            },
            {
                icon: 'fa-hospital',
                title: 'Healthcare Facilities',
                description: `Multi-specialty hospitals and clinics within the sector or adjacent sectors offer comprehensive medical support.`
            },
            {
                icon: 'fa-graduation-cap',
                title: 'Schools and Institutions',
                description: `Reputed schools and coaching centres operate within ${localityName}, reducing commute time for families with children.`
            },
            {
                icon: 'fa-shopping-bag',
                title: 'Sector Market Complexes',
                description: `Local markets and convenience stores in ${localityName} cater to daily household needs without requiring inter-sector travel.`
            },
            {
                icon: 'fa-gavel',
                title: 'Regulatory Framework',
                description: `Properties in ${localityName} fall under HUDA/HSVP sector guidelines. Verify circle rates and RERA compliance before purchase.`
            }
        ];
    }

    // Society-specific amenities
    if (rawEntityType === 'society') {
        return [
            {
                icon: 'fa-shield-alt',
                title: 'Gated Security',
                description: `${localityName} typically offers gated entry with security personnel, CCTV surveillance, and visitor management for resident safety.`
            },
            {
                icon: 'fa-tree',
                title: 'Internal Green Spaces',
                description: `Landscaped gardens, jogging tracks, and children's play areas within ${localityName} support an active outdoor lifestyle.`
            },
            {
                icon: 'fa-swimming-pool',
                title: 'Club and Recreation',
                description: `Many societies in ${city} feature clubhouses with swimming pools, gymnasiums, and community halls for resident use.`
            },
            {
                icon: 'fa-tools',
                title: 'Maintenance Services',
                description: `${localityName} is expected to have a resident welfare association (RWA) managing maintenance, housekeeping, and common-area upkeep.`
            },
            {
                icon: 'fa-parking',
                title: 'Dedicated Parking',
                description: `Covered or basement parking slots are typically allocated to residents, with visitor parking managed at the society gate.`
            },
            {
                icon: 'fa-bolt',
                title: 'Power and Water Backup',
                description: `Societies in ${city} commonly provide power backup for common areas and elevators, along with water storage and supply systems.`
            }
        ];
    }

    // Project-specific amenities
    if (rawEntityType === 'project') {
        return [
            {
                icon: 'fa-hard-hat',
                title: 'Builder and Developer',
                description: `${localityName} is a registered real estate project. Verify the builder's track record, delivery history, and RERA registration status.`
            },
            {
                icon: 'fa-key',
                title: 'Possession Status',
                description: `Check whether ${localityName} is ready-to-move, under construction, or in pre-launch phase before committing. Possession timelines impact investment returns.`
            },
            {
                icon: 'fa-file-contract',
                title: 'RERA Compliance',
                description: `Projects in ${city} must be registered under H-RERA. Verify the project's RERA number, approved plans, and compliance status on the official portal.`
            },
            {
                icon: 'fa-layer-group',
                title: 'Floor Plans and Configurations',
                description: `${localityName} may offer multiple unit configurations (1/2/3/4 BHK). Compare carpet area, super area, and loading percentage across options.`
            },
            {
                icon: 'fa-tags',
                title: 'Pricing and Payment Plans',
                description: `Developers often offer construction-linked or possession-linked payment plans. Compare base price, PLC charges, and all-inclusive cost for ${localityName}.`
            },
            {
                icon: 'fa-handshake',
                title: 'Amenities Package',
                description: `Assess the promised amenities (club, pool, gym, park) against the maintenance charges proposed for ${localityName} post-handover.`
            }
        ];
    }

    // Phase / Township-specific amenities
    if (rawEntityType === 'phase' || rawEntityType === 'township') {
        return [
            {
                icon: 'fa-map-marked-alt',
                title: 'Master-Planned Layout',
                description: `${localityName} is part of a phased or township development with planned infrastructure, designated commercial zones, and internal road networks.`
            },
            {
                icon: 'fa-city',
                title: 'Integrated Living',
                description: `Township-style developments in ${city} typically combine residential, retail, and recreational spaces within a single managed boundary.`
            },
            {
                icon: 'fa-road',
                title: 'Internal Connectivity',
                description: `Wide internal roads, pedestrian pathways, and cycling tracks connect residential blocks to common facilities within ${localityName}.`
            },
            {
                icon: 'fa-leaf',
                title: 'Open and Green Spaces',
                description: `Large township projects allocate significant area to parks, water bodies, and green buffers — verify the actual delivered vs. promised ratio for ${localityName}.`
            },
            {
                icon: 'fa-store',
                title: 'In-House Retail',
                description: `Convenience stores, pharmacies, and daily-need outlets within the township reduce dependency on external markets for residents.`
            },
            {
                icon: 'fa-bus',
                title: 'Transport Access',
                description: `${localityName} may offer shuttle services or dedicated pickup points for metro and bus connectivity to major employment hubs.`
            }
        ];
    }

    // Road / corridor-specific amenities
    if (rawEntityType === 'road') {
        return [
            {
                icon: 'fa-road',
                title: 'Corridor Positioning',
                description: `${localityName} is a road-based locality where properties line a major corridor. Evaluate frontage, noise levels, and access points before choosing a unit.`
            },
            {
                icon: 'fa-briefcase',
                title: 'Commercial Proximity',
                description: `Road-facing localities in ${city} often sit near office complexes, retail strips, and hospitality zones — ideal for those prioritizing walk-to-work convenience.`
            },
            {
                icon: 'fa-subway',
                title: 'Transit Connectivity',
                description: `Major road corridors typically intersect with metro stations and bus stops, offering strong public transit access for daily commuters.`
            },
            {
                icon: 'fa-hospital',
                title: 'Healthcare Access',
                description: `Properties along ${localityName} are usually close to hospitals, diagnostic centres, and pharmacies given the high-visibility corridor location.`
            },
            {
                icon: 'fa-utensils',
                title: 'Dining and Retail',
                description: `Road-based localities benefit from a high density of restaurants, cafes, and retail outlets catering to both residents and office-goers.`
            },
            {
                icon: 'fa-volume-up',
                title: 'Noise and Privacy',
                description: `Consider noise levels from traffic on ${localityName}. Higher floors and setback properties typically offer better privacy in corridor locations.`
            }
        ];
    }

    // Village / default locality amenities
    return [
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
            description: `Families can access multiple school options and learning hubs in surrounding areas.`
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
};

/**
 * Build connectivity items that vary by entityType for page uniqueness.
 */
const buildConnectivityItems = (localityName, city, entityType = 'locality') => {
    const rawEntityType = entityType.toLowerCase();

    if (rawEntityType === 'sector') {
        return [
            {
                icon: 'fa-subway',
                name: 'Metro and Rapid Transit',
                details: `Sector-based localities like ${localityName} in ${city} are often connected via Rapid Metro or DMRC corridors. Verify nearest station distance for your daily commute.`
            },
            {
                icon: 'fa-road',
                name: 'Sector Road Hierarchy',
                details: `${localityName} features a planned road network with dividing sectors, internal sector roads, and access to major arterials like Golf Course Road or Sohna Road.`
            },
            {
                icon: 'fa-plane-departure',
                name: 'Airport Reach',
                details: `IGI Airport is accessible via expressway connectors from ${localityName}. Typical travel time ranges from 30-60 minutes depending on traffic and route.`
            },
            {
                icon: 'fa-briefcase',
                name: 'Employment Hub Access',
                details: `Major office clusters in Cyber City, Udyog Vihar, and Golf Course Road are reachable from ${localityName} within a practical daily commute window.`
            }
        ];
    }

    if (rawEntityType === 'society') {
        return [
            {
                icon: 'fa-subway',
                name: 'Metro Proximity',
                details: `Residents of ${localityName} can access metro connectivity through the nearest station. Auto and cab aggregators provide reliable first- and last-mile options in ${city}.`
            },
            {
                icon: 'fa-road',
                name: 'Internal and External Roads',
                details: `${localityName} connects to main arterial roads via well-maintained internal approaches. Check gate-to-highway distance during peak hours for realistic commute estimates.`
            },
            {
                icon: 'fa-bus',
                name: 'School and Office Bus Services',
                details: `Many societies in ${city} have dedicated school bus routes and shuttle services to nearby metro stations and corporate parks.`
            },
            {
                icon: 'fa-briefcase',
                name: 'Workplace Connectivity',
                details: `Assess commute time from ${localityName} to your primary workplace. Proximity to Cyber City, Sohna Road, or NH-48 can significantly impact daily schedule.`
            }
        ];
    }

    if (rawEntityType === 'project') {
        return [
            {
                icon: 'fa-map-marked-alt',
                name: 'Site Location and Approach',
                details: `${localityName} is located within ${city}. Evaluate approach road width, surrounding development, and any pending infrastructure projects that may affect accessibility.`
            },
            {
                icon: 'fa-subway',
                name: 'Transit Connectivity',
                details: `Check the distance from ${localityName} to the nearest metro station and bus stops. Under-construction projects should assess planned transit expansions in the area.`
            },
            {
                icon: 'fa-road',
                name: 'Highway and Expressway Links',
                details: `Project connectivity in ${city} is often determined by proximity to NH-48, Dwarka Expressway, or Southern Peripheral Road. Verify approach road quality for ${localityName}.`
            },
            {
                icon: 'fa-briefcase',
                name: 'Employment Corridor Access',
                details: `For under-construction projects like ${localityName}, assess both current and projected commute times to major employment hubs once the project is delivered.`
            }
        ];
    }

    // Default for locality, village, phase, township, road, etc.
    return [
        {
            icon: 'fa-subway',
            name: 'Metro Network',
            details: `Commuters in ${localityName} can plan practical routes through ${city}'s metro corridors.`
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
};

const LocalityTemplate = () => {
    const { t } = useTranslation();
    const [tSeo] = useTranslation('seo');
    const params = useParams();
    // CRITICAL FIX (audit 4.5): subscribe to the locale store via the hook at
    // the top of the component (rules-of-hooks safe) instead of calling
    // getState() inside the conditional early return below, which bypassed
    // React's subscription model and could render a stale locale.
    const locale = useLocaleStore((s) => s.locale);
    // URL param is the full slug (may include -gurgaon suffix for SEO)
    const slug = (params.slug || '').replace(/-gurgaon$/i, '');

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
        const city = localityInfo.city || 'Gurugram';
        const entityType = toTitleCase(localityInfo.entityType || localityInfo.type || 'Locality');
        const aliases = Array.isArray(localityInfo.aliases) ? localityInfo.aliases : [];
        const description = localityInfo.description || `Find verified properties, pricing trends, and locality insights in ${localityName}, ${city}.`;

        // Entity-type-specific overview fallbacks for page uniqueness
        const rawEntityType = (localityInfo.entityType || localityInfo.type || 'locality').toLowerCase();
        const overview = localityInfo.contentBlocks?.overview || (() => {
            if (rawEntityType === 'sector') return `${localityName} is a planned sector in ${city} governed by HSVP/HUDA zoning regulations. Properties here range from plotted developments to group housing, with defined commercial belts and institutional areas.`;
            if (rawEntityType === 'society') return `${localityName} is a residential society in ${city} offering gated community living with shared amenities, maintenance services, and a resident welfare association. Society properties appeal to families seeking managed living environments.`;
            if (rawEntityType === 'project') return `${localityName} is a real estate project in ${city}. Verify the builder's credentials, RERA registration, possession timeline, and approved plans before investing. 360Ghar provides verified project data to support your decision.`;
            if (rawEntityType === 'phase' || rawEntityType === 'township') return `${localityName} is a phased or township development in ${city} offering integrated residential, commercial, and recreational spaces within a master-planned layout.`;
            if (rawEntityType === 'road') return `${localityName} is a road-corridor locality in ${city} with properties along a major thoroughfare. These locations offer strong transit access and commercial proximity — ideal for buyers prioritizing connectivity.`;
            return `${localityName} is an established ${entityType.toLowerCase()} within ${city} with consistent buyer and tenant interest.`;
        })();
        const connectivitySummary = localityInfo.contentBlocks?.connectivity || (() => {
            if (rawEntityType === 'society') return `Assess gate-to-main-road distance, availability of cab aggregators, and proximity to metro/bus stops for ${localityName}.`;
            if (rawEntityType === 'project') return `Evaluate current and projected connectivity for ${localityName} including approach road quality, transit proximity, and planned infrastructure improvements.`;
            return `Compare road, metro, and business-hub connectivity for ${localityName} before finalizing your move.`;
        })();
        const marketSignals = localityInfo.contentBlocks?.marketSignals || (() => {
            if (rawEntityType === 'sector') return `Sector properties in ${localityName} are governed by circle rates and HSVP transfer policies. Track listing volumes and price trends on 360Ghar for market pulse.`;
            if (rawEntityType === 'society') return `Society properties in ${localityName} derive value from maintenance quality, RWA effectiveness, and amenity delivery. Monitor resale activity and time-on-market on 360Ghar.`;
            if (rawEntityType === 'project') return `Project market signals for ${localityName} include builder credibility, construction progress, RERA compliance, and pre-launch vs. ready-to-move pricing differentials.`;
            return `Monitor listing momentum and buyer demand indicators for ${localityName}.`;
        })();

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
        return <Navigate to={localizePath('/properties', locale)} replace />;
    }

    // Derive URL-safe city slug for cross-linking (e.g. "Gurugram" -> "gurgaon")
    const canonicalCitySlug = (computed.city || 'gurgaon').toLowerCase().replace(/\s+/g, '-').replace('gurugram', 'gurgaon');
    // CRITICAL FIX (audit 4.1): previously canonical/structured-data URLs
    // hardcoded a "-gurgaon" suffix, breaking SEO for non-Gurgaon localities.
    // Derive the suffix from the actual city slug instead.
    const localityFullSlug = `${computed.localitySlug}-${canonicalCitySlug}`;

    // FIX: breadcrumbs references localityFullSlug, so it must be declared
    // AFTER localityFullSlug to avoid a Temporal Dead Zone (TDZ) violation
    // that surfaced in the minified build as "Cannot access 'Z' before initialization".
    const breadcrumbs = [
        { name: 'Home', url: 'https://360ghar.com/' },
        { name: `Properties in ${computed.city}`, url: 'https://360ghar.com/properties' },
        { name: `${computed.localityName}, ${computed.city}`, url: `https://360ghar.com/locality/${localityFullSlug}` }
    ];

    const faqItems = defaultFaqBuilder(computed.localityName, computed.entityType);

    const localityStructuredData = [
        generateBreadcrumbStructuredData(breadcrumbs),
        generateLocalityStructuredData({
            name: computed.localityName,
            city: computed.city,
            slug: localityFullSlug,
            lat: localityInfo?.geo?.lat,
            lng: localityInfo?.geo?.lng,
            entityType: computed.entityType,
        }),
        {
            '@type': 'WebPage',
            name: `${computed.localityName}, ${computed.city}`,
            url: `https://360ghar.com/locality/${localityFullSlug}`,
            dateModified: localityInfo.lastVerifiedAt || new Date().toISOString().split('T')[0]
        },
        {
            '@type': 'FAQPage',
            mainEntity: faqItems.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer
                }
            }))
        },
        ...generateEeaSignals({ verifiedCount: 500 }),
    ];

    return (
        <>
            <SEO
                title={localityInfo?.seo?.title || tSeo('localityTemplate.title', { localityName: computed.localityName, city: computed.city })}
                description={localityInfo?.seo?.description || tSeo('localityTemplate.description', { localityName: computed.localityName, city: computed.city })}
                keywords={localityInfo?.seo?.keywords || `${computed.localityName} ${computed.city} real estate, properties in ${computed.localityName}, ${computed.localityName} prices, ${computed.localityName} reviews, flats in ${computed.localityName}`}
                canonical={`/locality/${localityFullSlug}`}
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={localityStructuredData}
            />
            <OffCanvas />
            <MobileMenu />

            <main className="body-bg locality-page-v2">
                <Header
                    headerClass="dark-header has-border"
                    headerMenusClass="mx-auto"
                    btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
                    btnLink="/post-property"
                    btnText={t('common:header.postProperty')}
                    spanClass="icon-right text-gradient"
                    showContactNumber={false}
                />

                {/* AUDIT FIX (4.4): visible breadcrumbs. Previously breadcrumbs
                    existed only in structured data; render a lightweight UI
                    breadcrumb strip for users and crawlers. */}
                <nav aria-label="Breadcrumb" className="locality-breadcrumb-strip">
                    <div className="container container-two">
                        <ol className="locality-breadcrumb-list">
                            <li className="locality-breadcrumb-item">
                                <I18nLink to="/">{t('common:breadcrumb.home')}</I18nLink>
                            </li>
                            <li className="locality-breadcrumb-item">
                                <I18nLink to="/properties">{computed.city}</I18nLink>
                            </li>
                            <li className="locality-breadcrumb-item locality-breadcrumb-item--active" aria-current="page">
                                {computed.localityName}, {computed.city}
                            </li>
                        </ol>
                    </div>
                </nav>

                <LocalityHero
                    localityName={computed.localityName}
                    city={computed.city}
                    entityType={computed.entityType}
                    description={computed.description}
                    heroImage={computed.heroImage}
                    stats={computed.heroStats}
                    marketStatus={computed.marketStatus.label}
                />

                {/* AUDIT FIX (4.5): expanded social sharing (Facebook, X,
                    LinkedIn, WhatsApp, copy link) for locality pages. */}
                <section className="pt-20 pb-0">
                    <div className="container container-two text-end">
                        {(() => {
                            const shareText = `Check out ${computed.localityName} on 360Ghar - verified properties with 360° virtual tours`;
                            const shareUrl = `${window.location.origin}${window.location.pathname}?utm_source=share&utm_medium=social&utm_campaign=locality_share`;
                            const encUrl = encodeURIComponent(shareUrl);
                            const encText = encodeURIComponent(shareText);
                            const links = [
                                { href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: 'fab fa-whatsapp', label: 'WhatsApp', cls: 'btn-outline-success' },
                                { href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`, icon: 'fab fa-facebook', label: 'Facebook', cls: 'btn-outline-primary' },
                                { href: `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`, icon: 'fab fa-x-twitter', label: 'X', cls: 'btn-outline-dark' },
                                { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`, icon: 'fab fa-linkedin', label: 'LinkedIn', cls: 'btn-outline-primary' },
                            ];
                            return (
                                <div className="d-inline-flex flex-wrap gap-2 justify-content-end">
                                    {links.map((l) => (
                                        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={`btn btn-sm ${l.cls}`}>
                                            <i className={`${l.icon} me-1`} />{l.label}
                                        </a>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-main"
                                        onClick={() => {
                                            navigator.clipboard?.writeText(shareUrl);
                                        }}
                                    >
                                        <i className="fas fa-link me-1" />{t('common:contentSeo.copyLink')}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </section>

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
                                    items={buildAmenityItems(computed.localityName, computed.city, computed.entityType)}
                                />

                                <ConnectivitySection
                                    localityName={computed.localityName}
                                    summary={computed.connectivitySummary}
                                    items={buildConnectivityItems(computed.localityName, computed.city, computed.entityType)}
                                />

                                <section id="locality-properties" className="locality-section locality-properties-v2">
                                    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 locality-section__head locality-section__head--compact">
                                        <div>
                                            <span className="locality-section__eyebrow">Verified Listings</span>
                                            <h2 className="locality-section__title mb-2">Properties in {computed.localityName}</h2>
                                            <p className="locality-section__desc mb-0">Explore active inventory and shortlist the right fit with on-ground verification support.</p>
                                        </div>
                                        <I18nLink to="/properties" className="btn btn-outline-main rounded-pill">View Full Property Map</I18nLink>
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

                                {/* Browse Properties — cross-link to landing pages using centralized utility */}
                                <section className="locality-section mt-5">
                                  <span className="locality-section__eyebrow">Explore</span>
                                  <h2 className="locality-section__title mb-3">Browse Properties in {computed.city}</h2>
                                  <div className="d-flex flex-wrap gap-2">
                                    {getLocalityLandingLinks({
                                      citySlug: canonicalCitySlug,
                                      localityName: computed.localityName,
                                      limit: 6,
                                    }).map((link) => (
                                      <I18nLink
                                        key={link.to}
                                        to={link.to}
                                        className="btn btn-outline-main btn-sm rounded-pill"
                                      >
                                        {link.label}
                                      </I18nLink>
                                    ))}
                                    <I18nLink
                                      to="/properties"
                                      className="btn btn-outline-main btn-sm rounded-pill"
                                    >
                                      All Properties
                                    </I18nLink>
                                  </div>
                                </section>
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
                                        <I18nLink to="/contact" className="btn btn-main w-100 mt-4 rounded-pill">Get Locality Report</I18nLink>
                                    </article>

                                    {/* Entity-type-specific cross-links */}
                                    {(computed.entityType.toLowerCase() === 'sector' || computed.entityType.toLowerCase() === 'locality') && (
                                        <article className="locality-sidebar-card">
                                            <p className="locality-sidebar-card__eyebrow">Useful Links</p>
                                            <h3 className="locality-sidebar-card__title">Research Resources</h3>
                                            <div className="d-flex flex-column gap-2 mt-3">
                                                <I18nLink to="/circle-rates" className="btn btn-outline-main btn-sm rounded-pill">
                                                    <i className="fas fa-indian-rupee-sign me-1" />
                                                    Check Circle Rates
                                                </I18nLink>
                                                <I18nLink to="/rera-projects" className="btn btn-outline-main btn-sm rounded-pill">
                                                    <i className="fas fa-file-contract me-1" />
                                                    RERA Project Lookup
                                                </I18nLink>
                                                <I18nLink to={`/${canonicalCitySlug}/buy/flats`} className="btn btn-outline-main btn-sm rounded-pill">
                                                    <i className="fas fa-building me-1" />
                                                    Flats for Sale in {computed.city}
                                                </I18nLink>
                                                <I18nLink to={`/${canonicalCitySlug}`} className="btn btn-outline-main btn-sm rounded-pill">
                                                    <i className="fas fa-city me-1" />
                                                    {computed.city} Real Estate Hub
                                                </I18nLink>
                                            </div>
                                        </article>
                                    )}

                                    {computed.entityType.toLowerCase() === 'society' && (
                                        <article className="locality-sidebar-card">
                                            <p className="locality-sidebar-card__eyebrow">Society Resources</p>
                                            <h3 className="locality-sidebar-card__title">Living in {computed.localityName}</h3>
                                            <ul className="text-start ps-3 mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
                                                <li>Verify RWA registration and bylaws</li>
                                                <li>Request maintenance charge break-up from the seller</li>
                                                <li>Check parking allocation and visitor parking rules</li>
                                                <li>Confirm power backup coverage (common areas + individual units)</li>
                                                <li>Review society&apos;s age and upcoming major repair assessments</li>
                                            </ul>
                                            <I18nLink to="/contact" className="btn btn-outline-main btn-sm w-100 rounded-pill mt-3">Get Society Report</I18nLink>
                                        </article>
                                    )}

                                    {computed.entityType.toLowerCase() === 'project' && (
                                        <article className="locality-sidebar-card">
                                            <p className="locality-sidebar-card__eyebrow">Project Due Diligence</p>
                                            <h3 className="locality-sidebar-card__title">Before You Book</h3>
                                            <ul className="text-start ps-3 mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
                                                <li>Verify H-RERA registration number on the official portal</li>
                                                <li>Cross-check approved building plans vs. actual construction</li>
                                                <li>Review builder&apos;s delivery track record on other projects</li>
                                                <li>Compare all-inclusive cost (base + PLC + EDC + club + maintenance deposit)</li>
                                                <li>Check for any litigation or complaints on H-RERA</li>
                                            </ul>
                                            <div className="d-flex flex-column gap-2 mt-3">
                                                <I18nLink to="/rera-projects" className="btn btn-outline-main btn-sm rounded-pill">
                                                    <i className="fas fa-file-contract me-1" />
                                                    RERA Project Lookup
                                                </I18nLink>
                                                <I18nLink to="/builder-reputation" className="btn btn-outline-main btn-sm rounded-pill">
                                                    <i className="fas fa-hard-hat me-1" />
                                                    Check Builder Reputation
                                                </I18nLink>
                                            </div>
                                        </article>
                                    )}

                                    {(computed.entityType.toLowerCase() === 'phase' || computed.entityType.toLowerCase() === 'township') && (
                                        <article className="locality-sidebar-card">
                                            <p className="locality-sidebar-card__eyebrow">Township Insights</p>
                                            <h3 className="locality-sidebar-card__title">Evaluating {computed.localityName}</h3>
                                            <ul className="text-start ps-3 mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
                                                <li>Compare delivered vs. promised amenities across phases</li>
                                                <li>Assess density and unit count per acre</li>
                                                <li>Verify which phase is delivered and which is under construction</li>
                                                <li>Check internal road width and parking ratios</li>
                                            </ul>
                                        </article>
                                    )}

                                    {computed.entityType.toLowerCase() === 'road' && (
                                        <article className="locality-sidebar-card">
                                            <p className="locality-sidebar-card__eyebrow">Corridor Insights</p>
                                            <h3 className="locality-sidebar-card__title">Road Locality Checklist</h3>
                                            <ul className="text-start ps-3 mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
                                                <li>Evaluate noise levels by visiting during peak traffic hours</li>
                                                <li>Check for dust and pollution mitigation (tree cover, setbacks)</li>
                                                <li>Verify parking availability — road-facing buildings often have limited parking</li>
                                                <li>Assess walkability to daily necessities and transit stops</li>
                                            </ul>
                                        </article>
                                    )}

                                    <article className="locality-sidebar-card locality-sidebar-card--dark">
                                        <p className="locality-sidebar-card__eyebrow">Need Expert Help?</p>
                                        <h3 className="locality-sidebar-card__title">Book a Personalized Consultation</h3>
                                        <p className="mb-4">Talk to our local property advisors for a curated shortlist in {computed.localityName}.</p>
                                        <I18nLink to="/contact" className="btn btn-outline-light w-100 rounded-pill mb-2">Talk to an Expert</I18nLink>
                                        <I18nLink to="/post-property" className="btn btn-light w-100 rounded-pill">List Your Property</I18nLink>
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

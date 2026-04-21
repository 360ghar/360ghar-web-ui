import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18nNavigate } from '../../i18n/I18nLink';
import useSWR from 'swr';
import PropertyItem from './PropertyItem';
import Pagination from '../../common/ui/Pagination';
import PropertyFilterBottom from '../property-filters/PropertyFilterBottom';
import PropertyFilters from '../property-filters/PropertyFilters';
import PropertyTopBar from '../property-filters/PropertyTopBar';
import { usePropertyStore } from '../../store/propertyStore';
import { useLocationStore } from '../../store/locationStore';
import { propertyAPIService } from '../../services/propertyAPIService';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { hapticLight } from '../../utils/hapticFeedback';
import { parsePropertySearchParams } from '../../utils/propertyFilters';

const PropertyPageSection = () => {
    const { setLocation } = useLocationStore();
    const [searchParams] = useSearchParams();
    const navigate = useI18nNavigate();
    const {
        properties,
        pagination,
        updateFilter,
        filters,
        getActiveFiltersCount,
        clearFilters,
        applyFilters
    } = usePropertyStore();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    const filterTriggerRef = useRef(null);
    const viewMode = searchParams.get('view') === 'list' ? 'list' : 'grid';
    const closeFilterDrawer = useCallback(() => {
        setIsFilterDrawerOpen(false);
        filterTriggerRef.current?.focus();
    }, []);

    const activeFiltersCount = getActiveFiltersCount();

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isFilterDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [closeFilterDrawer, isFilterDrawerOpen]);

    useEffect(() => {
        if (!isFilterDrawerOpen) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                closeFilterDrawer();
            }
        };

        const handleTabTrap = (event) => {
            if (event.key !== 'Tab' || !drawerRef.current) {
                return;
            }
            const focusable = drawerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleTabTrap);

        const firstFocusable = drawerRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTabTrap);
        };
    }, [closeFilterDrawer, isFilterDrawerOpen]);

    // Container class approach for list/grid view - no body manipulation
    // View mode is applied via CSS class on the section element

    // Parse search parameters and apply them to filters on initial load
    useEffect(() => {
        const urlFilters = parsePropertySearchParams(searchParams);
        let locationUpdate = null;
        if (typeof urlFilters.lat === 'number' && typeof urlFilters.lng === 'number') {
            locationUpdate = {
                lat: urlFilters.lat,
                lng: urlFilters.lng,
                name: 'Search Location'
            };
        }

        if (Object.keys(urlFilters).length > 0) {
            Object.entries(urlFilters).forEach(([key, value]) => {
                updateFilter(key, value);
            });
        }

        if (locationUpdate) {
            setLocation(locationUpdate);
        }

    }, [searchParams, setLocation, updateFilter]);

    // Construct a safe cache key object containing only active filters
    const activeFiltersParams = useMemo(() => {
        const cleanFilters = {};
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== null && value !== undefined && value !== '') {
                if (Array.isArray(value)) {
                    if (value.length > 0) cleanFilters[key] = value;
                } else {
                    cleanFilters[key] = value;
                }
            }
        });
        return cleanFilters;
    }, [filters]);

    // SWR fetcher
    const fetcher = async ([_url, params]) => {
        const res = await propertyAPIService.searchProperties(params, params.page || 1, params.limit || 12);
        return res.data || { properties: [], items: [], total: 0, totalPages: 1, limit: 12, page: 1 };
    };

    const { data: fetchPayload, error: fetchError, isLoading: swrLoading, mutate } = useSWR(
        ['/properties/search', activeFiltersParams], 
        fetcher, 
        { 
            revalidateOnFocus: false,
            keepPreviousData: true 
        }
    );

    // Pull to refresh state
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const pullStartY = useRef(0);
    const contentRef = useRef(null);
    const pullThreshold = 100;

    // Pull to refresh handlers
    const handleTouchStart = useCallback((e) => {
        if (contentRef.current && contentRef.current.scrollTop === 0) {
            pullStartY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isPulling || pullStartY.current === 0) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - pullStartY.current;
        if (diff > 0 && diff < 200) {
            setPullDistance(diff);
            e.preventDefault();
        }
    }, [isPulling]);

    const handleTouchEnd = useCallback(() => {
        if (pullDistance >= pullThreshold) {
            hapticLight();
            mutate();
        }
        setIsPulling(false);
        setPullDistance(0);
        pullStartY.current = 0;
    }, [pullDistance, mutate]);

    // Determine derived states from SWR payload or Zustand fallback
    const displayProperties = fetchPayload?.properties || fetchPayload?.items || properties || [];
    const displayPagination = fetchPayload ? {
        page: fetchPayload.page || 1,
        totalPages: fetchPayload.total_pages || fetchPayload.totalPages || 1,
        total: fetchPayload.total || 0,
        limit: fetchPayload.limit || 12,
    } : pagination;
    const isFetching = swrLoading;
    const currentError = fetchError ? fetchError.message || 'Error loading properties' : null;

    const handlePageChange = (newPage) => {
        updateFilter('page', newPage);

        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        navigate(`?${params.toString()}`, { replace: true });
    };

    const handleViewModeChange = (mode) => {
        if (mode === viewMode) return;
        const params = new URLSearchParams(searchParams);
        params.set('view', mode);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const openFilterDrawer = () => {
        setIsFilterDrawerOpen(true);
    };

    const handleClearFiltersAndRefresh = async () => {
        clearFilters();
        await applyFilters();
        navigate('/properties', { replace: true });
    };

    return (
        <>
            <section className={`property-page bg-gray-100 ${viewMode === 'list' ? 'property-page--list' : 'property-page--grid'}`}>
                <div className="container container-two">

                    {/* Top Bar - Search, Location, Sort */}
                    <div className="property-page__top-bar">
                        <PropertyTopBar />
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="d-lg-none mb-3">
                        <button
                            className="mobile-filter-toggle"
                            onClick={openFilterDrawer}
                            ref={filterTriggerRef}
                            aria-expanded={isFilterDrawerOpen}
                            aria-controls="mobile-filter-drawer"
                        >
                            <i className="fas fa-filter"></i>
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="filter-count-badge">{activeFiltersCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Results Count and Quick Sort */}
                    <div className="property-page__results-bar">
                        <PropertyFilterBottom
                            total={displayPagination.total}
                            currentPage={displayPagination.page}
                            totalPages={displayPagination.totalPages}
                            viewMode={viewMode}
                            onViewModeChange={handleViewModeChange}
                        />
                    </div>

                    {/* Main Content - Sidebar + Properties Grid */}
                    <div className="property-page__content">
                        {/* Left Sidebar - Filters (Desktop) */}
                        <aside className="property-page__sidebar d-none d-lg-block">
                            <div className="property-sidebar-wrapper">
                                <PropertyFilters />
                            </div>
                        </aside>

                        {/* Right Content - Property Grid */}
                        <main
                            ref={contentRef}
                            className="property-page__main"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="property-grid">
                                {isFetching ? (
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <div className="property-grid__item" key={index}>
                                            <LoadingSkeleton variant="card" count={1} />
                                        </div>
                                    ))
                                ) : currentError ? (
                                    <div className="property-grid__empty">
                                        <i className="fas fa-triangle-exclamation text-danger"></i>
                                        <p className="text-danger mb-3">Error loading properties: {currentError}</p>
                                        <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                                            <button type="button" className="btn btn-outline-main btn-sm" onClick={() => void mutate()}>
                                                Retry
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => void handleClearFiltersAndRefresh()}>
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                ) : displayProperties.length === 0 ? (
                                    <div className="property-grid__empty">
                                        <i className="fas fa-home"></i>
                                        <p className="mb-3">No properties found. Try adjusting your filters or location.</p>
                                        <button type="button" className="btn btn-outline-main btn-sm" onClick={() => void handleClearFiltersAndRefresh()}>
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    displayProperties.map((property, index) => (
                                        <div className="property-grid__item" key={property.id || index}>
                                            <PropertyItem
                                                itemClass="style-two style-shaped compact-card"
                                                btnClass="text-gradient fw-semibold"
                                                property={property}
                                                badgeText={property.status || "For Sale"}
                                                badgeClass="property-item__badge"
                                                iconsClass="text-gradient"
                                                btnRenderBottom={true}
                                                btnRenderRight={false}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {displayProperties.length > 0 && displayPagination.totalPages > 1 && (
                                <Pagination
                                    currentPage={displayPagination.page}
                                    totalPages={displayPagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}

                            {/* Pull to Refresh Indicator */}
                            <div
                                className="pull-to-refresh__indicator"
                                style={{
                                    transform: `translateY(${Math.min(pullDistance, 100)}px)`,
                                    opacity: pullDistance > 30 ? Math.min((pullDistance - 30) / 70, 1) : 0
                                }}
                            >
                                <div className={`pull-to-refresh__spinner ${isPulling && pullDistance >= pullThreshold ? 'ready' : ''}`}>
                                    <i className="fas fa-arrow-down"></i>
                                </div>
                                <span className="pull-to-refresh__text">
                                    {pullDistance >= pullThreshold ? 'Release to refresh' : 'Pull to refresh'}
                                </span>
                            </div>
                        </main>
                    </div>

                </div>
            </section>

            {/* Mobile Filter Drawer */}
            <div 
                className={`filter-drawer-overlay ${isFilterDrawerOpen ? 'active' : ''}`}
                onClick={closeFilterDrawer}
            />
            <div
                id="mobile-filter-drawer"
                className={`filter-drawer ${isFilterDrawerOpen ? 'active' : ''}`}
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Property filters"
            >
                <PropertyFilters 
                    isMobile={true} 
                    onCloseDrawer={closeFilterDrawer}
                />
            </div>
        </>
    );
};

export default PropertyPageSection;

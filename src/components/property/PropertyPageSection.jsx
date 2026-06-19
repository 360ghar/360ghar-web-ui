import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18nNavigate } from '../../i18n/I18nLink';
import useSWR from 'swr';
import PropertyItem from './PropertyItem';
import PropertyFilterBottom from '../property-filters/PropertyFilterBottom';
import PropertyFilters from '../property-filters/PropertyFilters';
import PropertyTopBar from '../property-filters/PropertyTopBar';
import { usePropertyStore } from '../../store/propertyStore';
import { useLocationStore } from '../../store/locationStore';
import { useCompareStore } from '../../store/compareStore';
import { propertyAPIService } from '../../services/propertyAPIService';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { hapticLight } from '../../utils/hapticFeedback';
import { parsePropertySearchParams } from '../../utils/propertyFilters';

const PropertyPageSection = () => {
    const { setLocation } = useLocationStore();
    // AUDIT FIX (improvement 2.3): comparison tray
    const { compareList, isCompareOpen, removeCompare, clearCompare, closeCompare } = useCompareStore();
    const [searchParams] = useSearchParams();
    const navigate = useI18nNavigate();
    const {
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

    // SWR fetcher — always fetches the FIRST page (cursor=null) for the
    // active filter set. "Load more" appends subsequent pages via manual
    // fetches using the opaque `next_cursor` returned by the backend.
    const fetcher = async ([_url, params]) => {
        const res = await propertyAPIService.searchProperties(params, null, params.limit || 12);
        return res.data || { items: [], next_cursor: null, has_more: false, limit: 12 };
    };

    const { data: fetchPayload, error: fetchError, isLoading: swrLoading, mutate } = useSWR(
        ['/properties/search', activeFiltersParams], 
        fetcher, 
        { 
            revalidateOnFocus: false,
            keepPreviousData: true,
            // AUDIT FIX (improvement 2.9): exponential backoff retry on error
            // with a cap, so transient failures recover gracefully instead of
            // surfacing a hard error to the user.
            onErrorRetry: (error, key, config, revalidate, opts) => {
                if (error?.status === 404) return; // don't retry 404s
                const maxRetryCount = 3;
                if (opts.retryCount >= maxRetryCount) return;
                const delay = Math.min(1000 * 2 ** opts.retryCount, 8000);
                setTimeout(() => revalidate({ retryCount: opts.retryCount + 1 }), delay);
            },
        }
    );

    // AUDIT FIX (improvement 2.9): basic offline indicator so users on
    // low-bandwidth/flaky connections understand why results may be stale.
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // AUDIT FIX (2.5): keep the Zustand store's pagination in sync with SWR
    // results so sibling components don't read stale pagination state.
    // Cursor-paginated: sync nextCursor/hasMore/limit only.
    const setPagination = usePropertyStore((s) => s.setPagination);
    useEffect(() => {
        if (!fetchPayload) return;
        setPagination({
            nextCursor: fetchPayload?.next_cursor ?? null,
            hasMore: Boolean(fetchPayload?.has_more),
            limit: fetchPayload?.limit || 12,
        });
    }, [fetchPayload, setPagination]);

    // Cursor "Load more" accumulation: we keep an accumulated list of items
    // across pages. The first page is seeded from SWR; subsequent pages are
    // fetched on demand using the opaque `next_cursor` token and appended.
    // Whenever the active filter set changes we reset back to the first page.
    const [accumulatedProperties, setAccumulatedProperties] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const activeFiltersKey = JSON.stringify(activeFiltersParams);
    const lastFiltersKeyRef = useRef(activeFiltersKey);
    useEffect(() => {
        if (lastFiltersKeyRef.current !== activeFiltersKey) {
            lastFiltersKeyRef.current = activeFiltersKey;
            setAccumulatedProperties([]);
            setNextCursor(null);
            setHasMore(false);
        }
    }, [activeFiltersKey]);

    // Seed the accumulated list + cursor state from the latest SWR first page.
    useEffect(() => {
        if (!fetchPayload) return;
        const pageItems = Array.isArray(fetchPayload?.items) ? fetchPayload.items : [];
        setAccumulatedProperties(pageItems);
        setNextCursor(fetchPayload?.next_cursor ?? null);
        setHasMore(Boolean(fetchPayload?.has_more));
    }, [fetchPayload]);

    const handleLoadMore = async () => {
        if (!hasMore || !nextCursor || loadMoreLoading) return;
        setLoadMoreLoading(true);
        try {
            const res = await propertyAPIService.searchProperties(activeFiltersParams, nextCursor, fetchPayload?.limit || 12);
            const payload = res.data || {};
            const nextItems = Array.isArray(payload.items) ? payload.items : [];
            setAccumulatedProperties(prev => [...prev, ...nextItems]);
            setNextCursor(payload.next_cursor ?? null);
            setHasMore(Boolean(payload.has_more));
        } catch {
            // Silently ignore; the user can retry via the Load More button.
        } finally {
            setLoadMoreLoading(false);
        }
    };

    // With cursor "Load more" we always show the accumulated list (which is
    // seeded from the SWR first page and grows as the user loads more).
    const visibleProperties = accumulatedProperties;
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

    // Determine derived states from SWR payload only.
    // CRITICAL FIX (audit 2.5): previously this fell back to the Zustand
    // store's `properties`/`pagination`, causing state desync (stale SWR
    // cache, store pagination never updated by SWR). SWR is now the single
    // source of truth for the displayed list.
    const isFetching = swrLoading;
    const currentError = fetchError ? fetchError.message || 'Error loading properties' : null;

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
        // CRITICAL FIX (audit 2.5): invalidate SWR so the list reflects the
        // cleared filters immediately instead of showing stale cached data.
        await mutate();
        navigate('/properties', { replace: true });
    };

    return (
        <>
            <section className={`property-page bg-gray-100 ${viewMode === 'list' ? 'property-page--list' : 'property-page--grid'}`}>
                <div className="container container-two">

                    {/* AUDIT FIX (improvement 2.9): offline banner */}
                    {!isOnline && (
                        <div className="alert alert-warning text-center py-2 mb-3" role="alert">
                            <i className="fas fa-wifi me-1"></i> You are offline. Showing cached results.
                        </div>
                    )}

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
                            loadedCount={visibleProperties.length}
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
                                ) : visibleProperties.length === 0 ? (
                                    <div className="property-grid__empty">
                                        <i className="fas fa-home"></i>
                                        <p className="mb-3">No properties found. Try adjusting your filters or location.</p>
                                        <button type="button" className="btn btn-outline-main btn-sm" onClick={() => void handleClearFiltersAndRefresh()}>
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    visibleProperties.map((property, index) => (
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

                            {/* Cursor-based "Load more" — shown on all viewports
                                when the backend reports more items are available. */}
                            {visibleProperties.length > 0 && hasMore && (
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-main"
                                        onClick={handleLoadMore}
                                        disabled={loadMoreLoading}
                                    >
                                        {loadMoreLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-plus me-1"></i> Load More
                                            </>
                                        )}
                                    </button>
                                </div>
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

            {/* AUDIT FIX (improvement 2.3): comparison tray */}
            {isCompareOpen && compareList.length > 0 && (
                <div className="compare-tray" role="region" aria-label="Property comparison">
                    <div className="compare-tray__header">
                        <span className="compare-tray__title">
                            <i className="fas fa-balance-scale me-1"></i>
                            Compare ({compareList.length})
                        </span>
                        <div className="d-flex gap-2">
                            <a
                                href={`/compare?ids=${compareList.map((p) => p.id).join(',')}`}
                                className={`btn btn-main btn-sm ${compareList.length < 2 ? 'disabled' : ''}`}
                                aria-disabled={compareList.length < 2}
                            >
                                Compare Now
                            </a>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={clearCompare}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className="btn btn-link btn-sm text-muted p-0"
                                onClick={closeCompare}
                                aria-label="Close comparison tray"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div className="compare-tray__items">
                        {compareList.map((p) => (
                            <div key={p.id} className="compare-tray__item">
                                <button
                                    type="button"
                                    className="compare-tray__remove"
                                    onClick={() => removeCompare(p.id)}
                                    aria-label="Remove from comparison"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                                <span className="compare-tray__name">{p.title || `Property #${p.id}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default PropertyPageSection;

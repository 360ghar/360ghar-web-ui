import { useEffect }  from 'react';
import PropertyFilterBottom from '../property-filters/PropertyFilterBottom';
import PropertyItem from './PropertyItem';
import SearchSidebar from '../../common/search/SearchSidebar';
import LocationSearchInput from '../../common/search/LocationSearchInput';
import { useLocationStore } from '../../store/locationStore';
import { usePropertyStore } from '../../store/propertyStore';

const PropertySidebarSection = () => {
    const { location, isLocating, error: locationError } = useLocationStore();
    const {
        properties,
        pagination,
        isLoading,
        error: propertyError,
        fetchProperties,
        setFilters,
        filters: storeFilters,
        clearFilters,
        getActiveFiltersCount
    } = usePropertyStore();

    // UX FIX (audit 2.12): use the global store's filter state directly so
    // filters persist across the main listing page and the sidebar page.
    const filters = storeFilters;
    const activeFilterCount = getActiveFiltersCount();

    // Fetch properties whenever location or filters change (first page only;
    // cursor=null resets the list for the new filter set).
    useEffect(() => {
        if (location.lat && location.lng) {
            // CRITICAL FIX (audit 2.6): use the canonical API param names
            // (lat, lng, radius) used everywhere else in the codebase, not
            // (latitude, longitude, radius_km). See propertyAPIService.js.
            const searchPayload = {
                lat: location.lat,
                lng: location.lng,
                radius: 10,
                sort_by: 'distance',
                ...filters,
            };
            fetchProperties(searchPayload); // First page (cursor=null)
        }
    }, [location, filters, fetchProperties]);

    const handleFiltersChange = (newFilters) => {
        // Push changes into the global store so they persist across pages.
        setFilters(newFilters);
    };

    const handleClearFilters = () => {
        clearFilters();
    };

    // Cursor-based "Load more": fetch the next page using the opaque
    // next_cursor token and append to the existing list.
    const handleLoadMore = () => {
        if (!pagination.hasMore || !pagination.nextCursor) return;
        const searchPayload = {
            lat: location.lat,
            lng: location.lng,
            radius: 10,
            ...filters,
        };
        fetchProperties(searchPayload, pagination.nextCursor, null, true);
    };
    return (
        <>
            {/* =========================== Property Sidebar Section Start ====================== */}
            <section className="property bg-gray-100 padding-y-120">
                <div className="container container-two">
                    <div className="property-filter">
                        <PropertyFilterBottom
                            loadedCount={properties.length}
                        />
                    </div>

                    <div className="row gy-4">
                        <div className="col-lg-8">
                            {/* Location Status */}
                            <div className="location-status mb-4">
                                {isLocating ? (
                                    <div className="text-muted">
                                        <i className="fas fa-spinner fa-spin"></i> Getting your location...
                                    </div>
                                ) : locationError ? (
                                    <div className="text-warning small">
                                        <i className="fas fa-exclamation-triangle"></i> {locationError}
                                    </div>
                                ) : (
                                    <div className="text-success small d-flex align-items-center justify-content-between">
                                        <span>
                                            <i className="fas fa-map-marker-alt"></i> Showing properties near {location.name}
                                            {properties.length > 0 && (
                                                <span className="ms-2">({properties.length} found)</span>
                                            )}
                                        </span>
                                        {activeFilterCount > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm text-danger p-0"
                                                onClick={handleClearFilters}
                                            >
                                                <i className="fas fa-times me-1"></i>Clear Filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="list-grid-item-wrapper property-item-wrapper row gy-4">
                                {isLoading ? (
                                    // Loading skeleton
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <div className="col-sm-6" key={index}>
                                            <div className="property-item loading">
                                                <div className="property-item__thumb loading-placeholder"></div>
                                                <div className="property-item__content">
                                                    <div className="loading-placeholder-text"></div>
                                                    <div className="loading-placeholder-text short"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : propertyError ? (
                                    <div className="col-12">
                                        <div className="text-center py-4">
                                            <p className="text-danger">Error loading properties: {propertyError}</p>
                                        </div>
                                    </div>
                                ) : properties.length === 0 ? (
                                    <div className="col-12">
                                        <div className="text-center py-4">
                                            <p>No properties found in this area. Try expanding your search or changing location.</p>
                                        </div>
                                    </div>
                                ) : (
                                    properties.map((property, index) => (
                                        <div className="col-sm-6" key={property.id || index}>
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
                        </div>
                        <div className="col-lg-4 ps-lg-5">
                            {/* Location Search */}
                            <div className="mb-4">
                                <LocationSearchInput />
                            </div>

                            {/* Search Sidebar */}
                            <SearchSidebar onFiltersChange={handleFiltersChange} />
                        </div>
                    </div>
                    {/* Cursor-based Load more */}
                    {properties.length > 0 && pagination.hasMore && (
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-main"
                                onClick={handleLoadMore}
                                disabled={isLoading}
                            >
                                {isLoading ? (
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
                </div>
            </section>
            {/* =========================== Property Sidebar Section End ====================== */}
        </>
    );
};

export default PropertySidebarSection;

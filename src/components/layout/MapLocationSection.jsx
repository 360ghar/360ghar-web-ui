/* global google */
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { usePropertyStore } from '../../store/propertyStore';
import { useLocationStore } from '../../store/locationStore';
import PropertyItem from '../property/PropertyItem';
import PropertyFilters from '../property-filters/PropertyFilters';
import PropertyQuickFilters from '../property/PropertyQuickFilters';
import MapControls from '../map/MapControls';
import RadiusSlider from '../map/RadiusSlider';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import GooglePlacesInput from '../../common/search/GooglePlacesInput';
import { Loader } from '@googlemaps/js-api-loader';

let googleMapsLoader;

const getMapsLoader = () => {
    if (typeof window !== 'undefined' && window.google?.maps) {
        return { load: async () => {} };
    }

    if (!googleMapsLoader) {
        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'your_google_places_api_key_here') {
            console.error('Google Maps API key missing.');
            return null;
        }

        googleMapsLoader = new Loader({ apiKey, version: 'weekly', id: 'google-maps-js', libraries: ['places'] });
    }

    return googleMapsLoader;
};

const MapLocationSection = () => {
    const {
        properties,
        pagination,
        isLoading,
        error,
        fetchProperties,
        filters,
        updateFilter,
        getActiveFiltersCount,
        clearFilters
    } = usePropertyStore();

    const {
        location,
        error: locationError,
        initializeLocation,
        fetchBrowserLocation,
        setLocation,
        resetToCurrentLocation
    } = useLocationStore();

    // Component state
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [mapZoom, setMapZoom] = useState(12);
    const [mapType, setMapType] = useState('roadmap');
    const [viewMode, setViewMode] = useState('grid-2');
    const [sortBy, setSortBy] = useState('newest');
    const [groupByLocation, setGroupByLocation] = useState(true);
    const [radius, setRadius] = useState(filters.radius || 20);

    // Google Maps refs
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map());
    const circleRef = useRef(null);
    const gmapsRef = useRef({ Map: null, Marker: null, Size: null, LatLngBounds: null, Circle: null });

    // Initialize location on mount
    useEffect(() => {
        initializeLocation();
    }, [initializeLocation]);

    // Fetch properties when location or radius changes
    useEffect(() => {
        if (location.lat && location.lng) {
            fetchProperties({
                lat: location.lat,
                lng: location.lng,
                radius: radius,
                sort_by: sortBy
            });
        } else {
            fetchProperties({ sort_by: sortBy });
        }
    }, [location.lat, location.lng, radius, sortBy, fetchProperties]);

    // Initialize map
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                const loader = getMapsLoader();
                if (!loader) return;
                await loader.load();
                const { Map } = await google.maps.importLibrary('maps');
                const { Marker } = await google.maps.importLibrary('marker');
                const { LatLngBounds, Size } = await google.maps.importLibrary('core');

                if (!mounted || !mapContainerRef.current) return;

                gmapsRef.current = { Map, Marker, Size, LatLngBounds, Circle: google.maps.Circle };

                const center = {
                    lat: location.lat || 28.4595,
                    lng: location.lng || 77.0266,
                };

                mapRef.current = new Map(mapContainerRef.current, {
                    center,
                    zoom: mapZoom,
                    mapTypeId: mapType,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });

                // Add search radius circle
                if (location.lat && location.lng && google.maps.Circle) {
                    circleRef.current = new google.maps.Circle({
                        map: mapRef.current,
                        center: center,
                        radius: radius * 1000, // Convert km to meters
                        fillColor: '#4a90e2',
                        fillOpacity: 0.1,
                        strokeColor: '#4a90e2',
                        strokeOpacity: 0.4,
                        strokeWeight: 2,
                    });
                }
            } catch (e) {
                console.error('Failed to init Google Map', e);
            }
        };
        init();
        return () => { mounted = false; };
    }, [location.lat, location.lng, mapType, mapZoom, radius]);

    // Update map type
    useEffect(() => {
        if (mapRef.current && mapType) {
            mapRef.current.setMapTypeId(mapType);
        }
    }, [mapType]);

    // Update radius circle
    useEffect(() => {
        if (circleRef.current && location.lat && location.lng) {
            circleRef.current.setCenter({ lat: location.lat, lng: location.lng });
            circleRef.current.setRadius(radius * 1000);
        }
    }, [radius, location.lat, location.lng]);

    // Create/update markers
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const { Marker, Size, LatLngBounds } = gmapsRef.current;
        if (!Marker || !Size || !LatLngBounds) return;

        const defaultIcon = {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new Size(32, 32),
        };
        const highlightIcon = {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new Size(40, 40),
        };

        const withCoords = properties.filter(p => Number(p.latitude) && Number(p.longitude));

        // Remove old markers
        for (const [id, marker] of markersRef.current.entries()) {
            if (!withCoords.find(p => p.id === id)) {
                marker.setMap(null);
                markersRef.current.delete(id);
            }
        }

        // Add/update markers
        withCoords.forEach((p) => {
            const pos = { lat: Number(p.latitude), lng: Number(p.longitude) };
            let marker = markersRef.current.get(p.id);
            if (!marker) {
                marker = new Marker({
                    position: pos,
                    map,
                    title: p.title || '',
                    icon: defaultIcon,
                });
                marker.addListener('click', () => {
                    setSelectedProperty(p);
                    setMapZoom(15);
                });
                markersRef.current.set(p.id, marker);
            } else {
                marker.setPosition(pos);
                if (marker.getMap() !== map) marker.setMap(map);
            }
        });

        // Fit bounds
        if (withCoords.length > 0) {
            const bounds = new LatLngBounds();
            withCoords.forEach(p => bounds.extend({ lat: Number(p.latitude), lng: Number(p.longitude) }));
            map.fitBounds(bounds);
        } else if (location.lat && location.lng) {
            map.setCenter({ lat: Number(location.lat), lng: Number(location.lng) });
            map.setZoom(mapZoom);
        }

        // Highlight selected
        const selId = selectedProperty?.id;
        for (const [id, marker] of markersRef.current.entries()) {
            marker.setIcon(id === selId ? highlightIcon : defaultIcon);
            marker.setZIndex(id === selId ? 1000 : undefined);
        }
    }, [properties, selectedProperty, location.lat, location.lng, mapZoom]);

    // Handlers
    const handleLocationSelect = ({ lat, lng, name }) => {
        setLocation({ lat, lng, name });
        setMapZoom(14);
    };

    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
        if (property.latitude && property.longitude) {
            setMapZoom(15);
        }
    };

    const handlePropertyHover = (property) => {
        if (property.latitude && property.longitude) {
            setSelectedProperty(property);
        }
    };

    const handleRadiusChange = useCallback((newRadius) => {
        setRadius(newRadius);
        updateFilter('radius', newRadius);
    }, [updateFilter]);

    const handleZoomReset = () => {
        if (mapRef.current && location.lat && location.lng) {
            mapRef.current.setCenter({ lat: location.lat, lng: location.lng });
            mapRef.current.setZoom(12);
            setMapZoom(12);
        }
    };

    const handleMyLocation = () => {
        fetchBrowserLocation();
    };

    const handleClearAllFilters = () => {
        clearFilters();
        resetToCurrentLocation();
    };

    // Cursor-based "Load more": re-issue the same location/sort search using
    // the opaque next_cursor token and append the next page of results.
    const handleLoadMoreProperties = () => {
        if (!pagination.hasMore || !pagination.nextCursor) return;
        if (location.lat && location.lng) {
            fetchProperties(
                { lat: location.lat, lng: location.lng, radius, sort_by: sortBy },
                pagination.nextCursor,
                null,
                true
            );
        } else {
            fetchProperties({ sort_by: sortBy }, pagination.nextCursor, null, true);
        }
    };

    // Group properties by location
    const groupPropertiesByLocation = useMemo(() => {
        const grouped = {};
        properties.forEach(property => {
            const loc = property.city || 'Unknown Location';
            if (!grouped[loc]) {
                grouped[loc] = [];
            }
            grouped[loc].push(property);
        });
        return grouped;
    }, [properties]);

    const activeFiltersCount = getActiveFiltersCount();
    const displayProperties = groupByLocation ? groupPropertiesByLocation : { 'All Properties': properties };
    const gridClass = viewMode === 'grid-1' ? 'col-12' : 'col-lg-6';

    return (
        <div className="map-location map-location--compact">
            <div className="container container-two">
                <div className="row gy-4">
                    {/* Map Column - Show first on mobile */}
                    <div className="col-lg-4 order-1 order-lg-2">
                        <div className="google-map position-sticky top-120">
                            {/* Map Controls */}
                            <MapControls
                                mapType={mapType}
                                onMapTypeChange={setMapType}
                                onZoomReset={handleZoomReset}
                                onMyLocation={handleMyLocation}
                            />

                            {/* Radius Slider */}
                            <RadiusSlider
                                radius={radius}
                                onRadiusChange={handleRadiusChange}
                                min={1}
                                max={50}
                            />

                            {/* Current Location Info */}
                            <div className="mb-3">
                                <div className="card common-card">
                                    <div className="card-body p-3">
                                        <h6 className="card-title mb-2">
                                            <i className="fas fa-map-pin me-2 text-primary"></i>
                                            Search Location
                                        </h6>
                                        <p className="mb-0 small">
                                            <strong>{location.name}</strong><br />
                                            {location.lat && location.lng ? (
                                                <>
                                                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                                </>
                                            ) : (
                                                'Location not set'
                                            )}
                                        </p>
                                        {location.name !== 'Your Current Location' && (
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={resetToCurrentLocation}
                                            >
                                                <i className="fas fa-location-crosshairs me-1"></i>
                                                Use Current Location
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Selected Property Info */}
                            {selectedProperty && (
                                <div className="selected-property-info mb-3">
                                    <div className="card common-card border-primary">
                                        <div className="card-body p-3">
                                            <h6 className="mb-2">
                                                <i className="fas fa-home me-2 text-primary"></i>
                                                {selectedProperty.title}
                                            </h6>
                                            <p className="text-muted small mb-2">
                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                {selectedProperty.full_address || selectedProperty.address ||
                                                    [selectedProperty.locality, selectedProperty.city].filter(Boolean).join(', ')}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <p className="mb-0 fw-bold text-primary">
                                                    {selectedProperty.purpose === 'rent' ?
                                                        `₹${selectedProperty.monthly_rent?.toLocaleString()}/month` :
                                                        selectedProperty.purpose === 'short_stay' ?
                                                            `₹${selectedProperty.daily_rate?.toLocaleString()}/day` :
                                                            `₹${selectedProperty.base_price?.toLocaleString()}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Map */}
                            <div className="map-container map-container-dynamic">
                                <div
                                    ref={mapContainerRef}
                                    style={{ width: '100%', height: '100%', borderRadius: 8 }}
                                    aria-label="Property Map"
                                />
                            </div>

                            {/* Map Legend */}
                            <div className="mt-3">
                                <div className="card common-card">
                                    <div className="card-body">
                                        <h6 className="card-title mb-3">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Map Information
                                        </h6>
                                        <div className="small text-muted">
                                            <p className="mb-2">
                                                <i className="fas fa-mouse-pointer me-1"></i>
                                                Click on properties to focus map
                                            </p>
                                            <p className="mb-2">
                                                <i className="fas fa-draw-circle me-1"></i>
                                                Blue circle shows search radius
                                            </p>
                                            <p className="mb-0">
                                                <i className="fas fa-filter me-1"></i>
                                                Use filters to narrow results
                                            </p>
                                        </div>
                                        {properties.filter(p => p.latitude && p.longitude).length > 0 && (
                                            <div className="mt-2">
                                                <span className="badge bg-info text-dark">
                                                    {properties.filter(p => p.latitude && p.longitude).length} properties with locations
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Properties Column - Show second on mobile */}
                    <div className="col-lg-8 order-2 order-lg-1">
                        {/* Compact Filter Bar */}
                        <div className="map-filter-bar">
                            <div className="row align-items-center g-2">
                                {/* Location Search */}
                                <div className="col-12 col-md-4">
                                    <div className="position-relative">
                                        <GooglePlacesInput
                                            placeholder={location.name || "Search location..."}
                                            className="common-input common-input--compact common-input--withLeftIcon w-100"
                                            restrictCountry="in"
                                            onSelect={handleLocationSelect}
                                        />
                                        <span className="input-icon input-icon--left text-gradient">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </span>
                                    </div>
                                </div>

                                {/* Inline Quick Filters */}
                                <div className="col-12 col-md-5">
                                    <PropertyQuickFilters inline={true} />
                                </div>

                                {/* Sort & Advanced Filters */}
                                <div className="col-12 col-md-3">
                                    <div className="d-flex gap-2 justify-content-end align-items-center">
                                        <select
                                            className="control-select-sm"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="price_asc">Price: Low</option>
                                            <option value="price_desc">Price: High</option>
                                            <option value="distance">Nearest</option>
                                        </select>
                                        <button
                                            className={`btn btn-sm ${showFilters ? 'btn-main' : 'btn-outline-secondary'}`}
                                            onClick={() => setShowFilters(!showFilters)}
                                            title="Advanced Filters"
                                        >
                                            <i className="fas fa-sliders-h"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters (Collapsible) */}
                        {showFilters && (
                            <div className="mb-3">
                                <div className="card common-card">
                                    <div className="card-body">
                                        <PropertyFilters />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Info Bar */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small">
                                <strong>{properties.length}</strong> properties found
                                {location.name && location.name !== 'Your Current Location' && (
                                    <> near <strong>{location.name}</strong></>
                                )}
                            </span>
                            <div className="d-flex gap-2 align-items-center">
                                <button
                                    className={`btn btn-sm ${viewMode === 'grid-1' ? 'btn-main' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('grid-1')}
                                    title="Single column view"
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                                <button
                                    className={`btn btn-sm ${viewMode === 'grid-2' ? 'btn-main' : 'btn-outline-secondary'}`}
                                    onClick={() => setViewMode('grid-2')}
                                    title="Grid view"
                                >
                                    <i className="fas fa-th-large"></i>
                                </button>
                                <button
                                    className={`btn btn-sm ${groupByLocation ? 'btn-main' : 'btn-outline-secondary'}`}
                                    onClick={() => setGroupByLocation(!groupByLocation)}
                                    title={groupByLocation ? 'Show all' : 'Group by location'}
                                >
                                    <i className="fas fa-layer-group"></i>
                                </button>
                            </div>
                        </div>

                        {/* Error Messages */}
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        )}

                        {locationError && (
                            <div className="alert alert-warning" role="alert">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {locationError}
                                <button
                                    className="btn btn-sm btn-outline-warning ms-3"
                                    onClick={handleMyLocation}
                                >
                                    <i className="fas fa-location-crosshairs me-1"></i>
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="row gy-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={gridClass}>
                                        <LoadingSkeleton variant="card" count={1} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Properties Display */}
                        {!isLoading && (
                            <div className="map-location__content">
                                {Object.keys(displayProperties).length > 0 ? (
                                    Object.entries(displayProperties).map(([locationName, locationProperties], locationIndex) => (
                                        <div className="map-location__item mb-5" key={locationIndex}>
                                            {groupByLocation && (
                                                <h3 className="title text-poppins mb-3 fw-semibold">
                                                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                                                    {locationName} ({locationProperties.length} properties)
                                                </h3>
                                            )}
                                            <div className="row gy-4">
                                                {locationProperties.map((property, index) => (
                                                    <div className={gridClass} key={property.id}>
                                                        <div
                                                            className="h-100"
                                                            onMouseEnter={() => handlePropertyHover(property)}
                                                            onClick={() => handlePropertyClick(property)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <PropertyItem
                                                                property={property}
                                                                itemClass={`property-item--list property-item--map ${selectedProperty?.id === property.id ? 'selected' : ''}`}
                                                                iconsClass="text-gradient"
                                                                btnClass="btn-main"
                                                                badgeText={selectedProperty?.id === property.id ? "Selected" : index < 3 ? "Featured" : ""}
                                                                badgeClass={`property-item__badge ${selectedProperty?.id === property.id ? 'bg-success' : ''}`}
                                                                btnRenderBottom={true}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="mb-4">
                                            <i className="fas fa-map-marked-alt text-muted" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h5 className="text-muted">No properties found</h5>
                                        <p className="text-muted">
                                            Try adjusting your filters or search in a different location.
                                        </p>
                                        {activeFiltersCount > 0 && (
                                            <button
                                                className="btn btn-outline-main mt-3"
                                                onClick={handleClearAllFilters}
                                            >
                                                <i className="fas fa-times me-2"></i>
                                                Clear All Filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cursor-based Load More Button */}
                        {pagination.hasMore && (
                            <div className="text-center mt-5">
                                <button
                                    className="btn btn-main"
                                    onClick={handleLoadMoreProperties}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-plus me-2"></i>
                                            Load More Properties
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapLocationSection;

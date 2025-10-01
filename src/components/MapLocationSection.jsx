/* global google */
import React, { useEffect, useState, useMemo, useRef } from 'react';
// import { Link } from 'react-router-dom';
import usePropertyStore from '../store/propertyStore';
import { useLocationStore } from '../store/locationStore';
import PropertyItem from './items/PropertyItem';
import PropertyFilters from './PropertyFilters';
import GooglePlacesInput from '../common/GooglePlacesInput';
import { Loader } from '@googlemaps/js-api-loader';

const MapLocationSection = () => {
    const {
        properties,
        pagination,
        isLoading,
        error,
        fetchProperties,
        filters,
        setFilters,
        updateFilter,
        getActiveFiltersCount,
        clearFilters
    } = usePropertyStore();

    const {
        location,
        isLocating,
        error: locationError,
        initializeLocation,
        fetchBrowserLocation,
        setLocation,
        resetToCurrentLocation
    } = useLocationStore();

    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [mapZoom, setMapZoom] = useState(12);

    // Google Maps setup
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map()); // id -> marker
    const highlightedRef = useRef(null);
    const gmapsRef = useRef({ Map: null, Marker: null, Size: null, LatLngBounds: null });

    // Reuse a single loader instance
    const getMapsLoader = (() => {
        let loader;
        return () => {
            // If already loaded globally, return a no-op loader
            if (typeof window !== 'undefined' && window.google?.maps) {
                return { load: async () => {} };
            }
            if (!loader) {
                const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                if (!apiKey || apiKey === 'your_google_places_api_key_here') {
                    console.error('Google Maps API key missing. Set VITE_GOOGLE_PLACES_API_KEY or VITE_GOOGLE_MAPS_API_KEY.');
                    return null;
                }
                // Use the same id and libraries as GooglePlacesInput to avoid option mismatch
                loader = new Loader({ apiKey, version: 'weekly', id: 'google-maps-js', libraries: ['places'] });
            }
            return loader;
        };
    })();

    // Initialize location and fetch properties on component mount
    useEffect(() => {
        initializeLocation();
    }, []);

    // Fetch properties when location changes
    useEffect(() => {
        if (location.lat && location.lng) {
            fetchProperties({
                lat: location.lat,
                lng: location.lng,
                radius: filters.radius || 20
            });
        } else {
            fetchProperties();
        }
    }, [location.lat, location.lng]);

    // Initialize map once
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                const loader = getMapsLoader();
                if (!loader) return;
                await loader.load();
                // Ensure required libraries are present
                const { Map } = await google.maps.importLibrary('maps');
                const { Marker } = await google.maps.importLibrary('marker');
                const { LatLngBounds, Size } = await google.maps.importLibrary('core');
                if (!mounted || !mapContainerRef.current) return;

                gmapsRef.current = { Map, Marker, Size, LatLngBounds };
                if (!mounted || !mapContainerRef.current) return;
                const center = {
                    lat: location.lat || 28.4595,
                    lng: location.lng || 77.0266,
                };

                mapRef.current = new Map(mapContainerRef.current, {
                    center,
                    zoom: mapZoom,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });
            } catch (e) {
                console.error('Failed to init Google Map', e);
            }
        };
        init();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Create/update markers for all properties; fits bounds to show all
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        const { Marker, Size, LatLngBounds } = gmapsRef.current;
        if (!Marker || !Size || !LatLngBounds) return; // Not ready yet

        const defaultIcon = {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new Size(32, 32),
        };
        const highlightIcon = {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new Size(40, 40),
        };

        const withCoords = properties.filter(p => Number(p.latitude) && Number(p.longitude));

        // Remove markers that are no longer present
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

        // Fit bounds to show all markers
        if (withCoords.length > 0) {
            const bounds = new LatLngBounds();
            withCoords.forEach(p => bounds.extend({ lat: Number(p.latitude), lng: Number(p.longitude) }));
            map.fitBounds(bounds);
        } else if (location.lat && location.lng) {
            map.setCenter({ lat: Number(location.lat), lng: Number(location.lng) });
            map.setZoom(mapZoom);
        }

        // Update highlight state
        const selId = selectedProperty?.id;
        for (const [id, marker] of markersRef.current.entries()) {
            marker.setIcon(id === selId ? highlightIcon : defaultIcon);
            marker.setZIndex(id === selId ? 1000 : undefined);
        }
        highlightedRef.current = selId || null;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [properties, location.lat, location.lng]);

    // React to selection/zoom changes (pan/zoom and highlight)
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const sel = selectedProperty;
        const marker = sel ? markersRef.current.get(sel.id) : null;
        if (marker) {
            map.panTo(marker.getPosition());
            if (mapZoom) map.setZoom(mapZoom);
        }

        const { Size } = gmapsRef.current;
        if (!Size) return;
        const defaultIcon = {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new Size(32, 32),
        };
        const highlightIcon = {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new Size(40, 40),
        };
        for (const [id, mk] of markersRef.current.entries()) {
            mk.setIcon(sel && id === sel.id ? highlightIcon : defaultIcon);
            mk.setZIndex(sel && id === sel.id ? 1000 : undefined);
        }
    }, [selectedProperty, mapZoom]);

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
        if (property.latitude && property.longitude) setSelectedProperty(property);
    };

    const groupPropertiesByLocation = useMemo(() => {
        const grouped = {};
        properties.forEach(property => {
            const location = property.city || 'Unknown Location';
            if (!grouped[location]) {
                grouped[location] = [];
            }
            grouped[location].push(property);
        });
        return grouped;
    }, [properties]);

    const groupedProperties = groupPropertiesByLocation;
    const activeFiltersCount = getActiveFiltersCount();

    const handleClearAllFilters = () => {
        clearFilters();
        // Also reset to user's current location
        resetToCurrentLocation();
    };

    const handleLocationPermissionRequest = () => {
        fetchBrowserLocation();
    };

    return (
        <>
            <div className="map-location padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            {/* Header with location info and controls */}
                            <div className="property-filter__bottom flx-between gap-2 mt-0 mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <span className="property-filter__text font-18 fw-500 text-heading">
                                        {isLoading ? 'Loading...' : (
                                            <>
                                                Showing {properties.length} properties
                                                {pagination.total > 0 && ` of ${pagination.total}`}
                                                {location.name && ` in ${location.name}`}
                                            </>
                                        )}
                                        {activeFiltersCount > 0 && (
                                            <span className="badge bg-primary ms-2">{activeFiltersCount} filters</span>
                                        )}
                                    </span>
                                    {isLocating && (
                                        <span className="badge bg-info">
                                            <i className="fas fa-spinner fa-spin me-1"></i>
                                            Detecting location...
                                        </span>
                                    )}
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        className="btn btn-outline-main btn-sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <i className={`fas fa-filter me-2`}></i>
                                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                                    </button>
                                    {location.name !== 'Your Current Location' && (
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={handleLocationPermissionRequest}
                                            title="Use my current location"
                                        >
                                            <i className="fas fa-location-crosshairs me-2"></i>
                                            Use My Location
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Location Status */}
                            {locationError && (
                                <div className="alert alert-warning" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {locationError}
                                    <button
                                        className="btn btn-sm btn-outline-warning ms-3"
                                        onClick={handleLocationPermissionRequest}
                                    >
                                        <i className="fas fa-location-crosshairs me-1"></i>
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {/* Filters Section */}
                            {showFilters && (
                                <div className="mb-4">
                                    <div className="card common-card">
                                        <div className="card-body">
                                            <PropertyFilters />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Location Search */}
                            <div className="mb-4">
                                <div className="position-relative">
                                    <GooglePlacesInput
                                        placeholder={location.name || "Search by location to find properties..."}
                                        className="common-input common-input--withLeftIcon pill w-100"
                                        restrictCountry="in"
                                        onSelect={handleLocationSelect}
                                    />
                                    <span className="input-icon input-icon--left text-gradient">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </span>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Properties Display */}
                            <div className="map-location__content">
                                {Object.keys(groupedProperties).length > 0 ? (
                                    Object.entries(groupedProperties).map(([locationName, locationProperties], locationIndex) => (
                                        <div className="map-location__item mb-5" key={locationIndex}>
                                            <h3 className="title text-poppins mb-3 fw-semibold">
                                                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                                                {locationName} ({locationProperties.length} properties)
                                            </h3>
                                            <div className="row gy-4">
                                                {locationProperties.map((property, index) => (
                                                    <div className="col-lg-6" key={property.id}>
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
                                    !isLoading && (
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
                                    )
                                )}
                            </div>

                            {/* Load More Button */}
                            {pagination.page < pagination.totalPages && (
                                <div className="text-center mt-5">
                                    <button
                                        className="btn btn-main"
                                        onClick={() => fetchProperties({ page: pagination.page + 1 })}
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

                        <div className="col-lg-4">
                            <div className="google-map position-sticky top-120">
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
                                                    {selectedProperty.latitude && selectedProperty.longitude && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => setMapZoom(15)}
                                                        >
                                                            <i className="fas fa-search-plus"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Map */}
                                <div className="map-container">
                                    <div
                                        ref={mapContainerRef}
                                        style={{ width: '100%', height: 450, borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
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
                                                    <i className="fas fa-map-markers me-1"></i>
                                                    Map shows all property locations
                                                </p>
                                                <p className="mb-2">
                                                    <i className="fas fa-search me-1"></i>
                                                    Search by location to find nearby properties
                                                </p>
                                                <p className="mb-0">
                                                    <i className="fas fa-filter me-1"></i>
                                                    Use filters to narrow down results
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default MapLocationSection;
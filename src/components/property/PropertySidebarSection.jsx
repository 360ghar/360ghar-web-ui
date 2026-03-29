import { useState, useEffect }  from 'react';
import Pagination from '../../common/ui/Pagination';
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
        fetchProperties 
    } = usePropertyStore();
    
    const [filters, setFilters] = useState({});

    // Fetch properties whenever location or filters change
    useEffect(() => {
        if (location.lat && location.lng) {
            const searchPayload = {
                latitude: location.lat,
                longitude: location.lng,
                radius_km: 10,
                sort_by: 'distance',
                ...filters,
            };
            fetchProperties(searchPayload, 1); // Fetch page 1
        }
    }, [location, filters, fetchProperties]);

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (newPage) => {
        if (location.lat && location.lng) {
            const searchPayload = { 
                latitude: location.lat, 
                longitude: location.lng,
                radius_km: 10,
                ...filters 
            };
            fetchProperties(searchPayload, newPage);
        }
    };
    return (
        <>
            {/* =========================== Property Sidebar Section Start ====================== */}
            <section className="property bg-gray-100 padding-y-120">
                <div className="container container-two">
                    <div className="property-filter">   
                        <PropertyFilterBottom
                            total={pagination.total}
                            currentPage={pagination.page}
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
                                    <div className="text-success small">
                                        <i className="fas fa-map-marker-alt"></i> Showing properties near {location.name}
                                        {properties.length > 0 && (
                                            <span className="ms-2">({properties.length} found)</span>
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
                    {/* Pagination */}
                    {properties.length > 0 && pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </section>
            {/* =========================== Property Sidebar Section End ====================== */}
        </>
    );
};

export default PropertySidebarSection;

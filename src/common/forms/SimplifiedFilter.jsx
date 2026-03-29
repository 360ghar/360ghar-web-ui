import { useCallback }  from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../../store/propertyStore';
import { useLocationStore } from '../../store/locationStore';
import GooglePlacesInput from '../search/GooglePlacesInput';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';

const SimplifiedFilter = ({ buttonText = 'Search' }) => {
  const navigate = useNavigate();
  const {
    filters,
    updateFilter,
    clearFilters,
    isLoading
  } = usePropertyStore();
  
  const { location, setLocation } = useLocationStore();

  // Handle location selection from Google Places
  const handleLocationSelect = useCallback(({ lat, lng, name }) => {
    setLocation({ lat, lng, name });
    updateFilter('lat', lat);
    updateFilter('lng', lng);
  }, [setLocation, updateFilter]);

  // Build URL parameters from current filters
  const buildFilterParams = useCallback(() => {
    return buildPropertySearchQuery({
      purpose: filters.purpose,
      lat: filters.lat,
      lng: filters.lng,
      radius: filters.radius,
    });
  }, [filters]);

  // Handle search button click - navigate to properties page with filters
  const handleSearch = useCallback(() => {
    const filterParams = buildFilterParams();
    const url = filterParams ? `/properties?${filterParams}` : '/properties';
    navigate(url);
  }, [navigate, buildFilterParams]);

  // Handle view all properties button click - navigate to properties page without filters
  const handleViewAll = useCallback(() => {
    navigate('/properties');
  }, [navigate]);

  // Handle clear filters
  const handleClearFilters = () => {
    clearFilters();
    setLocation({ lat: null, lng: null, name: 'Search any location...' });
  };

  // Purpose is handled by the parent TabFilter component

  return (
    <div className="simplified-filter">
      <div className="row gy-4">
        
        {/* Location Search */}
        <div className="col-lg-6">
          <GooglePlacesInput
            placeholder={location?.name || 'Search any location, building, street...'}
            className="common-input pill w-100"
            restrictCountry="in"
            onSelect={handleLocationSelect}
          />
        </div>

        {/* Radius Selection (only show when location is set) */}
        {filters.lat && filters.lng && (
          <div className="col-lg-3">
            <div className="select-has-icon">
              <select
                className="form-select common-input pill"
                value={filters.radius || 20}
                onChange={(e) => updateFilter('radius', parseInt(e.target.value))}
              >
                <option value={5}>5 km radius</option>
                <option value={10}>10 km radius</option>
                <option value={20}>20 km radius</option>
                <option value={50}>50 km radius</option>
                <option value={100}>100 km radius</option>
              </select>
              <span className="input-icon input-icon--left text-gradient">
                <i className="fas fa-map-marker-alt"></i>
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`${filters.lat && filters.lng ? 'col-lg-3' : 'col-lg-6'}`}>
          <div className="d-flex gap-2 flex-wrap">
            <button 
              type="button" 
              className="btn btn-main flex-fill"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Searching...
                </>
              ) : (
                <>
                  <i className="fas fa-search me-2"></i>
                  {buttonText}
                </>
              )}
            </button>
            
            <button 
              type="button" 
              className="btn btn-outline-primary flex-fill"
              onClick={handleViewAll}
              disabled={isLoading}
            >
              <i className="fas fa-list me-2"></i>
              View All
            </button>
            
            {(filters.lat || filters.lng) && (
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={handleClearFilters}
                disabled={isLoading}
                title="Clear Location"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default SimplifiedFilter;

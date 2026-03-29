import { usePropertyStore } from '../../store/propertyStore';
import { useLocationStore } from '../../store/locationStore';
import GooglePlacesInput from '../../common/search/GooglePlacesInput';

const PropertyTopBar = () => {
  const {
    filters,
    updateFilter,
    applyFilters,
    isLoading
  } = usePropertyStore();

  const { location, setLocation } = useLocationStore();

  // Sort options matching API documentation
  // Handle location selection from Google Places
  const handleLocationSelect = ({ lat, lng, name }) => {
    setLocation({ lat, lng, name });
    updateFilter('lat', lat);
    updateFilter('lng', lng);
  };

  // Handle search on Enter key
  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      await applyFilters();
    }
  };

  return (
    <div className="property-top-bar">
      <div className="property-top-bar__search">
        <div className="property-top-bar__field">
          <label htmlFor="property-search-input" className="property-top-bar__label">
            <i className="fas fa-search"></i>
            Search
          </label>
          <input
            id="property-search-input"
            type="text"
            placeholder="Keyword, title, description..."
            className="common-input common-input--compact"
            value={filters.q || ''}
            onChange={(e) => updateFilter('q', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="property-top-bar__field property-top-bar__field--location">
          <span className="property-top-bar__label" role="presentation">
            <i className="fas fa-map-marker-alt"></i>
            Location
          </span>
          <GooglePlacesInput
            placeholder={location?.name && location?.lat ? location.name : 'City, area, locality...'}
            className="common-input common-input--compact w-100"
            restrictCountry="in"
            onSelect={handleLocationSelect}
          />
        </div>
      </div>

      <div className="property-top-bar__actions">
        <button
          type="button"
          className="btn btn-main property-top-bar__btn"
          onClick={applyFilters}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span className="ms-2">Searching</span>
            </>
          ) : (
            <>
              <i className="fas fa-search"></i>
              <span className="ms-2">Search</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PropertyTopBar;

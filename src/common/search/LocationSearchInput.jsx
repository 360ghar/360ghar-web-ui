import { useState } from 'react';
import { useI18nNavigate } from '../../i18n/I18nLink';
import { useLocationStore } from '../../store/locationStore';
import GooglePlacesInput from './GooglePlacesInput';

const LocationSearchInput = ({ placeholder = "Search location..." }) => {
  const navigate = useI18nNavigate();
  const { location, setLocation } = useLocationStore();
  const [radius, setRadius] = useState(20);

  const handleLocationSelect = ({ lat, lng, name }) => {
    setLocation({ lat, lng, name });

    // Automatically navigate to property page with location
    const params = new URLSearchParams();
    params.set('lat', lat.toString());
    params.set('lng', lng.toString());
    params.set('radius', radius.toString());
    params.set('sort_by', 'distance');

    navigate(`/properties?${params.toString()}`);
  };

  const handleRadiusChange = (e) => {
    setRadius(parseInt(e.target.value));
  };

  return (
    <div className="location-search-input">
      <div className="row g-2 align-items-end">
        <div className="col-md-8">
          <GooglePlacesInput
            placeholder={location.name || placeholder}
            className="common-input w-100"
            restrictCountry="in"
            onSelect={handleLocationSelect}
          />
        </div>
        <div className="col-md-4">
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 small">Radius:</label>
            <select
              className="form-select form-select-sm"
              value={radius}
              onChange={handleRadiusChange}
              style={{ maxWidth: '80px' }}
            >
              <option value="5">5km</option>
              <option value="10">10km</option>
              <option value="20">20km</option>
              <option value="50">50km</option>
              <option value="100">100km</option>
            </select>
          </div>
        </div>
      </div>

      {location.lat && location.lng && (
        <div className="location-info mt-2">
          <small className="text-muted">
            <i className="fas fa-map-marker-alt me-1"></i>
            Searching around: {location.name} (within {radius}km)
          </small>
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
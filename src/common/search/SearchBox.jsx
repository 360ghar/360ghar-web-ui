import { useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useLocationStore } from '../../store/locationStore';
import GooglePlacesInput from './GooglePlacesInput';
import {
  PROPERTY_TYPE_FILTER_OPTIONS,
  PURPOSE_OPTIONS,
} from '../../utils/propertyTaxonomy';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';

const quickSearchTypeOptions = PROPERTY_TYPE_FILTER_OPTIONS.filter(
  ({ value }) => ['apartment', 'house', 'pg', 'commercial'].includes(value)
);

const SearchBox = () => {
  const navigate = useNavigate();
  const { location, setLocation } = useLocationStore();
  const [searchMode, setSearchMode] = useState('general'); // 'general' or 'location'

  const formik = useFormik({
    initialValues: {
      keyword: '',
      type: 'All',
      purpose: 'all',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      radius: '20'
    },
    onSubmit: (values) => {
      const query = buildPropertySearchQuery({
        q: values.keyword,
        property_type: values.type && values.type !== 'All' ? [values.type] : [],
        purpose: values.purpose,
        price_min: values.minPrice || null,
        price_max: values.maxPrice || null,
        bedrooms_min: values.bedrooms || null,
        lat: location.lat || null,
        lng: location.lng || null,
        radius: location.lat && location.lng ? values.radius || '20' : null,
        sort_by: location.lat && location.lng
          ? searchMode === 'location'
            ? 'distance'
            : 'relevance'
          : 'newest',
      });

      navigate(`/properties?${query}`);
    },
  });

  return (
    <>
      <div className="search-box mt-5">
        <div className="search-mode-toggle mb-3">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${searchMode === 'general' ? 'btn-main' : 'btn-outline-secondary'} btn-sm`}
              onClick={() => setSearchMode('general')}
            >
              <i className="fas fa-search me-1"></i>
              General Search
            </button>
            <button
              type="button"
              className={`btn ${searchMode === 'location' ? 'btn-main' : 'btn-outline-secondary'} btn-sm`}
              onClick={() => setSearchMode('location')}
            >
              <i className="fas fa-map-marker-alt me-1"></i>
              Location Search
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="row g-2">
            {searchMode === 'general' ? (
              <>
                <div className="col-md-5">
                  <input
                    type="text"
                    className="common-input common-input--light"
                    placeholder="Search by keyword, title, or description..."
                    name="keyword"
                    value={formik.values.keyword}
                    onChange={formik.handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="common-input common-input--light"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                  >
                    <option value="All">All Types</option>
                    {quickSearchTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <select
                    className="common-input common-input--light"
                    name="purpose"
                    value={formik.values.purpose}
                    onChange={formik.handleChange}
                  >
                    {PURPOSE_OPTIONS.map((option) => (
                      <option key={option.value || 'all'} value={option.value || 'all'}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-grid">
                  <button type="submit" className="btn btn-main w-100">
                    <i className="fas fa-search me-2"></i>
                    Search
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-4">
                  <GooglePlacesInput
                    placeholder={location.name || 'Enter location, city, or area...'}
                    className="common-input common-input--light w-100"
                    restrictCountry="in"
                    types={["(cities)"]}
                    onSelect={({ lat, lng, name }) => setLocation({ lat, lng, name })}
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="common-input common-input--light"
                    name="radius"
                    value={formik.values.radius}
                    onChange={formik.handleChange}
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                    <option value="50">50 km</option>
                    <option value="100">100 km</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="common-input common-input--light"
                    placeholder="Min Price"
                    name="minPrice"
                    value={formik.values.minPrice}
                    onChange={formik.handleChange}
                    min="0"
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="common-input common-input--light"
                    placeholder="Max Price"
                    name="maxPrice"
                    value={formik.values.maxPrice}
                    onChange={formik.handleChange}
                    min="0"
                  />
                </div>
                <div className="col-md-2 d-grid">
                  <button type="submit" className="btn btn-main w-100">
                    <i className="fas fa-search me-2"></i>
                    Find Nearby
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick filters for location search */}
          {searchMode === 'location' && location.lat && location.lng && (
            <div className="row g-2 mt-2">
              <div className="col-md-3">
                <select
                  className="common-input common-input--light form-select-sm"
                  name="bedrooms"
                  value={formik.values.bedrooms}
                  onChange={formik.handleChange}
                >
                  <option value="">Bedrooms</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="common-input common-input--light form-select-sm"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                >
                  <option value="All">All Types</option>
                  {quickSearchTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="common-input common-input--light form-select-sm"
                  name="purpose"
                  value={formik.values.purpose}
                  onChange={formik.handleChange}
                >
                  {PURPOSE_OPTIONS.map((option) => (
                    <option key={option.value || 'all'} value={option.value || 'all'}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-outline-primary w-100">
                  <i className="fas fa-filter me-2"></i>
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default SearchBox;

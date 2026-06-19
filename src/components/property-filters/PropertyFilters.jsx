import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { usePropertyStore } from '../../store/propertyStore';
import { useLocationStore } from '../../store/locationStore';
import {
  COMMERCIAL_PROPERTY_TYPES,
  GENDER_PREFERENCE_OPTIONS,
  PROPERTY_TYPE_FILTER_OPTIONS,
  PURPOSE_OPTIONS,
  SHARING_TYPE_OPTIONS,
  getPropertyTypeLabel,
  includesPgOrFlatmateType,
  isCommercialSelection,
} from '../../utils/propertyTaxonomy';

const PropertyFilters = ({ showAdvanced = false, isMobile = false, onCloseDrawer }) => {
  const { t } = useTranslation('properties');
  const {
    filters,
    updateFilter,
    clearFilters,
    applyFilters,
    setFilters,
    isLoading,
    filtersChanged,
    getActiveFiltersCount
  } = usePropertyStore();

  const { setLocation } = useLocationStore();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(showAdvanced);
  const [removingChip, setRemovingChip] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // AUDIT FIX (improvement 2.2): saved searches (localStorage, no auth needed
  // for the minimal version). Users can save the current filter set and
  // re-apply it later.
  const SAVED_SEARCHES_KEY = 'property_saved_searches';
  const [savedSearches, setSavedSearches] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVED_SEARCHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  const persistSavedSearches = (list) => {
    setSavedSearches(list);
    try {
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  };

  const handleSaveSearch = () => {
    const count = getActiveFiltersCount();
    if (count === 0) {
      toast.info(t('filters.saveSearchEmpty'), { theme: 'colored' });
      return;
    }
    const name = `${t('filters.savedSearchDefault')} ${savedSearches.length + 1}`;
    const entry = { id: Date.now(), name, filters: { ...filters } };
    persistSavedSearches([entry, ...savedSearches].slice(0, 10));
    toast.success(t('filters.saveSearchSuccess'), { theme: 'colored' });
    setShowSavedSearches(false);
  };

  const handleLoadSavedSearch = (entry) => {
    setFilters(entry.filters);
    setShowSavedSearches(false);
    toast.success(t('filters.saveSearchLoaded'), { theme: 'colored' });
  };

  const handleDeleteSavedSearch = (id) => {
    persistSavedSearches(savedSearches.filter((s) => s.id !== id));
  };

  const activeFiltersCount = getActiveFiltersCount();
  const advancedFiltersId = 'property-advanced-filters';

  const propertyTypes = PROPERTY_TYPE_FILTER_OPTIONS;
  const purposes = PURPOSE_OPTIONS;

  // Bedroom options
  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4+ BHK' }
  ];

  // Amenities list
  const amenities = [
    'Parking', 'Security', 'Garden', 'Gym', 'Swimming Pool', 'Power Backup',
    'Water Supply', 'Waste Management', 'Intercom', 'Gas Pipeline', 'WiFi',
    'Air Conditioning', 'RO Water System', 'Servant Room', 'Study Room'
  ];

  // Features list
  const features = [
    'Furnished', 'Semi-Furnished', 'Unfurnished', 'Modular Kitchen',
    'Built-in Wardrobes', 'False Ceiling', 'Wooden Flooring', 'Marble Flooring',
    'Corner Property', 'Park Facing', 'Main Road Facing', 'East Facing'
  ];

  // Helper to format price
  const formatPrice = (price) => {
    if (!price) return '';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(0)}L`;
    }
    return `₹${price}`;
  };

  // Get active filters as array of chips
  const getActiveFilterChips = () => {
    const chips = [];
    const selectedTypes = [...(filters.property_type || [])];

    // Purpose
    if (filters.purpose) {
      const purposeOption = purposes.find(p => p.value === filters.purpose);
      const purposeLabel = purposeOption ? t(purposeOption.labelKey) : null;
      if (purposeLabel) {
        chips.push({
          id: 'purpose',
          label: 'Purpose',
          value: purposeLabel,
          onRemove: () => updateFilter('purpose', '')
        });
      }
    }

    // Property Types
    if (isCommercialSelection(selectedTypes)) {
      chips.push({
        id: 'type-commercial',
        label: 'Type',
        value: 'Commercial',
        onRemove: () => handlePropertyTypeChange('commercial', false)
      });
    }
    const explicitTypes = isCommercialSelection(selectedTypes)
      ? selectedTypes.filter(type => !COMMERCIAL_PROPERTY_TYPES.includes(type))
      : selectedTypes;
    explicitTypes.forEach(type => {
      chips.push({
        id: `type-${type}`,
        label: 'Type',
        value: getPropertyTypeLabel(type, t),
        onRemove: () => handlePropertyTypeChange(type, false)
      });
    });

    if (filters.gender_preference) {
      const genderOption = GENDER_PREFERENCE_OPTIONS.find(
        (option) => option.value === filters.gender_preference
      );
      const genderLabel = genderOption ? t(genderOption.labelKey) : null;
      if (genderLabel) {
        chips.push({
          id: 'gender-preference',
          label: 'Gender',
          value: genderLabel,
          onRemove: () => updateFilter('gender_preference', '')
        });
      }
    }

    if (filters.sharing_type) {
      const sharingOption = SHARING_TYPE_OPTIONS.find(
        (option) => option.value === filters.sharing_type
      );
      const sharingLabel = sharingOption ? t(sharingOption.labelKey) : null;
      if (sharingLabel) {
        chips.push({
          id: 'sharing-type',
          label: 'Room Type',
          value: sharingLabel,
          onRemove: () => updateFilter('sharing_type', '')
        });
      }
    }

    // Budget
    if (filters.price_min !== null || filters.price_max !== null) {
      const min = filters.price_min ? formatPrice(filters.price_min) : '0';
      const max = filters.price_max ? formatPrice(filters.price_max) : 'Any';
      chips.push({
        id: 'budget',
        label: 'Budget',
        value: `${min} - ${max}`,
        onRemove: () => {
          updateFilter('price_min', null);
          updateFilter('price_max', null);
        }
      });
    }

    // Bedrooms
    if (filters.bedrooms_min !== null) {
      const label = filters.bedrooms_min >= 4 ? '4+ BHK' : `${filters.bedrooms_min} BHK`;
      chips.push({
        id: 'bedrooms',
        label: 'BHK',
        value: label,
        onRemove: () => {
          updateFilter('bedrooms_min', null);
          updateFilter('bedrooms_max', null);
        }
      });
    }

    // Bathrooms
    if (filters.bathrooms_min !== null || filters.bathrooms_max !== null) {
      const min = filters.bathrooms_min || '0';
      const max = filters.bathrooms_max || 'Any';
      chips.push({
        id: 'bathrooms',
        label: 'Bathrooms',
        value: `${min} - ${max}`,
        onRemove: () => {
          updateFilter('bathrooms_min', null);
          updateFilter('bathrooms_max', null);
        }
      });
    }

    // Area
    if (filters.area_min !== null || filters.area_max !== null) {
      const min = filters.area_min || '0';
      const max = filters.area_max || 'Any';
      chips.push({
        id: 'area',
        label: 'Area',
        value: `${min} - ${max} sqft`,
        onRemove: () => {
          updateFilter('area_min', null);
          updateFilter('area_max', null);
        }
      });
    }

    // Amenities
    if (filters.amenities?.length > 0) {
      filters.amenities.forEach(amenity => {
        chips.push({
          id: `amenity-${amenity}`,
          label: 'Amenity',
          value: amenity,
          onRemove: () => handleAmenityChange(amenity, false)
        });
      });
    }

    // Features
    if (filters.features?.length > 0) {
      filters.features.forEach(feature => {
        chips.push({
          id: `feature-${feature}`,
          label: 'Feature',
          value: feature,
          onRemove: () => handleFeatureChange(feature, false)
        });
      });
    }

    // Location
    if (filters.city) {
      chips.push({
        id: 'city',
        label: 'City',
        value: filters.city,
        onRemove: () => updateFilter('city', '')
      });
    }

    if (filters.locality) {
      chips.push({
        id: 'locality',
        label: 'Area',
        value: filters.locality,
        onRemove: () => updateFilter('locality', '')
      });
    }

    // Radius
    if (filters.radius && filters.lat && filters.lng) {
      chips.push({
        id: 'radius',
        label: 'Radius',
        value: `${filters.radius} km`,
        onRemove: () => updateFilter('radius', 20)
      });
    }

    return chips;
  };

  const activeChips = getActiveFilterChips();

  // Handle chip removal with animation
  const handleChipRemove = (chip) => {
    setRemovingChip(chip.id);
    setTimeout(() => {
      chip.onRemove();
      setRemovingChip(null);
    }, 200);
  };

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Handle property type change (multi-select)
  const handlePropertyTypeChange = useCallback((type, checked) => {
    const currentTypes = [...(filters.property_type || [])];
    if (type === 'commercial') {
      const nextTypes = checked
        ? [...new Set([...currentTypes, ...COMMERCIAL_PROPERTY_TYPES])]
        : currentTypes.filter((value) => !COMMERCIAL_PROPERTY_TYPES.includes(value));
      updateFilter('property_type', nextTypes);
      return;
    }
    if (checked) {
      if (!currentTypes.includes(type)) {
        updateFilter('property_type', [...currentTypes, type]);
      }
    } else {
      updateFilter('property_type', currentTypes.filter(t => t !== type));
    }
  }, [filters.property_type, updateFilter]);

  // Handle amenity change (multi-select)
  const handleAmenityChange = useCallback((amenity, checked) => {
    const currentAmenities = [...(filters.amenities || [])];
    if (checked) {
      if (!currentAmenities.includes(amenity)) {
        updateFilter('amenities', [...currentAmenities, amenity]);
      }
    } else {
      updateFilter('amenities', currentAmenities.filter(a => a !== amenity));
    }
  }, [filters.amenities, updateFilter]);

  // Handle feature change (multi-select)
  const handleFeatureChange = useCallback((feature, checked) => {
    const currentFeatures = [...(filters.features || [])];
    if (checked) {
      if (!currentFeatures.includes(feature)) {
        updateFilter('features', [...currentFeatures, feature]);
      }
    } else {
      updateFilter('features', currentFeatures.filter(f => f !== feature));
    }
  }, [filters.features, updateFilter]);

  // Handle bedroom selection
  const handleBedroomChange = (value) => {
    if (value === '') {
      updateFilter('bedrooms_min', null);
      updateFilter('bedrooms_max', null);
    } else if (value === '4') {
      updateFilter('bedrooms_min', 4);
      updateFilter('bedrooms_max', null);
    } else {
      const num = parseInt(value);
      updateFilter('bedrooms_min', num);
      updateFilter('bedrooms_max', num);
    }
  };

  // Get current bedroom value for display
  const getCurrentBedroomValue = () => {
    if (!filters.bedrooms_min && !filters.bedrooms_max) return '';
    if (filters.bedrooms_min >= 4) return '4';
    if (filters.bedrooms_min === filters.bedrooms_max) return String(filters.bedrooms_min);
    return '';
  };

  // Handle search button click
  const handleSearch = async () => {
    if (!filtersChanged && !isLoading) return;
    await applyFilters();
    if (isMobile && onCloseDrawer) {
      onCloseDrawer();
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    clearFilters();
    setLocation({ lat: null, lng: null, name: 'Search any location...' });
    showToastMessage('All filters cleared');
  };

  // Render active filter chips
  const renderActiveChips = () => {
    if (activeChips.length === 0) return null;

    return (
      <div className="active-filters-bar">
        <span className="active-filters-label">Active:</span>
        {activeChips.map(chip => (
          <div
            key={chip.id}
            className={`filter-chip ${removingChip === chip.id ? 'removing' : ''}`}
          >
            <span className="filter-chip__label">{chip.label}:</span>
            <span className="filter-chip__value">{chip.value}</span>
            <button
              className="filter-chip__remove"
              onClick={() => handleChipRemove(chip)}
              title="Remove filter"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
        <button className="clear-all-btn" onClick={handleClearFilters}>
          <i className="fas fa-times"></i>
          Clear All
        </button>
      </div>
    );
  };

  // Render filter sidebar content
  const renderFilterContent = () => (
    <>
      {/* Purpose */}
      <div className="filter-group">
        <h6 className="filter-group__title">Purpose</h6>
        <div className="filter-group__content">
          {purposes.map(purpose => (
            <div key={purpose.value} className="common-radio">
              <input
                className="form-check-input"
                type="radio"
                name="purpose"
                id={`purpose-${purpose.value || 'all'}`}
                value={purpose.value}
                checked={(filters.purpose || '') === purpose.value}
                onChange={(e) => updateFilter('purpose', e.target.value)}
                style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
              />
              <label className="form-check-label" htmlFor={`purpose-${purpose.value || 'all'}`}>
                {t(purpose.labelKey)}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="filter-group filter-group--two-col">
        <h6 className="filter-group__title">Property Type</h6>
        <div className="filter-group__content">
          {propertyTypes.map(type => (
            <div key={type.value} className="common-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`type-${type.value}`}
                checked={
                  type.value === 'commercial'
                    ? isCommercialSelection(filters.property_type || [])
                    : filters.property_type?.includes(type.value) || false
                }
                onChange={(e) => handlePropertyTypeChange(type.value, e.target.checked)}
                style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
              />
              <label className="form-check-label" htmlFor={`type-${type.value}`}>
                {t(type.labelKey)}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="filter-group">
        <h6 className="filter-group__title">Budget</h6>
        <div className="filter-group__content">
          <div className="filter-group__row">
            <input
              type="number"
              placeholder="Min"
              className="common-input common-input--sm"
              value={filters.price_min || ''}
              onChange={(e) => updateFilter('price_min', e.target.value ? parseFloat(e.target.value) : null)}
              min="0"
            />
            <span className="filter-group__separator">-</span>
            <input
              type="number"
              placeholder="Max"
              className="common-input common-input--sm"
              value={filters.price_max || ''}
              onChange={(e) => updateFilter('price_max', e.target.value ? parseFloat(e.target.value) : null)}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="filter-group">
        <h6 className="filter-group__title">Bedrooms</h6>
        <div className="filter-group__content">
          <div className="bedroom-buttons">
            {bedroomOptions.map(option => (
              <button
                key={option.value}
                type="button"
                className={`bedroom-btn ${getCurrentBedroomValue() === option.value ? 'active' : ''}`}
                onClick={() => handleBedroomChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location Radius (when location is set) */}
      {filters.lat && filters.lng && (
        <div className="filter-group">
          <h6 className="filter-group__title">Search Radius</h6>
          <div className="filter-group__content">
            <select
              className="form-select common-input common-input--sm"
              value={filters.radius || 20}
              onChange={(e) => updateFilter('radius', parseInt(e.target.value))}
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <div className="filter-group">
        <button
          type="button"
          className="filter-group__toggle"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          aria-expanded={showAdvancedFilters}
          aria-controls={advancedFiltersId}
        >
          <span>{showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters</span>
          <i className={`fas fa-chevron-${showAdvancedFilters ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="filter-group filter-group--advanced" id={advancedFiltersId}>
          {/* Bathrooms */}
          <div className="filter-group__section">
            <h6 className="filter-group__subtitle">Bathrooms</h6>
            <div className="filter-group__row">
              <input
                type="number"
                placeholder="Min"
                className="common-input common-input--sm"
                value={filters.bathrooms_min || ''}
                onChange={(e) => updateFilter('bathrooms_min', e.target.value ? parseInt(e.target.value) : null)}
                min="0"
                max="10"
              />
              <span className="filter-group__separator">-</span>
              <input
                type="number"
                placeholder="Max"
                className="common-input common-input--sm"
                value={filters.bathrooms_max || ''}
                onChange={(e) => updateFilter('bathrooms_max', e.target.value ? parseInt(e.target.value) : null)}
                min="0"
                max="10"
              />
            </div>
          </div>

          {/* Area */}
          <div className="filter-group__section">
            <h6 className="filter-group__subtitle">Area (sqft)</h6>
            <div className="filter-group__row">
              <input
                type="number"
                placeholder="Min"
                className="common-input common-input--sm"
                value={filters.area_min || ''}
                onChange={(e) => updateFilter('area_min', e.target.value ? parseFloat(e.target.value) : null)}
                min="0"
              />
              <span className="filter-group__separator">-</span>
              <input
                type="number"
                placeholder="Max"
                className="common-input common-input--sm"
                value={filters.area_max || ''}
                onChange={(e) => updateFilter('area_max', e.target.value ? parseFloat(e.target.value) : null)}
                min="0"
              />
            </div>
          </div>

          {/* Floor */}
          <div className="filter-group__section">
            <h6 className="filter-group__subtitle">Floor</h6>
            <div className="filter-group__row">
              <input
                type="number"
                placeholder="Min"
                className="common-input common-input--sm"
                value={filters.floor_number_min || ''}
                onChange={(e) => updateFilter('floor_number_min', e.target.value ? parseInt(e.target.value) : null)}
                min="0"
                max="100"
              />
              <span className="filter-group__separator">-</span>
              <input
                type="number"
                placeholder="Max"
                className="common-input common-input--sm"
                value={filters.floor_number_max || ''}
                onChange={(e) => updateFilter('floor_number_max', e.target.value ? parseInt(e.target.value) : null)}
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div className="filter-group__section">
            <h6 className="filter-group__subtitle">Other</h6>
            <div className="filter-group__row mb-2">
              <input
                type="number"
                placeholder="Min Parking"
                className="common-input common-input--sm flex-grow-1"
                value={filters.parking_spaces_min || ''}
                onChange={(e) => updateFilter('parking_spaces_min', e.target.value ? parseInt(e.target.value) : null)}
                min="0"
              />
            </div>
            <div className="filter-group__row">
              <input
                type="number"
                placeholder="Max Age (years)"
                className="common-input common-input--sm flex-grow-1"
                value={filters.age_max || ''}
                onChange={(e) => updateFilter('age_max', e.target.value ? parseInt(e.target.value) : null)}
                min="0"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="filter-group__section">
            <h6 className="filter-group__subtitle">Location</h6>
            <input
              type="text"
              placeholder="City"
              className="common-input common-input--sm mb-2"
              value={filters.city || ''}
              onChange={(e) => updateFilter('city', e.target.value)}
            />
            <input
              type="text"
              placeholder="Locality/Area"
              className="common-input common-input--sm mb-2"
              value={filters.locality || ''}
              onChange={(e) => updateFilter('locality', e.target.value)}
            />
            <input
              type="text"
              placeholder="PIN Code"
              className="common-input common-input--sm"
              value={filters.pincode || ''}
              onChange={(e) => updateFilter('pincode', e.target.value)}
            />
          </div>

          {includesPgOrFlatmateType(filters.property_type || []) && (
            <div className="filter-group__section">
              <h6 className="filter-group__subtitle">PG / Flatmate Preferences</h6>
              <div className="mb-2">
                <label className="form-label small">Gender Preference</label>
                <select
                  className="form-select common-input common-input--sm"
                  value={filters.gender_preference || ''}
                  onChange={(e) => updateFilter('gender_preference', e.target.value)}
                >
                    {GENDER_PREFERENCE_OPTIONS.map((option) => (
                    <option key={option.value || 'gender-any'} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label small">Room Type</label>
                <select
                  className="form-select common-input common-input--sm"
                  value={filters.sharing_type || ''}
                  onChange={(e) => updateFilter('sharing_type', e.target.value)}
                >
                    {SHARING_TYPE_OPTIONS.map((option) => (
                    <option key={option.value || 'sharing-any'} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Short Stay Filters */}
          {filters.purpose === 'short_stay' && (
            <div className="filter-group__section">
              <h6 className="filter-group__subtitle">Short Stay</h6>
              <div className="mb-2">
                <label className="form-label small">Check-in</label>
                <input
                  type="date"
                  className="common-input common-input--sm"
                  value={filters.check_in || ''}
                  onChange={(e) => updateFilter('check_in', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small">Check-out</label>
                <input
                  type="date"
                  className="common-input common-input--sm"
                  value={filters.check_out || ''}
                  onChange={(e) => updateFilter('check_out', e.target.value)}
                />
              </div>
              <input
                type="number"
                placeholder="Number of Guests"
                className="common-input common-input--sm"
                value={filters.guests || ''}
                onChange={(e) => updateFilter('guests', e.target.value ? parseInt(e.target.value) : null)}
                min="1"
                max="20"
              />
            </div>
          )}

          {/* Amenities */}
          <div className="filter-group__section">
            <h6 className="filter-group__subtitle">Amenities</h6>
            <div className="filter-group__grid filter-group__grid--two-col">
              {amenities.map(amenity => (
                <div key={amenity} className="common-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={filters.amenities?.includes(amenity) || false}
                    onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`amenity-${amenity}`}>
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="filter-group__section">
            <h6 className="filter-group__subtitle">Features</h6>
            <div className="filter-group__grid filter-group__grid--two-col">
              {features.map(feature => (
                <div key={feature} className="common-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`feature-${feature}`}
                    checked={filters.features?.includes(feature) || false}
                    onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor={`feature-${feature}`}>
                    {feature}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="filter-group filter-group--actions">
        {/* AUDIT FIX (improvement 2.2): saved searches */}
        <div className="d-flex gap-2 mb-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm flex-fill"
            onClick={handleSaveSearch}
            disabled={isLoading}
            title={t('filters.saveSearch')}
          >
            <i className="fas fa-bookmark me-1"></i> {t('filters.saveSearch')}
          </button>
          {savedSearches.length > 0 && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
            >
              <i className="fas fa-list me-1"></i> {t('filters.mySearches')}
            </button>
          )}
        </div>
        {showSavedSearches && savedSearches.length > 0 && (
          <div className="saved-searches-list mb-2">
            {savedSearches.map((entry) => (
              <div key={entry.id} className="saved-search-item d-flex align-items-center justify-content-between">
                <button
                  type="button"
                  className="saved-search-item__name flex-fill text-start"
                  onClick={() => handleLoadSavedSearch(entry)}
                >
                  <i className="fas fa-bookmark me-1 text-muted"></i> {entry.name}
                </button>
                <button
                  type="button"
                  className="saved-search-item__remove btn btn-link btn-sm text-danger p-0"
                  onClick={() => handleDeleteSavedSearch(entry.id)}
                  aria-label={t('filters.removeSavedSearch')}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className={`btn btn-main w-100 ${filtersChanged ? 'btn-main-active' : ''}`}
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
              Search
              {activeFiltersCount > 0 && (
                <span className="badge bg-white text-primary ms-2">{activeFiltersCount}</span>
              )}
            </>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            <i className="fas fa-times me-2"></i>
            Clear Filters
          </button>
        )}
      </div>
    </>
  );

  // Mobile drawer view
  if (isMobile) {
    return (
      <>
        <div className="filter-drawer__header">
          <h5>Filters</h5>
          <button className="filter-drawer__close" onClick={onCloseDrawer}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="filter-drawer__content">
          <div className="property-sidebar-wrapper">
            <div className="property-filter-sidebar">
              {renderFilterContent()}
            </div>
          </div>
        </div>
        <div className="filter-drawer__footer">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className={`btn btn-main ${filtersChanged ? 'btn-main-active' : ''}`}
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
                Apply
                {activeFiltersCount > 0 && (
                  <span className="badge bg-white text-primary ms-2">{activeFiltersCount}</span>
                )}
              </>
            )}
          </button>
        </div>
      </>
    );
  }

  // Desktop view with active chips
  return (
    <>
      {renderActiveChips()}
      <div className="property-filter-sidebar">
        {renderFilterContent()}
      </div>
      
      {/* Toast Notification */}
      <div className={`filter-toast ${showToast ? 'show' : ''}`}>
        <i className="fas fa-check-circle"></i>
        {toastMessage}
      </div>
    </>
  );
};

export default PropertyFilters;

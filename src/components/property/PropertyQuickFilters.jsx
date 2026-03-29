import { usePropertyStore } from '../../store/propertyStore';
import {
  COMMERCIAL_PROPERTY_TYPES,
  isCommercialSelection,
} from '../../utils/propertyTaxonomy';

const PropertyQuickFilters = ({ inline = false }) => {
  const { filters, updateFilter, clearFilters, getActiveFiltersCount } = usePropertyStore();

  const bhkOptions = [
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4+ BHK' }
  ];

  const budgetOptions = [
    { value: '0-2000000', label: 'Under 20L', min: 0, max: 2000000 },
    { value: '2000000-5000000', label: '20L - 50L', min: 2000000, max: 5000000 },
    { value: '5000000-10000000', label: '50L - 1Cr', min: 5000000, max: 10000000 },
    { value: '10000000-99999999', label: 'Above 1Cr', min: 10000000, max: 99999999 }
  ];

  const propertyTypeOptions = [
    { value: 'house', label: 'House', icon: 'fa-home' },
    { value: 'apartment', label: 'Apt', icon: 'fa-building' },
    { value: 'pg', label: 'PG', icon: 'fa-bed' },
    { value: 'commercial', label: 'Commercial', icon: 'fa-briefcase' }
  ];

  const handleBHKClick = (value) => {
    if (filters.bedrooms_min === parseInt(value)) {
      updateFilter('bedrooms_min', null);
      updateFilter('bedrooms_max', null);
    } else {
      updateFilter('bedrooms_min', parseInt(value));
      if (value === '4') {
        updateFilter('bedrooms_max', null);
      } else {
        updateFilter('bedrooms_max', parseInt(value));
      }
    }
  };

  const handleBudgetClick = (option) => {
    const currentMin = filters.price_min;
    const currentMax = filters.price_max;

    if (currentMin === option.min && currentMax === option.max) {
      updateFilter('price_min', null);
      updateFilter('price_max', null);
    } else {
      updateFilter('price_min', option.min);
      updateFilter('price_max', option.max);
    }
  };

  const handlePropertyTypeClick = (type) => {
    const currentTypes = filters.property_type || [];
    if (type === 'commercial') {
      if (isCommercialSelection(currentTypes)) {
        updateFilter('property_type', currentTypes.filter((value) => !COMMERCIAL_PROPERTY_TYPES.includes(value)));
      } else {
        updateFilter('property_type', [...new Set([...currentTypes, ...COMMERCIAL_PROPERTY_TYPES])]);
      }
      return;
    }
    if (currentTypes.includes(type)) {
      updateFilter('property_type', currentTypes.filter(t => t !== type));
    } else {
      updateFilter('property_type', [...currentTypes, type]);
    }
  };

  const activeFiltersCount = getActiveFiltersCount();
  const isTypeActive = (type) => (
    type === 'commercial'
      ? isCommercialSelection(filters.property_type || [])
      : (filters.property_type || []).includes(type)
  );

  // Inline compact layout for map page
  if (inline) {
    return (
      <div className="quick-filters-inline">
        {/* BHK filters */}
        {bhkOptions.slice(0, 3).map(option => (
          <button
            key={option.value}
            className={`quick-filter-btn ${
              filters.bedrooms_min === parseInt(option.value) ? 'active' : ''
            }`}
            onClick={() => handleBHKClick(option.value)}
          >
            {option.label}
          </button>
        ))}

        {/* Separator */}
        <span className="text-muted mx-1">|</span>

        {/* Property type filters */}
        {propertyTypeOptions.slice(0, 2).map(option => (
          <button
            key={option.value}
            className={`quick-filter-btn ${isTypeActive(option.value) ? 'active' : ''}`}
            onClick={() => handlePropertyTypeClick(option.value)}
          >
            <i className={`fas ${option.icon} me-1`}></i>
            {option.label}
          </button>
        ))}

        {/* Clear filters button */}
        {activeFiltersCount > 0 && (
          <button
            className="quick-filter-btn text-danger"
            onClick={clearFilters}
            title="Clear all filters"
          >
            <i className="fas fa-times"></i>
            <span className="ms-1">{activeFiltersCount}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="property-quick-filters">
      <div className="quick-filters-section">
        <h6 className="quick-filters-label">
          <i className="fas fa-bed me-2"></i>
          BHK
        </h6>
        <div className="quick-filters-buttons">
          {bhkOptions.map(option => (
            <button
              key={option.value}
              className={`quick-filter-btn ${
                filters.bedrooms_min === parseInt(option.value) ? 'active' : ''
              }`}
              onClick={() => handleBHKClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="quick-filters-section">
        <h6 className="quick-filters-label">
          <i className="fas fa-rupee-sign me-2"></i>
          Budget
        </h6>
        <div className="quick-filters-buttons">
          {budgetOptions.map(option => (
            <button
              key={option.value}
              className={`quick-filter-btn ${
                filters.price_min === option.min && filters.price_max === option.max ? 'active' : ''
              }`}
              onClick={() => handleBudgetClick(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="quick-filters-section">
        <h6 className="quick-filters-label">
          <i className="fas fa-home me-2"></i>
          Property Type
        </h6>
        <div className="quick-filters-buttons">
          {propertyTypeOptions.map(option => (
            <button
              key={option.value}
              className={`quick-filter-btn ${isTypeActive(option.value) ? 'active' : ''}`}
              onClick={() => handlePropertyTypeClick(option.value)}
            >
              <i className={`fas ${option.icon} me-1`}></i>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="quick-filters-actions">
          <button className="btn btn-sm btn-outline-danger" onClick={clearFilters}>
            <i className="fas fa-times me-1"></i>
            Clear All ({activeFiltersCount})
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyQuickFilters;

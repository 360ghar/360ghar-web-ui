import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { usePropertyStore } from '../../store/propertyStore';
import { useLocationStore } from '../../store/locationStore';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';
import GooglePlacesInput from '../../common/search/GooglePlacesInput';

const RECENT_SEARCHES_KEY = '360ghar_recent_property_searches';
const getRecentSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const addRecentSearch = (term) => {
  if (!term || term.trim().length < 2) return;
  try {
    const existing = getRecentSearches();
    const next = [term.trim(), ...existing.filter((s) => s !== term.trim())].slice(0, 5);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable; ignore.
  }
};

const PropertyTopBar = () => {
  const { t } = useTranslation('properties');
  const {
    filters,
    updateFilter,
    applyFilters,
    isLoading
  } = usePropertyStore();

  const { location, setLocation } = useLocationStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const searchWrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      // AUDIT FIX (improvement 2.1): persist the search term for autocomplete.
      addRecentSearch(filters.q);
      setRecentSearches(getRecentSearches());
      setShowSuggestions(false);
      await applyFilters();
    }
  };

  const handleSuggestionClick = (term) => {
    updateFilter('q', term);
    setShowSuggestions(false);
    addRecentSearch(term);
    setRecentSearches(getRecentSearches());
    void applyFilters();
  };

  // AUDIT FIX (improvement 2.5): share the current filtered view as a deep
  // link so recipients see the same filter state.
  const handleShareFilteredView = async () => {
    try {
      const query = buildPropertySearchQuery(filters);
      const shareUrl = `${window.location.origin}/properties?${query}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('topBar.shareLinkCopied'), { theme: 'colored' });
    } catch {
      toast.error(t('topBar.shareLinkFailed'), { theme: 'colored' });
    }
  };

  const shouldShowSuggestions = showSuggestions && recentSearches.length > 0 && !filters.q;

  return (
    <div className="property-top-bar">
      <div className="property-top-bar__search">
        {/* AUDIT FIX (improvement 2.1): debounced recent-search suggestions */}
        <div className="property-top-bar__field position-relative" ref={searchWrapperRef}>
          <label htmlFor="property-search-input" className="property-top-bar__label">
            <i className="fas fa-search"></i>
            {t('topBar.search')}
          </label>
          <input
            id="property-search-input"
            type="text"
            placeholder={t('filters.searchKeyword')}
            className="common-input common-input--compact"
            value={filters.q || ''}
            onChange={(e) => updateFilter('q', e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            autoComplete="off"
          />
          {shouldShowSuggestions && (
            <div className="search-suggestions-dropdown">
              <div className="search-suggestions-header">{t('topBar.recentSearches')}</div>
              {recentSearches.map((term) => (
                <button
                  type="button"
                  key={term}
                  className="search-suggestion-item"
                  onClick={() => handleSuggestionClick(term)}
                >
                  <i className="fas fa-clock-rotate-left me-2 text-muted"></i>
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="property-top-bar__field property-top-bar__field--location">
          <span className="property-top-bar__label" role="presentation">
            <i className="fas fa-map-marker-alt"></i>
            {t('topBar.location')}
          </span>
          <GooglePlacesInput
            placeholder={location?.name && location?.lat ? location.name : t('filters.searchLocation')}
            className="common-input common-input--compact w-100"
            restrictCountry="in"
            onSelect={handleLocationSelect}
          />
        </div>
      </div>

      <div className="property-top-bar__actions">
        {/* AUDIT FIX (improvement 2.5): share filtered view as a deep link */}
        <button
          type="button"
          className="btn btn-outline-secondary property-top-bar__btn"
          onClick={handleShareFilteredView}
          title={t('topBar.shareFilteredView')}
        >
          <i className="fas fa-share-alt"></i>
          <span className="ms-2 d-none d-md-inline">{t('topBar.share')}</span>
        </button>
        <button
          type="button"
          className="btn btn-main property-top-bar__btn"
          onClick={applyFilters}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status"></span>
              <span className="ms-2">{t('topBar.searching')}</span>
            </>
          ) : (
            <>
              <i className="fas fa-search"></i>
              <span className="ms-2">{t('topBar.searchBtn')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PropertyTopBar;

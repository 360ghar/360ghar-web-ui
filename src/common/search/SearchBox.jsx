import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useLocationStore } from '../../store/locationStore';
import { useI18nNavigate } from '../../i18n/I18nLink';
import GooglePlacesInput from './GooglePlacesInput';
import {
  PROPERTY_TYPE_FILTER_OPTIONS,
  PURPOSE_OPTIONS,
} from '../../utils/propertyTaxonomy';
import { buildPropertySearchQuery } from '../../utils/propertyFilters';

const quickSearchTypeOptions = PROPERTY_TYPE_FILTER_OPTIONS.filter(
  ({ value }) => ['apartment', 'house', 'pg', 'commercial'].includes(value)
);

const RECENT_SEARCHES_KEY = '360ghar:recentSearches';
const RECENT_SEARCHES_MAX = 8;

// UX FIX (audit 5.5 / imp 5.2): recent-search persistence helpers so the
// keyword input can surface debounced autocomplete suggestions.
const readRecentSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
};

const writeRecentSearch = (term) => {
  const trimmed = term?.trim();
  if (!trimmed) return;
  try {
    const existing = readRecentSearches().filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    const next = [trimmed, ...existing].slice(0, RECENT_SEARCHES_MAX);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
};

const SearchBox = () => {
  const { t } = useTranslation('properties');
  const navigate = useI18nNavigate();
  const { location, setLocation } = useLocationStore();
  const [searchMode, setSearchMode] = useState('general'); // 'general' or 'location'

  // Autocomplete suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const keywordWrapperRef = useRef(null);

  const recentSearches = useMemo(() => readRecentSearches(), []);

  // Close the suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (keywordWrapperRef.current && !keywordWrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formik = useFormik({
    initialValues: {
      keyword: '',
      type: 'All',
      purpose: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      radius: '20'
    },
    onSubmit: (values) => {
      // AUDIT FIX (5.5): persist the keyword for future autocomplete.
      if (values.keyword?.trim()) {
        writeRecentSearch(values.keyword);
      }
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

  const suggestions = useMemo(() => {
    const q = debouncedKeyword.trim().toLowerCase();
    if (!q) return recentSearches.slice(0, 5);
    return recentSearches
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 5);
  }, [debouncedKeyword, recentSearches]);

  // Debounce the keyword for suggestions
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedKeyword(formik.values.keyword);
    }, 200);
    return () => clearTimeout(handle);
  }, [formik.values.keyword]);

  // IMP FIX (audit 5.6): keyboard navigation for the suggestions dropdown.
  const handleKeywordKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      formik.setFieldValue('keyword', suggestions[activeSuggestion]);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const selectSuggestion = (term) => {
    formik.setFieldValue('keyword', term);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

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
              {t('searchBox.generalMode')}
            </button>
            <button
              type="button"
              className={`btn ${searchMode === 'location' ? 'btn-main' : 'btn-outline-secondary'} btn-sm`}
              onClick={() => setSearchMode('location')}
            >
              <i className="fas fa-map-marker-alt me-1"></i>
              {t('searchBox.locationMode')}
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="row g-2">
            {searchMode === 'general' ? (
              <>
                <div className="col-md-5" ref={keywordWrapperRef} style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="common-input common-input--light"
                    placeholder={t('searchBox.keywordPlaceholder')}
                    name="keyword"
                    value={formik.values.keyword}
                    onChange={(e) => {
                      formik.handleChange(e);
                      setActiveSuggestion(-1);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeywordKeyDown}
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                    aria-controls="searchbox-suggestions"
                    role="combobox"
                  />
                  {/* UX FIX (audit 5.5): debounced autocomplete suggestions */}
                  {showSuggestions && (
                    <ul
                      id="searchbox-suggestions"
                      className="search-box__suggestions"
                      role="listbox"
                      aria-label={t('searchBox.suggestionsAriaLabel')}
                    >
                      {suggestions.length === 0 ? (
                        <li className="search-box__suggestion search-box__suggestion--empty" aria-disabled="true">
                          {t('searchBox.noSuggestions')}
                        </li>
                      ) : (
                        suggestions.map((term, index) => (
                          <li
                            key={term}
                            className={`search-box__suggestion${index === activeSuggestion ? ' search-box__suggestion--active' : ''}`}
                            role="option"
                            aria-selected={index === activeSuggestion}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectSuggestion(term);
                            }}
                            onMouseEnter={() => setActiveSuggestion(index)}
                          >
                            <i className="fas fa-clock-rotate-left me-2 text-muted"></i>
                            {term}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
                <div className="col-md-3">
                  <select
                    className="common-input common-input--light"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                  >
                    <option value="All">{t('searchBox.allTypes')}</option>
                    {quickSearchTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
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
                      <option key={option.value || 'all'} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-grid">
                  <button type="submit" className="btn btn-main w-100">
                    <i className="fas fa-search me-2"></i>
                    {t('searchBox.searchBtn')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-4">
                  <GooglePlacesInput
                    placeholder={location.name || t('searchBox.locationPlaceholder')}
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
                    <option value="5">{t('searchBox.kmRadius', { km: 5 })}</option>
                    <option value="10">{t('searchBox.kmRadius', { km: 10 })}</option>
                    <option value="20">{t('searchBox.kmRadius', { km: 20 })}</option>
                    <option value="50">{t('searchBox.kmRadius', { km: 50 })}</option>
                    <option value="100">{t('searchBox.kmRadius', { km: 100 })}</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="common-input common-input--light"
                    placeholder={t('searchBox.minPrice')}
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
                    placeholder={t('searchBox.maxPrice')}
                    name="maxPrice"
                    value={formik.values.maxPrice}
                    onChange={formik.handleChange}
                    min="0"
                  />
                </div>
                <div className="col-md-2 d-grid">
                  <button type="submit" className="btn btn-main w-100">
                    <i className="fas fa-search me-2"></i>
                    {t('searchBox.findNearby')}
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
                  <option value="">{t('searchBox.bedrooms')}</option>
                  <option value="1">{t('searchBox.bedroom1')}</option>
                  <option value="2">{t('searchBox.bedroom2')}</option>
                  <option value="3">{t('searchBox.bedroom3')}</option>
                  <option value="4">{t('searchBox.bedroom4')}</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="common-input common-input--light form-select-sm"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                >
                  <option value="All">{t('searchBox.allTypes')}</option>
                  {quickSearchTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
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
                    <option key={option.value || 'all'} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-outline-primary w-100">
                  <i className="fas fa-filter me-2"></i>
                  {t('searchBox.applyFilters')}
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

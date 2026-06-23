/* global google */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// Singleton loader for Google Maps - preloads on first import for faster autocomplete
const loaderSingleton = (() => {
  let loader;
  let loadPromise = null;

  const getLoader = () => {
    if (!loader) {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

      if (!apiKey || apiKey === 'your_google_places_api_key_here') {
        console.error('Google Places API key is missing or invalid. Please add VITE_GOOGLE_PLACES_API_KEY to your .env file.');
        return null;
      }

      loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
        id: 'google-maps-js',
      });
    }
    return loader;
  };

  // Preload the Google Maps library
  const preload = () => {
    if (!loadPromise) {
      const loader = getLoader();
      if (loader) {
        loadPromise = loader.load().catch(err => {
          console.warn('Failed to preload Google Maps:', err);
          loadPromise = null;
        });
      }
    }
    return loadPromise;
  };

  return { getLoader, preload };
})();

// Debounce window for autocomplete requests. Each keystroke would otherwise be
// a billable Places request; 250ms balances responsiveness against cost.
const DEBOUNCE_MS = 250;

// MIGRATION NOTE: the legacy `google.maps.places.Autocomplete` widget is
// deprecated ("not available to new customers"). This component now drives the
// Places API (New) `AutocompleteSuggestion` and renders its own dropdown, which
// keeps the native <input> + `className` styling and the
// `onSelect({ lat, lng, name })` contract that all 8 consumers depend on.
const GooglePlacesInput = ({
  placeholder = 'Search location',
  onSelect,
  className = '',
  restrictCountry = 'in',
  types = [],
}) => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const placesLibRef = useRef(null); // { AutocompleteSuggestion, AutocompleteSessionToken }
  const sessionTokenRef = useRef(null);
  const initPromiseRef = useRef(null);
  const initHandleRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeqRef = useRef(0);

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // UX FIX (audit 5.8): loading indicator shown while the Places library is
  // still being fetched, so the dropdown isn't silently blank.
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);

  // Stable serialized keys for effect/callback dependencies
  const typesKey = Array.isArray(types) ? types.join('|') : '';
  const restrictCountryKey = Array.isArray(restrictCountry)
    ? restrictCountry.join('|')
    : String(restrictCountry || '');

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // A session token groups the keystrokes of one search with the final place
  // selection for billing. It must be regenerated after each accepted result.
  const newSessionToken = useCallback(() => {
    const lib = placesLibRef.current;
    if (lib?.AutocompleteSessionToken) {
      sessionTokenRef.current = new lib.AutocompleteSessionToken();
    }
  }, []);

  // Lazily load the Places library (deferred to idle / first focus, like before).
  const ensurePlaces = useCallback(async () => {
    if (placesLibRef.current) return placesLibRef.current;
    if (initPromiseRef.current) return initPromiseRef.current;

    initPromiseRef.current = (async () => {
      const loader = loaderSingleton.getLoader();
      if (!loader) {
        console.warn('Google Places API is not available. Falling back to manual location entry.');
        return null;
      }

      setIsPlacesLoading(true);
      try {
        await loaderSingleton.preload();
        const places = await google.maps.importLibrary('places');
        if (!places?.AutocompleteSuggestion) {
          throw new Error('Google Maps Places AutocompleteSuggestion is unavailable.');
        }
        placesLibRef.current = places;
        newSessionToken();
        return places;
      } catch (err) {
        console.error('Google Maps init error', err);
        return null;
      } finally {
        setIsPlacesLoading(false);
      }
    })().finally(() => {
      initPromiseRef.current = null;
    });

    return initPromiseRef.current;
  }, [newSessionToken]);

  const fetchSuggestions = useCallback(async (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const places = await ensurePlaces();
    if (!places?.AutocompleteSuggestion) return;

    if (!sessionTokenRef.current) newSessionToken();

    const request = {
      input: trimmed,
      sessionToken: sessionTokenRef.current,
    };
    if (restrictCountryKey) {
      request.includedRegionCodes = restrictCountryKey.split('|');
    }
    if (typesKey) {
      // Legacy `types` (e.g. '(cities)') maps to the New API's
      // `includedPrimaryTypes`, which accepts the same type collections.
      request.includedPrimaryTypes = typesKey.split('|');
    }

    const seq = ++requestSeqRef.current;
    try {
      const { suggestions: results } =
        await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      // Drop stale responses so a slow earlier request can't overwrite newer ones.
      if (seq !== requestSeqRef.current) return;

      const mapped = (results || [])
        .map((s) => s.placePrediction)
        .filter(Boolean)
        .map((p) => ({
          placeId: p.placeId,
          text: p.text?.toString?.() ?? '',
          mainText: p.mainText?.toString?.() ?? p.text?.toString?.() ?? '',
          secondaryText: p.secondaryText?.toString?.() ?? '',
          prediction: p,
        }));

      setSuggestions(mapped);
      setActiveIndex(-1);
      setIsOpen(mapped.length > 0);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.warn('Places autocomplete fetch failed', err);
      }
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [ensurePlaces, newSessionToken, restrictCountryKey, typesKey]);

  const handleSelect = useCallback(async (item) => {
    if (!item?.prediction) return;

    setIsOpen(false);
    setActiveIndex(-1);
    setInputValue(item.text || '');

    try {
      const place = item.prediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });

      const loc = place.location;
      const lat = typeof loc?.lat === 'function' ? loc.lat() : loc?.lat;
      const lng = typeof loc?.lng === 'function' ? loc.lng() : loc?.lng;
      const name = place.formattedAddress || place.displayName || item.text || '';

      setInputValue(name);

      if (lat != null && lng != null && typeof onSelectRef.current === 'function') {
        onSelectRef.current({ lat, lng, name });
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.warn('Places fetchFields failed', err);
      }
    } finally {
      // The selection closes this session; start a fresh token for the next search.
      newSessionToken();
      setSuggestions([]);
    }
  }, [newSessionToken]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(value);
    }, DEBOUNCE_MS);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        void handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Close the dropdown on outside click.
  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Defer Maps API loading until the page is idle (preserves original perf behavior).
  useEffect(() => {
    const cancelScheduledInit = () => {
      if (!initHandleRef.current) return;
      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(initHandleRef.current);
      } else {
        clearTimeout(initHandleRef.current);
      }
      initHandleRef.current = null;
    };

    if ('requestIdleCallback' in window) {
      initHandleRef.current = requestIdleCallback(() => {
        void ensurePlaces();
      }, { timeout: 3000 });
    } else {
      initHandleRef.current = setTimeout(() => {
        void ensurePlaces();
      }, 1000);
    }

    return () => {
      cancelScheduledInit();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [ensurePlaces]);

  return (
    <div className="google-places-input" ref={containerRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        className={className}
        placeholder={placeholder}
        autoComplete="off"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => {
          void ensurePlaces();
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
      />
      {isPlacesLoading && (
        <span
          className="google-places-input__spinner"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            border: '2px solid var(--border-color-light, #e0e6ed)',
            borderTopColor: 'var(--main-color, #ff6b00)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'google-places-spin 0.8s linear infinite',
          }}
        />
      )}
      {isOpen && suggestions.length > 0 && (
        <ul
          className="google-places-input__dropdown"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            margin: 0,
            padding: '4px 0',
            listStyle: 'none',
            background: 'var(--white-color, #fff)',
            border: '1px solid var(--border-color-light, #e0e6ed)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.placeId || idx}
              role="option"
              aria-selected={idx === activeIndex}
              className={`google-places-input__option${idx === activeIndex ? ' is-active' : ''}`}
              onMouseDown={(e) => {
                // Prevent the input's blur from firing before the click resolves.
                e.preventDefault();
                void handleSelect(s);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              style={{
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1.4,
                color: 'var(--text-color, #2b2b2b)',
                background: idx === activeIndex ? 'var(--bg-light, #f5f7fa)' : 'transparent',
              }}
            >
              <span className="google-places-input__option-main">{s.mainText}</span>
              {s.secondaryText && (
                <span
                  className="google-places-input__option-secondary"
                  style={{ color: 'var(--text-color-light, #8a94a6)', marginLeft: '6px' }}
                >
                  {s.secondaryText}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <style>{`@keyframes google-places-spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  );
};

export default GooglePlacesInput;

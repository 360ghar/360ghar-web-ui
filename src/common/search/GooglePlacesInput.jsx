/* global google */
import { useEffect, useRef, useState } from 'react';
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

const GooglePlacesInput = ({
  placeholder = 'Search location',
  onSelect,
  className = '',
  restrictCountry = 'in',
  types = [],
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const initHandleRef = useRef(null);
  const initPromiseRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  // UX FIX (audit 5.8): loading indicator shown while the Places library is
  // still being fetched, so the dropdown isn't silently blank.
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);

  // Stable serialized keys for effect dependencies
  const typesKey = Array.isArray(types) ? types.join('|') : '';
  const restrictCountryKey = Array.isArray(restrictCountry)
    ? restrictCountry.join('|')
    : String(restrictCountry || '');

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let isMounted = true;
    const input = inputRef.current;

    const cancelScheduledInit = () => {
      if (!initHandleRef.current) return;

      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(initHandleRef.current);
      } else {
        clearTimeout(initHandleRef.current);
      }

      initHandleRef.current = null;
    };

    const init = async () => {
      cancelScheduledInit();

      if (autocompleteRef.current) {
        return autocompleteRef.current;
      }

      if (initPromiseRef.current) {
        return initPromiseRef.current;
      }

      initPromiseRef.current = (async () => {
        if (!input) return;

        try {
          const loader = loaderSingleton.getLoader();

          if (!loader) {
            console.warn('Google Places API is not available. Falling back to manual location entry.');
            return;
          }

          setIsPlacesLoading(true);
          await loaderSingleton.preload();

          if (!isMounted || !input) return;

          if (!google?.maps?.places?.Autocomplete) {
            throw new Error('Google Maps Places Autocomplete is unavailable.');
          }

          const options = {
            fields: ['formatted_address', 'geometry', 'name'],
          };

          if (restrictCountry) {
            options.componentRestrictions = {
              country: Array.isArray(restrictCountry) ? restrictCountry : restrictCountry,
            };
          }

          if (Array.isArray(types) && types.length > 0) {
            options.types = types;
          }

          const autocomplete = new google.maps.places.Autocomplete(input, options);

          autocomplete.addListener('place_changed', () => {
            if (!isMounted) return;

            const place = autocomplete.getPlace();
            const location = place?.geometry?.location;

            if (location && typeof onSelectRef.current === 'function') {
              const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
              const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
              const name = place.formatted_address || place.name || input.value || '';
              onSelectRef.current({ lat, lng, name });
            }
          });

          autocompleteRef.current = autocomplete;
        } catch (err) {
          console.error('Google Maps init error', err);
          autocompleteRef.current = null;
        }
      })().finally(() => {
        initPromiseRef.current = null;
        setIsPlacesLoading(false);
      });

      return initPromiseRef.current;
    };

    const handleFocus = () => {
      void init();
    };

    if (input) {
      input.addEventListener('focus', handleFocus);
    }

    // Defer Maps API loading until after the page is idle
    if ('requestIdleCallback' in window) {
      initHandleRef.current = requestIdleCallback(() => {
        void init();
      }, { timeout: 3000 });
    } else {
      initHandleRef.current = setTimeout(() => {
        void init();
      }, 1000);
    }

    return () => {
      isMounted = false;
      cancelScheduledInit();
      if (input) {
        input.removeEventListener('focus', handleFocus);
      }
      autocompleteRef.current = null;
      initPromiseRef.current = null;
    };
  }, [typesKey, restrictCountryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="google-places-input">
      <input
        ref={inputRef}
        type="text"
        className={className}
        placeholder={placeholder}
        autoComplete="off"
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
      <style>{`@keyframes google-places-spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  );
};

export default GooglePlacesInput;

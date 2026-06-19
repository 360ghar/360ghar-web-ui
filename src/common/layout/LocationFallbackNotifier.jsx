import { useEffect, useRef } from 'react';
import { useLocationFallback } from '../../store/locationStore';
import { useLazyToast } from '../useLazyToast';

/**
 * AUDIT FIX (5.7): surfaces the locationStore fallback reason to the user.
 * The store already records WHY it fell back to the Gurugram default
 * (permission denied, timeout, unsupported, etc.) in its `error` field and
 * exposes it via `useLocationFallback`. This component watches that value and
 * shows a single non-blocking toast (react-toastify) so the user understands
 * their geolocation failed and results are scoped to the default service area.
 */
const LocationFallbackNotifier = () => {
  const [isFallback, reason] = useLocationFallback();
  const { warning } = useLazyToast();
  const lastShownRef = useRef(null);

  useEffect(() => {
    if (isFallback && reason && lastShownRef.current !== reason) {
      lastShownRef.current = reason;
      warning(reason, { autoClose: 6000 });
    }
  }, [isFallback, reason, warning]);

  return null;
};

export default LocationFallbackNotifier;

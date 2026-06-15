import { useEffect, useRef } from 'react';

// useWebOtp — Android Chrome WebOTP API integration.
//
// When `enabled` is true and the WebOTP API is available, this listens for an
// incoming SMS that matches the bound origin (the SMS must end with
// `@<domain> #<code>`) and invokes `onCode(code)` with the parsed OTP so the
// caller can autofill the input. Feature-detected and a no-op everywhere the
// API is unavailable (desktop, iOS, Firefox, non-secure contexts).
//
// The request is aborted on unmount or when `enabled` flips to false.
export function useWebOtp(onCode, enabled = true) {
  const onCodeRef = useRef(onCode);

  // Keep the latest callback without re-triggering the WebOTP request.
  useEffect(() => {
    onCodeRef.current = onCode;
  }, [onCode]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof window === 'undefined') return undefined;
    if (!('OTPCredential' in window)) return undefined;
    if (!navigator.credentials || typeof navigator.credentials.get !== 'function') {
      return undefined;
    }

    const abortController = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: abortController.signal,
      })
      .then((otpCredential) => {
        const code = otpCredential?.code;
        if (code && typeof onCodeRef.current === 'function') {
          onCodeRef.current(code);
        }
      })
      .catch(() => {
        // Aborted, denied, or timed out — fall back to manual entry / autocomplete.
      });

    return () => {
      abortController.abort();
    };
  }, [enabled]);
}

export default useWebOtp;

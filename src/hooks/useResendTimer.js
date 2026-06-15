import { useCallback, useEffect, useState } from 'react';

// Standard cooldown (seconds) before an OTP can be resent. Shared by EVERY
// OTP entry point (login OTP, inline-signup OTP, add-phone OTP) so the
// resend UX is identical across the app.
export const RESEND_SECONDS = 30;

// useResendTimer — a 30-second countdown for "Resend code" controls.
//
// Returns:
//  - `secondsLeft`  : remaining seconds (0 when the control should be enabled)
//  - `canResend`    : true once the countdown reaches 0
//  - `start()`      : (re)start the 30s countdown — call right after an OTP send
//  - `reset()`      : clear the countdown (e.g. when leaving the OTP step)
export function useResendTimer(initialSeconds = RESEND_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const start = useCallback(() => setSecondsLeft(initialSeconds), [initialSeconds]);
  const reset = useCallback(() => setSecondsLeft(0), []);

  return {
    secondsLeft,
    canResend: secondsLeft <= 0,
    start,
    reset,
  };
}

export default useResendTimer;

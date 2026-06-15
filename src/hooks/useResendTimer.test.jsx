import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESEND_SECONDS, useResendTimer } from './useResendTimer';

describe('useResendTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults the cooldown to 30 seconds', () => {
    expect(RESEND_SECONDS).toBe(30);
  });

  it('starts at 0 and is resendable before any send', () => {
    const { result } = renderHook(() => useResendTimer());
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it('starts a 30s countdown that disables resend until it reaches 0', () => {
    const { result } = renderHook(() => useResendTimer());

    act(() => result.current.start());
    expect(result.current.secondsLeft).toBe(30);
    expect(result.current.canResend).toBe(false);

    // Advance one second at a time so each re-render schedules the next tick.
    for (let i = 0; i < 29; i += 1) {
      act(() => vi.advanceTimersByTime(1_000));
    }
    expect(result.current.secondsLeft).toBe(1);
    expect(result.current.canResend).toBe(false);

    // The 30th second enables resend.
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it('reset() clears the countdown immediately', () => {
    const { result } = renderHook(() => useResendTimer());
    act(() => result.current.start());
    expect(result.current.canResend).toBe(false);

    act(() => result.current.reset());
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });
});

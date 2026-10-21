import { describe, expect, it } from 'vitest';
import { SLOTS, isoDay, slotLabel, slotOpen } from './slots';

describe('visit slots', () => {
  it('runs 9:00 to 19:00 in half hours', () => {
    expect(SLOTS[0]).toBe('09:00');
    expect(SLOTS.at(-1)).toBe('19:00');
    expect(SLOTS).toHaveLength(21);
  });

  it('labels in 12 hours', () => {
    expect(slotLabel('09:00')).toBe('9:00 am');
    expect(slotLabel('12:00')).toBe('12:00 pm');
    expect(slotLabel('17:30')).toBe('5:30 pm');
    expect(slotLabel('17:30', 'hi')).toBe('शाम 5:30');
    expect(slotLabel('09:30', 'hi')).toBe('सुबह 9:30');
  });

  it('closes slots less than 30 minutes away, on today only', () => {
    const now = new Date(2026, 8, 29, 10, 0);
    const today = isoDay(now);
    expect(slotOpen(today, '10:00', now)).toBe(false);
    expect(slotOpen(today, '10:30', now)).toBe(false);
    expect(slotOpen(today, '11:00', now)).toBe(true);
    expect(slotOpen('2026-09-30', '09:00', now)).toBe(true);
    expect(slotOpen('2026-09-28', '09:00', now)).toBe(false);
  });
});

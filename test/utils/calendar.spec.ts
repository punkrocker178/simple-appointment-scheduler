import { describe, it, expect } from 'vitest';
import {
  toDateString,
  addDays,
  startOfWeek,
  generateTimeSlots,
  getAppointmentStyle,
  SLOT_INTERVAL_MINUTES,
} from '~/utils/calendar';

describe('calendar utilities', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 6, 7))).toBe('2026-07-07');
  });

  it('adds days to a date', () => {
    expect(toDateString(addDays(new Date(2026, 6, 7), 7))).toBe('2026-07-14');
  });

  it('returns the Monday of the week', () => {
    expect(toDateString(startOfWeek(new Date(2026, 6, 7)))).toBe('2026-07-06');
  });

  it('generates 30-minute slots between open and close', () => {
    const slots = generateTimeSlots(28_800, 61_200);
    expect(slots[0]).toBe(28_800);
    expect(slots[slots.length - 1]).toBe(59_400);
    expect(slots.length).toBe((61_200 - 28_800) / (SLOT_INTERVAL_MINUTES * 60));
  });

  it('throws when closeSeconds is not after openSeconds', () => {
    expect(() => generateTimeSlots(28_800, 28_000)).toThrow(
      'closeSeconds (28000) must be greater than openSeconds (28800)',
    );
    expect(() => generateTimeSlots(28_800, 28_800)).toThrow(
      'closeSeconds (28800) must be greater than openSeconds (28800)',
    );
  });

  it('calculates appointment style for a 60-minute appointment at 08:30', () => {
    const style = getAppointmentStyle(30_600, 60, 28_800, 48);
    expect(style.top).toBe('48px');
    expect(style.height).toBe('96px');
  });
});

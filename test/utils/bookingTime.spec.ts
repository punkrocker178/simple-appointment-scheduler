/**
 * bookingTime helper tests
 */

import { describe, it, expect } from 'vitest';
import {
  secondsToTimeLabel,
  slotEndSeconds,
  bookingDateToLocalDate,
  formatBookingDate,
  formatBookingTime,
} from '~/utils/bookingTime';

describe('bookingTime helpers', () => {
  describe('secondsToTimeLabel', () => {
    it('formats 28800 as 08:00', () => {
      expect(secondsToTimeLabel(28800)).toBe('08:00');
    });

    it('formats 52200 as 14:30', () => {
      expect(secondsToTimeLabel(52200)).toBe('14:30');
    });

    it('pads minutes with leading zero', () => {
      expect(secondsToTimeLabel(36600)).toBe('10:10');
    });
  });

  describe('slotEndSeconds', () => {
    it('adds duration minutes to start seconds', () => {
      expect(slotEndSeconds(28800, 30)).toBe(30600);
      expect(slotEndSeconds(28800, 60)).toBe(32400);
    });
  });

  describe('bookingDateToLocalDate', () => {
    it('builds a local Date from booking date and seconds from midnight', () => {
      const date = bookingDateToLocalDate('2025-05-15', 28800);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(4); // May is 4
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(8);
      expect(date.getMinutes()).toBe(0);
    });
  });

  describe('formatBookingDate', () => {
    it('returns a formatted date string', () => {
      const date = new Date('2025-05-15T08:00:00');
      const result = formatBookingDate(date);
      expect(result).toContain('2025');
      expect(result).toContain('May');
      expect(result).toContain('15');
    });
  });

  describe('formatBookingTime', () => {
    it('returns a formatted time string', () => {
      const date = new Date('2025-05-15T08:30:00');
      const result = formatBookingTime(date);
      expect(result).toMatch(/8:30|08:30/);
    });
  });
});

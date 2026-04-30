import { describe, it, expect, vi } from 'vitest';
import { useDateValidation } from '../app/composables/useDateValidation';

describe('composables', () => {
  describe('useDateValidation', () => {
    it('validates operating hours correctly', () => {
      const { isWithinOperatingHours } = useDateValidation();

      const mondayMorning = new Date('2025-05-12T09:00:00');
      expect(isWithinOperatingHours(mondayMorning)).toBe(true);

      const sunday = new Date('2025-05-18T10:00:00');
      expect(isWithinOperatingHours(sunday)).toBe(false);

      const tooEarly = new Date('2025-05-12T07:00:00');
      expect(isWithinOperatingHours(tooEarly)).toBe(false);

      const tooLate = new Date('2025-05-12T19:00:00');
      expect(isWithinOperatingHours(tooLate)).toBe(false);
    });

    it('validates same-day booking with 2-hour lead time', () => {
      const { canBookSameDay } = useDateValidation();

      vi.setSystemTime(new Date('2025-05-12T10:00:00'));

      const tooSoon = new Date('2025-05-12T11:00:00');
      expect(canBookSameDay(tooSoon)).toBe(false);

      const validTime = new Date('2025-05-12T13:00:00');
      expect(canBookSameDay(validTime)).toBe(true);

      vi.useRealTimers();
    });

    it('allows past dates to be invalid', () => {
      const { isValidBookingDate } = useDateValidation();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isValidBookingDate(yesterday)).toBe(false);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isValidBookingDate(tomorrow)).toBe(true);
    });
  });
});

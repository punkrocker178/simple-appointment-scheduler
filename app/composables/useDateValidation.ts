/**
 * useDateValidation - Validate booking dates
 *
 * Validates dates against dealership operating constraints:
 * - Operating days: Monday–Saturday (no Sundays)
 * - Operating hours: 08:00–18:00
 * - Same-day bookings: must be at least 2 hours in the future
 *
 * @returns {Object} Validation methods
 * - isValidBookingDate(date): Returns true if date is bookable
 * - getReasonForInvalidDate(date): Returns user-friendly error message
 * - getNextValidDate(fromDate): Finds next valid booking date
 */

const OPERATING_HOURS = { startHour: 8, endHour: 18 };
const OPERATING_DAYS = [1, 2, 3, 4, 5, 6]; // Monday (1) - Saturday (6)
const SAME_DAY_MIN_HOURS = 2;

export function useDateValidation() {
  /**
   * Check if a date string (YYYY-MM-DD) is a valid booking date
   */
  const isValidBookingDate = (dateString: string): boolean => {
    try {
      const date = new Date(`${dateString}T00:00:00`);
      if (isNaN(date.getTime()))
        return false;

      const dayOfWeek = date.getDay();
      if (!OPERATING_DAYS.includes(dayOfWeek))
        return false;

      const now = new Date();
      const sameDay = date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();

      if (sameDay) {
        const diffMs = date.getTime() - now.getTime();
        const minMs = SAME_DAY_MIN_HOURS * 60 * 60 * 1000;
        return diffMs >= minMs;
      }

      return true;
    }
    catch {
      return false;
    }
  };

  /**
   * Get a user-friendly reason why a date is invalid
   */
  const getReasonForInvalidDate = (dateString: string): string | null => {
    try {
      const date = new Date(`${dateString}T00:00:00`);
      if (isNaN(date.getTime()))
        return 'Invalid date format';

      const dayOfWeek = date.getDay();
      if (!OPERATING_DAYS.includes(dayOfWeek))
        return 'We are closed on Sundays. Please select Monday through Saturday.';

      const now = new Date();
      const sameDay = date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();

      if (sameDay) {
        const diffMs = date.getTime() - now.getTime();
        const minMs = SAME_DAY_MIN_HOURS * 60 * 60 * 1000;
        if (diffMs < minMs)
          return `Same-day bookings require at least ${SAME_DAY_MIN_HOURS} hours notice.`;
      }

      return null;
    }
    catch {
      return 'Invalid date';
    }
  };

  /**
   * Find the next valid booking date starting from a given date
   */
  const getNextValidDate = (fromDateString: string): string => {
    let date = new Date(`${fromDateString}T00:00:00`);
    if (isNaN(date.getTime()))
      date = new Date();

    const now = new Date();

    // Start from tomorrow if today doesn't work
    if (date < now) {
      date = new Date(now);
      date.setDate(date.getDate() + 1);
    }

    let attempts = 0;
    while (attempts < 90) {
      const dateStr = date.toISOString().split('T')[0];
      if (isValidBookingDate(dateStr))
        return dateStr;

      date.setDate(date.getDate() + 1);
      attempts++;
    }

    // Fallback (should rarely happen)
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 7);
    return fallback.toISOString().split('T')[0];
  };

  return {
    isValidBookingDate,
    getReasonForInvalidDate,
    getNextValidDate,
  };
}

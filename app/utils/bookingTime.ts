/**
 * Pure helpers for booking time display.
 *
 * Backend returns times as seconds-from-midnight on a dealership-local date.
 * The grid uses simple HH:MM labels; full confirmation/summary display builds a
 * local Date from the booking date plus the offset.
 */

export function secondsToTimeLabel(secondsFromMidnight: number): string {
  const h = Math.floor(secondsFromMidnight / 3600);
  const m = Math.floor((secondsFromMidnight % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function slotEndSeconds(startSeconds: number, durationMinutes: number): number {
  return startSeconds + durationMinutes * 60;
}

export function bookingDateToLocalDate(bookingDate: string, secondsFromMidnight: number): Date {
  const date = new Date(`${bookingDate}T00:00:00`);
  date.setSeconds(date.getSeconds() + secondsFromMidnight);
  return date;
}

export function formatBookingDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatBookingTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

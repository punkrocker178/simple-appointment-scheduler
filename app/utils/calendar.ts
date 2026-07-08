export const SLOT_INTERVAL_MINUTES = 30;

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date, firstDay = 1 /* Monday */): Date {
  const day = date.getDay();
  const diff = (day - firstDay + 7) % 7;
  return addDays(date, -diff);
}

export function generateTimeSlots(
  openSeconds: number,
  closeSeconds: number,
  intervalMinutes = SLOT_INTERVAL_MINUTES,
): number[] {
  if (closeSeconds <= openSeconds) {
    throw new Error(
      `closeSeconds (${closeSeconds}) must be greater than openSeconds (${openSeconds})`,
    );
  }

  const intervalSeconds = intervalMinutes * 60;
  const slots: number[] = [];
  for (let s = openSeconds; s < closeSeconds; s += intervalSeconds) {
    slots.push(s);
  }
  return slots;
}

export function getAppointmentStyle(
  secondsFromMidnight: number,
  durationMinutes: number,
  openSeconds: number,
  slotHeightPixels: number,
): { top: string; height: string } {
  const intervalSeconds = SLOT_INTERVAL_MINUTES * 60;
  const topSlotIndex = (secondsFromMidnight - openSeconds) / intervalSeconds;
  const durationSlots = (durationMinutes * 60) / intervalSeconds;
  return {
    top: `${topSlotIndex * slotHeightPixels}px`,
    height: `${durationSlots * slotHeightPixels}px`,
  };
}

export function formatDayHeader(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
  });
}

/** Convert seconds since midnight to HH:MM (24h). */
export function secondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Parse HH:MM to seconds since midnight. Returns null if invalid. */
export function timeStringToSeconds(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 3600 + minutes * 60;
}

/** Format open/close seconds as a readable range. */
export function formatHoursRange(openSeconds: number, closeSeconds: number): string {
  return `${secondsToTimeString(openSeconds)} – ${secondsToTimeString(closeSeconds)}`;
}

/**
 * Shared form validation helpers for admin and auth forms.
 */

export function isRequired(value: string | null | undefined): boolean {
  return !!value?.trim();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidVehicleYear(year: number, currentYear = new Date().getFullYear()): boolean {
  return Number.isInteger(year) && year >= 1900 && year <= currentYear + 1;
}

/** Vuetify rule helpers — return true or an error string. */
export const formRules = {
  required: (value: string) => isRequired(value) || 'Required',
  email: (value: string) => isValidEmail(value) || 'Invalid email',
  vehicleYear: (value: number, currentYear = new Date().getFullYear()) =>
    isValidVehicleYear(value, currentYear) || `Year must be 1900–${currentYear + 1}`,
};

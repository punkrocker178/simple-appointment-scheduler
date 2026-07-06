import { describe, it, expect } from 'vitest';
import {
  formRules,
  isRequired,
  isValidEmail,
  isValidVehicleYear,
} from '~/utils/validators';

describe('validators', () => {
  describe('isRequired', () => {
    it('accepts non-empty trimmed strings', () => {
      expect(isRequired('hello')).toBe(true);
      expect(isRequired('  x  ')).toBe(true);
    });

    it('rejects empty or whitespace-only values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@missing.com')).toBe(false);
    });
  });

  describe('isValidVehicleYear', () => {
    it('accepts years in valid range', () => {
      expect(isValidVehicleYear(2020, 2026)).toBe(true);
      expect(isValidVehicleYear(2027, 2026)).toBe(true);
    });

    it('rejects out-of-range years', () => {
      expect(isValidVehicleYear(1899, 2026)).toBe(false);
      expect(isValidVehicleYear(2028, 2026)).toBe(false);
      expect(isValidVehicleYear(2020.5, 2026)).toBe(false);
    });
  });

  describe('formRules', () => {
    it('returns error strings for invalid values', () => {
      expect(formRules.required('')).toBe('Required');
      expect(formRules.email('bad')).toBe('Invalid email');
      expect(formRules.vehicleYear(1800, 2026)).toContain('1900');
    });

    it('returns true for valid values', () => {
      expect(formRules.required('ok')).toBe(true);
      expect(formRules.email('a@b.co')).toBe(true);
      expect(formRules.vehicleYear(2024, 2026)).toBe(true);
    });
  });
});

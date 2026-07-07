/**
 * Auth redirect utility tests
 */

import { describe, it, expect } from 'vitest';
import { getPostLoginRedirect } from '~/utils/authRedirect';

describe('getPostLoginRedirect', () => {
  it('uses query redirect when it is a safe path', () => {
    expect(getPostLoginRedirect('User', '/availability')).toBe('/availability');
    expect(getPostLoginRedirect('Admin', '/admin/dealerships')).toBe('/admin/dealerships');
  });

  it('rejects unsafe redirect values', () => {
    expect(getPostLoginRedirect('User', 'https://evil.com')).toBe('/booking-start');
    expect(getPostLoginRedirect('Admin', '//evil.com')).toBe('/admin');
  });

  it('sends User role to booking-start by default', () => {
    expect(getPostLoginRedirect('User')).toBe('/booking-start');
    expect(getPostLoginRedirect('User', null)).toBe('/booking-start');
  });

  it('sends Admin and Staff to admin by default', () => {
    expect(getPostLoginRedirect('Admin')).toBe('/admin');
    expect(getPostLoginRedirect('Staff')).toBe('/admin');
  });
});

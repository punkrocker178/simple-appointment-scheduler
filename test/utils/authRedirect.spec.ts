/**
 * Auth redirect utility tests
 */

import { describe, it, expect } from 'vitest';
import { getPostLoginRedirect } from '~/utils/authRedirect';

describe('getPostLoginRedirect', () => {
  it('uses query redirect when it is a safe path for the role', () => {
    expect(getPostLoginRedirect('User', '/availability')).toBe('/availability');
    expect(getPostLoginRedirect('Admin', '/admin/dealerships')).toBe('/admin/dealerships');
  });

  it('ignores customer booking redirect for Admin and Staff', () => {
    expect(getPostLoginRedirect('Admin', '/booking-start')).toBe('/admin');
    expect(getPostLoginRedirect('Staff', '/booking-start')).toBe('/admin');
    expect(getPostLoginRedirect('Admin', '/availability')).toBe('/admin');
  });

  it('ignores admin redirect for User role', () => {
    expect(getPostLoginRedirect('User', '/admin')).toBe('/booking-start');
    expect(getPostLoginRedirect('User', '/admin/dealerships')).toBe('/booking-start');
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

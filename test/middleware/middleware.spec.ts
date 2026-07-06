/**
 * Route middleware tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useAuthStore } from '~/stores/authStore';
import { setupPinia } from '../testUtils';
import authMiddleware from '~/middleware/auth';
import adminMiddleware from '~/middleware/admin';

const { navigateToMock, tokenCookieRef } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  tokenCookieRef: { value: null as string | null },
}));

mockNuxtImport('navigateTo', () => navigateToMock);
mockNuxtImport('useCookie', () => (name: string) => {
  if (name === 'auth-token') {
    return tokenCookieRef;
  }
  return { value: null };
});

const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

function createRoute(path: string, fullPath = path) {
  return { path, fullPath } as Parameters<typeof authMiddleware>[0];
}

describe('auth middleware', () => {
  beforeEach(() => {
    setupPinia();
    navigateToMock.mockReset();
    tokenCookieRef.value = null;
  });

  it('allows /login without authentication', () => {
    authMiddleware(createRoute('/login'), createRoute('/login'));
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to login with redirect param', () => {
    authMiddleware(createRoute('/admin', '/admin/dealerships'), createRoute('/admin', '/admin/dealerships'));
    expect(navigateToMock).toHaveBeenCalledWith('/login?redirect=%2Fadmin%2Fdealerships');
  });

  it('allows authenticated users on client', () => {
    const store = useAuthStore();
    store.expiresAt = futureExpiry;

    authMiddleware(createRoute('/admin'), createRoute('/admin'));
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});

describe('admin middleware', () => {
  beforeEach(() => {
    setupPinia();
    navigateToMock.mockReset();
  });

  it('redirects users without admin permissions to /forbidden', () => {
    const store = useAuthStore();
    store.expiresAt = futureExpiry;
    store.permissions = [];

    adminMiddleware(createRoute('/admin'), createRoute('/admin'));
    expect(navigateToMock).toHaveBeenCalledWith('/forbidden');
  });

  it('allows users with customers:read', () => {
    const store = useAuthStore();
    store.expiresAt = futureExpiry;
    store.permissions = ['customers:read'];

    adminMiddleware(createRoute('/admin/customers'), createRoute('/admin/customers'));
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('allows users with dealerships:read', () => {
    const store = useAuthStore();
    store.expiresAt = futureExpiry;
    store.permissions = ['dealerships:read'];

    adminMiddleware(createRoute('/admin/dealerships'), createRoute('/admin/dealerships'));
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});

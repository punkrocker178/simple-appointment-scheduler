/**
 * Auth Store Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAuthStore } from '~/stores/authStore';
import { setupPinia, setupFetchMock, teardownFetchMock } from '../testUtils';
import type { LoginResponse, MeBffResponse } from '~/types/api';

const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

const mockLoginResponse: LoginResponse = {
  expiresAt: futureExpiry,
  email: 'admin@example.com',
  role: 'Admin',
};

const mockMeResponse: MeBffResponse = {
  userId: 'user-1',
  email: 'admin@example.com',
  role: 'Admin',
  customerId: null,
  permissions: ['dealerships:read', 'customers:read'],
  claims: [],
  expiresAt: futureExpiry,
};

describe('authStore', () => {
  beforeEach(() => {
    setupPinia();
    setupFetchMock();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    teardownFetchMock();
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('registers, auto-logs in, and stores customerId from /me', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const userMeResponse: MeBffResponse = {
        ...mockMeResponse,
        email: 'customer@example.com',
        role: 'User',
        customerId: 'customer-1',
        permissions: ['appointments:read:own'],
      };

      mockFetch
        .mockResolvedValueOnce({
          expiresAt: futureExpiry,
          email: 'customer@example.com',
          role: 'User',
        })
        .mockResolvedValueOnce(userMeResponse);

      const store = useAuthStore();
      await store.register({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'customer@example.com',
        password: 'password123',
      });

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/auth/register', {
        method: 'POST',
        body: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'customer@example.com',
          password: 'password123',
        },
      });
      expect(store.email).toBe('customer@example.com');
      expect(store.role).toBe('User');
      expect(store.customerId).toBe('customer-1');
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('stores session metadata and fetches permissions on success', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch
        .mockResolvedValueOnce(mockLoginResponse)
        .mockResolvedValueOnce(mockMeResponse);

      const store = useAuthStore();
      await store.login('admin@example.com', 'password');

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@example.com', password: 'password' },
      });
      expect(store.email).toBe('admin@example.com');
      expect(store.role).toBe('Admin');
      expect(store.permissions).toEqual(['dealerships:read', 'customers:read']);
      expect(store.isAuthenticated).toBe(true);
    });

    it('sets error and rethrows on failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce({
        data: { detail: 'Invalid email or password.' },
      });

      const store = useAuthStore();

      await expect(store.login('bad@example.com', 'wrong')).rejects.toBeTruthy();
      expect(store.error).toBe('Invalid email or password.');
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears session state and calls logout endpoint', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch
        .mockResolvedValueOnce(mockLoginResponse)
        .mockResolvedValueOnce(mockMeResponse)
        .mockResolvedValueOnce({ success: true });

      const store = useAuthStore();
      await store.login('admin@example.com', 'password');
      await store.logout();

      expect(mockFetch).toHaveBeenLastCalledWith('/api/auth/logout', { method: 'POST' });
      expect(store.email).toBe('');
      expect(store.permissions).toEqual([]);
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('returns true when permission is present', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch
        .mockResolvedValueOnce(mockLoginResponse)
        .mockResolvedValueOnce(mockMeResponse);

      const store = useAuthStore();
      await store.login('admin@example.com', 'password');

      expect(store.hasPermission('dealerships:read')).toBe(true);
      expect(store.hasPermission('customers:read')).toBe(true);
      expect(store.hasPermission('skills:write')).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('is false when session is expired', () => {
      const store = useAuthStore();
      store.expiresAt = new Date(Date.now() - 1000).toISOString();

      expect(store.isAuthenticated).toBe(false);
    });

    it('is true when session is not expired', () => {
      const store = useAuthStore();
      store.expiresAt = futureExpiry;

      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('fetchMe', () => {
    it('logs out on 401', async () => {
      const store = useAuthStore();
      store.expiresAt = futureExpiry;
      store.email = 'admin@example.com';
      store.role = 'Admin';
      store.permissions = ['dealerships:read'];

      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce({ statusCode: 401, data: { detail: 'Unauthorized' } });

      await expect(store.fetchMe()).rejects.toBeTruthy();

      expect(store.email).toBe('');
      expect(store.permissions).toEqual([]);
    });
  });
});

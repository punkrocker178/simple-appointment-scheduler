/**
 * Register Page Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import RegisterPage from '~/pages/register.vue';
import { useAuthStore } from '~/stores/authStore';
import { setupPinia, setupFetchMock, teardownFetchMock, vuetifyStubs } from '../testUtils';

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
mockNuxtImport('useRequestFetch', () => () => global.$fetch);

const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

const meUnauthorized = { statusCode: 401, data: { detail: 'Unauthorized' } };

const registerStubs = {
  ...vuetifyStubs,
  'v-alert': {
    template: '<div class="alert" data-testid="register-error"><slot /></div>',
    props: ['type', 'variant'],
  },
  'v-btn': {
    template: '<button type="submit" :disabled="disabled || loading" data-testid="register-submit"><slot /></button>',
    props: ['loading', 'disabled', 'color', 'block', 'type'],
  },
};

describe('register page', () => {
  beforeEach(() => {
    setupPinia();
    setupFetchMock();
    tokenCookieRef.value = null;
    navigateToMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    teardownFetchMock();
    vi.restoreAllMocks();
  });

  it('renders registration fields', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.reject(meUnauthorized);
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    const wrapper = await mountSuspended(RegisterPage, {
      global: { stubs: registerStubs },
    });

    expect(wrapper.find('[data-testid="register-first-name"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-last-name"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-password"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-submit"]').exists()).toBe(true);
  });

  it('registers, auto-logs in, and redirects to booking-start', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    let registered = false;
    mockFetch.mockImplementation((url: string, options?: { method?: string, body?: unknown }) => {
      if (url === '/api/auth/register' && options?.method === 'POST') {
        registered = true;
        return Promise.resolve({
          expiresAt: futureExpiry,
          email: 'customer@example.com',
          role: 'User',
        });
      }
      if (url === '/api/auth/me') {
        if (!registered) {
          return Promise.reject(meUnauthorized);
        }
        return Promise.resolve({
          userId: '2',
          email: 'customer@example.com',
          role: 'User',
          customerId: 'customer-1',
          permissions: ['appointments:read:own'],
          claims: [],
          expiresAt: futureExpiry,
        });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    const wrapper = await mountSuspended(RegisterPage, {
      global: { stubs: registerStubs },
    });

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('Jane');
    await inputs[1].setValue('Doe');
    await inputs[2].setValue('customer@example.com');
    await inputs[4].setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');

    await vi.waitFor(() => {
      expect(navigateToMock).toHaveBeenCalledWith('/booking-start');
    });

    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(true);
    expect(store.customerId).toBe('customer-1');
  });
});

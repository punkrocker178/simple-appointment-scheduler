/**
 * Login Page Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { Pinia } from 'pinia';
import LoginPage from '~/pages/login.vue';
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

function mockGuestSession(mockFetch: ReturnType<typeof vi.mocked<typeof globalThis.$fetch>>): void {
  mockFetch.mockImplementation((url: string) => {
    if (url === '/api/auth/me') {
      return Promise.reject(meUnauthorized);
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
}

const loginStubs = {
  ...vuetifyStubs,
  'v-alert': {
    template: '<div class="alert" data-testid="login-error"><slot /></div>',
    props: ['type', 'variant'],
  },
  'v-btn': {
    template: '<button type="submit" :disabled="disabled || loading" data-testid="login-submit"><slot /></button>',
    props: ['loading', 'disabled', 'color', 'block', 'type'],
  },
};

describe('login page', () => {
  let wrapper: VueWrapper | null = null;
  let pinia: Pinia;

  beforeEach(() => {
    pinia = setupPinia();
    setupFetchMock();
    tokenCookieRef.value = null;
    navigateToMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    teardownFetchMock();
    vi.restoreAllMocks();
  });

  it('renders email and password fields', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockGuestSession(mockFetch);

    wrapper = await mountSuspended(LoginPage, {
      global: { stubs: loginStubs, plugins: [pinia] },
    });

    expect(wrapper.find('[data-testid="login-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-password"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-submit"]').exists()).toBe(true);
  });

  it('shows error alert when login fails', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/api/auth/me') {
        return Promise.reject(meUnauthorized);
      }
      if (url === '/api/auth/login' && options?.method === 'POST') {
        return Promise.reject({ data: { detail: 'Invalid email or password.' } });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    wrapper = await mountSuspended(LoginPage, {
      global: { stubs: loginStubs, plugins: [pinia] },
    });

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('bad@example.com');
    await inputs[1].setValue('wrong');
    await wrapper.find('form').trigger('submit.prevent');
    await vi.waitFor(() => {
      expect(wrapper.find('[data-testid="login-error"]').exists()).toBe(true);
    });
    expect(wrapper.find('[data-testid="login-error"]').text()).toContain('Invalid email or password.');
  });

  it('redirects Admin to /admin after successful login', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    let loggedIn = false;
    mockFetch.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/api/auth/login' && options?.method === 'POST') {
        loggedIn = true;
        return Promise.resolve({
          expiresAt: futureExpiry,
          email: 'admin@example.com',
          role: 'Admin',
        });
      }
      if (url === '/api/auth/me') {
        if (!loggedIn) {
          return Promise.reject(meUnauthorized);
        }
        return Promise.resolve({
          userId: '1',
          email: 'admin@example.com',
          role: 'Admin',
          customerId: null,
          permissions: ['dealerships:read'],
          claims: [],
          expiresAt: futureExpiry,
        });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    wrapper = await mountSuspended(LoginPage, {
      global: { stubs: loginStubs, plugins: [pinia] },
    });

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('admin@example.com');
    await inputs[1].setValue('password');
    await wrapper.find('form').trigger('submit.prevent');
    await vi.waitFor(() => {
      expect(navigateToMock).toHaveBeenCalledWith('/admin');
    });

    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(true);
  });

  it('redirects User to /booking-start after successful login', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    let loggedIn = false;
    mockFetch.mockImplementation((url: string, options?: { method?: string }) => {
      if (url === '/api/auth/login' && options?.method === 'POST') {
        loggedIn = true;
        return Promise.resolve({
          expiresAt: futureExpiry,
          email: 'customer@example.com',
          role: 'User',
        });
      }
      if (url === '/api/auth/me') {
        if (!loggedIn) {
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

    wrapper = await mountSuspended(LoginPage, {
      global: { stubs: loginStubs, plugins: [pinia] },
    });

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('customer@example.com');
    await inputs[1].setValue('password');
    await wrapper.find('form').trigger('submit.prevent');
    await vi.waitFor(() => {
      expect(navigateToMock).toHaveBeenCalledWith('/booking-start');
    });
  });

  it('redirects authenticated users away from login on mount', async () => {
    tokenCookieRef.value = 'valid.jwt.token';

    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          userId: '1',
          email: 'admin@example.com',
          role: 'Admin',
          customerId: null,
          permissions: [],
          claims: [],
          expiresAt: futureExpiry,
        });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    wrapper = await mountSuspended(LoginPage, {
      global: { stubs: loginStubs, plugins: [pinia] },
    });

    await vi.waitFor(() => {
      expect(navigateToMock).toHaveBeenCalledWith('/admin');
    });
  });
});

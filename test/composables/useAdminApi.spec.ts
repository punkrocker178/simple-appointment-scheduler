/**
 * useAdminApi Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useAdminApi } from '~/composables/useAdminApi';
import { ApiError } from '~/utils/apiErrors';
import { useAuthStore } from '~/stores/authStore';
import { setupPinia, setupFetchMock, teardownFetchMock, withSetup } from '../testUtils';

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}));

mockNuxtImport('navigateTo', () => navigateToMock);

describe('useAdminApi', () => {
  beforeEach(() => {
    setupPinia();
    setupFetchMock();
    navigateToMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    teardownFetchMock();
    vi.restoreAllMocks();
  });

  it('forwards Authorization via Nitro routes on success', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockResolvedValueOnce([{ id: '1', name: 'Oil Change', canDelete: true }]);

    const { fetchSkills } = withSetup(() => useAdminApi());
    const skills = await fetchSkills();

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/skills', undefined);
    expect(skills).toHaveLength(1);
  });

  it('logs out and redirects on 401', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch
      .mockRejectedValueOnce({ statusCode: 401, data: { detail: 'Unauthorized' } })
      .mockResolvedValueOnce({ success: true });

    const store = useAuthStore();
    store.expiresAt = new Date(Date.now() + 3600000).toISOString();
    store.email = 'admin@example.com';

    const { fetchSkills } = withSetup(() => useAdminApi());

    await expect(fetchSkills()).rejects.toBeInstanceOf(ApiError);
    expect(navigateToMock).toHaveBeenCalledWith('/login');
    expect(store.isAuthenticated).toBe(false);
  });

  it('maps ProblemDetails detail to ApiError message', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockRejectedValueOnce({
      statusCode: 400,
      data: { detail: 'Name is required.' },
    });

    const { createSkill } = withSetup(() => useAdminApi());

    await expect(createSkill({ name: '' })).rejects.toMatchObject({
      message: 'Name is required.',
      statusCode: 400,
    });
  });

  it('shows permission denied snackbar on 403', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockRejectedValueOnce({
      statusCode: 403,
      data: { detail: 'Forbidden' },
    });

    const { fetchDealerships } = withSetup(() => useAdminApi());
    const { notification } = useAppNotification();

    await expect(fetchDealerships()).rejects.toBeInstanceOf(ApiError);
    expect(notification.value?.message).toContain('permission');
    expect(notification.value?.color).toBe('error');
  });

  it('fetches dealership appointments for a date', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockResolvedValueOnce([{ id: 'apt-1', status: 0 }]);

    const { fetchDealershipAppointments } = withSetup(() => useAdminApi());
    const appointments = await fetchDealershipAppointments('dealership-1', '2026-07-07');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/dealerships/dealership-1/appointments?date=2026-07-07',
      undefined,
    );
    expect(appointments).toHaveLength(1);
  });
});

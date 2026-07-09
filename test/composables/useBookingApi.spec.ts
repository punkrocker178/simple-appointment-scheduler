/**
 * useBookingApi Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { useBookingApi } from '~/composables/useBookingApi';
import { ApiError } from '~/utils/apiErrors';
import { useAuthStore } from '~/stores/authStore';
import {
  setupPinia,
  setupFetchMock,
  teardownFetchMock,
  withSetup,
  createMockAvailabilityResponse,
  createMockAppointmentResponse,
  createMockServiceType,
} from '../testUtils';

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}));

mockNuxtImport('navigateTo', () => navigateToMock);

describe('useBookingApi', () => {
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

  it('fetches service types from the booking BFF route', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    const response = {
      dealershipId: 'd1',
      dealershipName: 'Alpha Motors',
      serviceTypes: [createMockServiceType()],
    };
    mockFetch.mockResolvedValueOnce(response);

    const { fetchServiceTypes } = withSetup(() => useBookingApi());
    const result = await fetchServiceTypes();

    expect(mockFetch).toHaveBeenCalledWith('/api/booking/service-types', undefined);
    expect(result).toEqual(response);
  });

  it('fetches availability with query params', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    const response = createMockAvailabilityResponse(2);
    mockFetch.mockResolvedValueOnce(response);

    const { fetchAvailability } = withSetup(() => useBookingApi());
    const result = await fetchAvailability('d1', 's1', '2026-07-07');

    expect(mockFetch).toHaveBeenCalledWith('/api/booking/availability', {
      query: {
        dealershipId: 'd1',
        serviceTypeId: 's1',
        date: '2026-07-07',
      },
    });
    expect(result.slots).toHaveLength(2);
  });

  it('creates an appointment via POST', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    const payload = {
      customerId: 'c1',
      vehicleId: 'v1',
      serviceTypeId: 's1',
      bookingDate: '2026-07-07',
      secondsFromMidnight: 28800,
    };
    const response = createMockAppointmentResponse(payload);
    mockFetch.mockResolvedValueOnce(response);

    const { createAppointment } = withSetup(() => useBookingApi());
    const result = await createAppointment(payload);

    expect(mockFetch).toHaveBeenCalledWith('/api/booking/appointments', {
      method: 'POST',
      body: payload,
    });
    expect(result.id).toBe('apt-456');
  });

  it('fetches my appointments from the me BFF route', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    const response = [createMockAppointmentResponse()];
    mockFetch.mockResolvedValueOnce(response);

    const { fetchMyAppointments } = withSetup(() => useBookingApi());
    const result = await fetchMyAppointments();

    expect(mockFetch).toHaveBeenCalledWith('/api/me/appointments', undefined);
    expect(result).toEqual(response);
  });

  it('maps vehicle create response to booking vehicle shape', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockResolvedValueOnce({
      id: 'v1',
      customerId: 'c1',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
    });

    const { createVehicle } = withSetup(() => useBookingApi());
    const vehicle = await createVehicle({ make: 'Toyota', model: 'Camry', year: 2024 });

    expect(mockFetch).toHaveBeenCalledWith('/api/me/vehicles', {
      method: 'POST',
      body: { make: 'Toyota', model: 'Camry', year: 2024 },
    });
    expect(vehicle).toEqual({
      id: 'v1',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
    });
  });

  it('logs out and redirects on 401', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch
      .mockRejectedValueOnce({ statusCode: 401, data: { detail: 'Unauthorized' } })
      .mockResolvedValueOnce({ success: true });

    const store = useAuthStore();
    store.expiresAt = new Date(Date.now() + 3600000).toISOString();
    store.email = 'customer@example.com';

    const { fetchMyVehicles } = withSetup(() => useBookingApi());

    await expect(fetchMyVehicles()).rejects.toBeInstanceOf(ApiError);
    expect(navigateToMock).toHaveBeenCalledWith('/login');
    expect(store.isAuthenticated).toBe(false);
  });

  it('maps ProblemDetails detail to ApiError message', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockRejectedValueOnce({
      statusCode: 400,
      data: { detail: 'Service type not found.' },
    });

    const { fetchAvailability } = withSetup(() => useBookingApi());

    await expect(fetchAvailability('d1', 's1', '2026-07-07')).rejects.toMatchObject({
      message: 'Service type not found.',
      statusCode: 400,
    });
  });
});

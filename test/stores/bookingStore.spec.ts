/**
 * Booking Store Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useBookingStore } from '~/stores/bookingStore';
import { useAuthStore } from '~/stores/authStore';
import {
  setupPinia,
  setupFetchMock,
  teardownFetchMock,
  createMockAvailabilityResponse,
  createMockAppointmentResponse,
  createMockServiceType,
} from '../testUtils';

const futureExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

describe('bookingStore', () => {
  beforeEach(() => {
    setupPinia();
    setupFetchMock();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    teardownFetchMock();
    vi.restoreAllMocks();
  });

  it('bootstrap loads service types, vehicles, and customer profile', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch
      .mockResolvedValueOnce({
        dealershipId: 'd1',
        dealershipName: 'Alpha Motors',
        serviceTypes: [createMockServiceType({ id: 's1' })],
      })
      .mockResolvedValueOnce([{ id: 'v1', make: 'Toyota', model: 'Camry', year: 2024 }])
      .mockResolvedValueOnce({
        id: 'c1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: null,
      });

    const store = useBookingStore();
    await store.bootstrap();

    expect(store.dealershipId).toBe('d1');
    expect(store.services).toHaveLength(1);
    expect(store.vehicles).toHaveLength(1);
    expect(store.customerProfile?.email).toBe('jane@example.com');
    expect(store.isLoading).toBe(false);
  });

  it('selectServiceType resets date and availability state', async () => {
    const store = useBookingStore();
    store.selectedServiceTypeId = 's1';
    store.selectedDate = '2026-07-07';
    store.slots = [{ secondsFromMidnight: 28800, available: true }];
    store.selectedSlot = { secondsFromMidnight: 28800, available: true };

    store.selectServiceType('s2');

    expect(store.selectedServiceTypeId).toBe('s2');
    expect(store.selectedDate).toBe('');
    expect(store.slots).toEqual([]);
    expect(store.selectedSlot).toBeNull();
  });

  it('fetchAvailability stores the full response and selected date', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    const availability = createMockAvailabilityResponse({
      bookingDate: '2026-07-07',
      serviceTypeId: 's1',
      durationMinutes: 60,
      slots: [{ secondsFromMidnight: 28800, available: true }],
    });
    mockFetch.mockResolvedValueOnce(availability);

    const store = useBookingStore();
    store.dealershipId = 'd1';
    store.selectedServiceTypeId = 's1';

    await store.fetchAvailability('2026-07-07');

    expect(mockFetch).toHaveBeenCalledWith('/api/booking/availability', {
      query: {
        dealershipId: 'd1',
        serviceTypeId: 's1',
        date: '2026-07-07',
      },
    });
    expect(store.availabilityResponse).toEqual(availability);
    expect(store.selectedDate).toBe('2026-07-07');
    expect(store.availableSlots).toHaveLength(1);
  });

  it('selectSlot ignores unavailable slots', () => {
    const store = useBookingStore();
    const unavailable = { secondsFromMidnight: 28800, available: false };

    store.selectSlot(unavailable);

    expect(store.selectedSlot).toBeNull();
  });

  it('submitBooking sends the expected payload shape', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    const appointment = createMockAppointmentResponse({
      customerId: 'c1',
      vehicleId: 'v1',
      serviceTypeId: 's1',
      bookingDate: '2026-07-07',
      secondsFromMidnight: 28800,
    });
    mockFetch.mockResolvedValueOnce(appointment);

    const authStore = useAuthStore();
    authStore.expiresAt = futureExpiry;
    authStore.customerId = 'c1';

    const store = useBookingStore();
    store.selectedVehicleId = 'v1';
    store.selectedServiceTypeId = 's1';
    store.selectedDate = '2026-07-07';
    store.selectedSlot = { secondsFromMidnight: 28800, available: true };
    store.customerProfile = {
      id: 'c1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: null,
    };

    await store.submitBooking();

    expect(mockFetch).toHaveBeenCalledWith('/api/booking/appointments', {
      method: 'POST',
      body: {
        customerId: 'c1',
        vehicleId: 'v1',
        serviceTypeId: 's1',
        bookingDate: '2026-07-07',
        secondsFromMidnight: 28800,
      },
    });
    expect(store.appointment).toEqual(appointment);
  });

  it('isBookingComplete is false until all required fields are set', () => {
    const store = useBookingStore();

    expect(store.isBookingComplete).toBe(false);

    store.selectedVehicleId = 'v1';
    store.selectedServiceTypeId = 's1';
    store.selectedDate = '2026-07-07';
    store.selectedSlot = { secondsFromMidnight: 28800, available: true };
    store.customerProfile = {
      id: 'c1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: null,
    };

    expect(store.isBookingComplete).toBe(true);
  });
});

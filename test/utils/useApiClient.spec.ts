/**
 * useApiClient Utility Tests
 * Tests API client functions: fetchServices, fetchAvailability, createAppointment
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  fetchServices,
  fetchAvailability,
  createAppointment,
} from '~/composables/useApiClient';
import {
  setupFetchMock,
  teardownFetchMock,
  createMockServiceType,
  createMockAvailabilityResponse,
  createMockAppointmentResponse,
} from '../testUtils';
import type { CreateAppointmentRequest } from '~/types/api/booking';

describe('useApiClient - Utility Functions', () => {
  beforeEach(() => {
    setupFetchMock();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    teardownFetchMock();
    vi.restoreAllMocks();
  });

  describe('fetchServices', () => {
    it('should fetch service types from the booking endpoint', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const mockResponse = {
        dealershipId: 'd1',
        dealershipName: 'Dealership',
        serviceTypes: [createMockServiceType(), createMockServiceType({ id: 's2', name: 'Tire Rotation' })],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await fetchServices();

      expect(result.serviceTypes).toHaveLength(2);
      expect(result.serviceTypes[0]).toHaveProperty('id');
      expect(result.serviceTypes[0]).toHaveProperty('name');
      expect(result.serviceTypes[0]).toHaveProperty('durationMinutes');
      expect(result.dealershipId).toBe('d1');
    });

    it('should call correct API endpoint', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce({
        dealershipId: 'd1',
        dealershipName: 'Dealership',
        serviceTypes: [createMockServiceType()],
      });

      await fetchServices();

      expect(mockFetch).toHaveBeenCalledWith('/api/booking/service-types');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchServices()).rejects.toThrow('Network error');
    });
  });

  describe('fetchAvailability', () => {
    it('should fetch availability with correct query parameters', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(2));

      await fetchAvailability('dealership-1', 'service-1', '2025-05-15');

      expect(mockFetch).toHaveBeenCalledWith('/api/booking/availability', {
        query: {
          dealershipId: 'dealership-1',
          serviceTypeId: 'service-1',
          date: '2025-05-15',
        },
      });
    });

    it('should return the full availability response', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const mockResponse = createMockAvailabilityResponse(3);
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await fetchAvailability('d1', 's1', '2025-05-15');

      expect(response.slots).toHaveLength(3);
      expect(response.slots[0]).toHaveProperty('secondsFromMidnight');
      expect(response.bookingDate).toBe('2025-05-15');
      expect(response.serviceTypeId).toBe('s1');
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(
        fetchAvailability('d1', 's1', '2025-05-15'),
      ).rejects.toThrow('Service unavailable');
    });
  });

  describe('createAppointment', () => {
    it('should send POST request with appointment payload', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockAppointmentResponse());

      const payload: CreateAppointmentRequest = {
        customerId: 'c1',
        vehicleId: 'v1',
        serviceTypeId: 's1',
        bookingDate: '2025-05-15',
        secondsFromMidnight: 28800,
      };

      await createAppointment(payload);

      expect(mockFetch).toHaveBeenCalledWith('/api/booking/appointments', {
        method: 'POST',
        body: payload,
      });
    });

    it('should return appointment id and response', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const mockAppointment = createMockAppointmentResponse();
      mockFetch.mockResolvedValueOnce(mockAppointment);

      const payload: CreateAppointmentRequest = {
        customerId: 'c1',
        vehicleId: 'v1',
        serviceTypeId: 's1',
        bookingDate: '2025-05-15',
        secondsFromMidnight: 28800,
      };

      const response = await createAppointment(payload);

      expect(response).toHaveProperty('appointmentId');
      expect(response).toHaveProperty('appointment');
      expect(response.appointmentId).toBe(mockAppointment.id);
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Conflict: Slot not available'));

      const payload: CreateAppointmentRequest = {
        customerId: 'c1',
        vehicleId: 'v1',
        serviceTypeId: 's1',
        bookingDate: '2025-05-15',
        secondsFromMidnight: 28800,
      };

      await expect(createAppointment(payload)).rejects.toThrow(
        'Conflict: Slot not available',
      );
    });
  });
});

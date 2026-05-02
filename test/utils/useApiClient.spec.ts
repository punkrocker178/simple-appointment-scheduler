/**
 * useApiClient Utility Tests
 * Tests API client functions: fetchServices, fetchAvailability, createAppointment, fetchAppointments
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  fetchServices,
  fetchAvailability,
  createAppointment,
  fetchAppointments,
  type AppointmentPayload,
} from '~/composables/useApiClient';
import {
  setupFetchMock,
  teardownFetchMock,
  createMockService,
  createMockAppointment,
  createMockFetchResponse,
} from '../testUtils';

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
    it('should fetch and return services array', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const mockResponse = createMockFetchResponse.services(2);
      mockFetch.mockResolvedValueOnce(mockResponse);

      const services = await fetchServices();

      expect(services).toHaveLength(2);
      expect(services[0]).toHaveProperty('id');
      expect(services[0]).toHaveProperty('name');
      expect(services[0]).toHaveProperty('durationMinutes');
    });

    it('should call correct API endpoint', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.services(1));

      await fetchServices();

      expect(mockFetch).toHaveBeenCalledWith('/api/services');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should extract services from response object', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const mockResponse = {
        services: [
          createMockService({ id: 1, name: 'Oil Change' }),
          createMockService({ id: 2, name: 'Tire Rotation' }),
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const services = await fetchServices();

      expect(services[0].name).toBe('Oil Change');
      expect(services[1].name).toBe('Tire Rotation');
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchServices()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching services:',
        expect.any(Error),
      );
    });

    it('should log error to console on failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const testError = new Error('API unavailable');
      mockFetch.mockRejectedValueOnce(testError);

      try {
        await fetchServices();
      }
      catch {
        // Error expected
      }

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching services:',
        testError,
      );
    });
  });

  describe('fetchAvailability', () => {
    it('should fetch availability with correct query parameters', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.availability(2));

      await fetchAvailability('service-1', '2025-05-15');

      expect(mockFetch).toHaveBeenCalledWith('/api/availability', {
        query: {
          serviceId: 'service-1',
          date: '2025-05-15',
        },
      });
    });

    it('should return slots array from response', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const mockSlots = createMockFetchResponse.availability(3);
      mockFetch.mockResolvedValueOnce(mockSlots);

      const slots = await fetchAvailability('service-1', '2025-05-15');

      expect(slots).toHaveLength(3);
      expect(slots[0]).toHaveProperty('startTime');
      expect(slots[0]).toHaveProperty('endTime');
      expect(slots[0]).toHaveProperty('available');
    });

    it('should handle different service and date combinations', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.availability(1));

      await fetchAvailability('service-789', '2025-12-25');

      expect(mockFetch).toHaveBeenCalledWith('/api/availability', {
        query: {
          serviceId: 'service-789',
          date: '2025-12-25',
        },
      });
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(
        fetchAvailability('service-1', '2025-05-15'),
      ).rejects.toThrow('Service unavailable');
    });

    it('should log error to console on failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const testError = new Error('Query failed');
      mockFetch.mockRejectedValueOnce(testError);

      try {
        await fetchAvailability('service-1', '2025-05-15');
      }
      catch {
        // Error expected
      }

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching availability:',
        testError,
      );
    });

    it('should handle empty availability response', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce({ slots: [] });

      const slots = await fetchAvailability('service-1', '2025-05-15');

      expect(slots).toHaveLength(0);
    });
  });

  describe('createAppointment', () => {
    it('should send POST request with appointment payload', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.appointment());

      const payload: AppointmentPayload = {
        serviceId: 'service-1',
        startTime: '2025-05-15T14:00:00Z',
        endTime: '2025-05-15T14:30:00Z',
        vehiclePlate: 'ABC123',
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
      };

      await createAppointment(payload);

      expect(mockFetch).toHaveBeenCalledWith('/api/appointments', {
        method: 'POST',
        body: payload,
      });
    });

    it('should return appointment response with IDs and reference', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.appointment());

      const payload: AppointmentPayload = {
        serviceId: 'service-1',
        startTime: '2025-05-15T14:00:00Z',
        endTime: '2025-05-15T14:30:00Z',
        vehiclePlate: 'ABC123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
      };

      const response = await createAppointment(payload);

      expect(response).toHaveProperty('appointmentId');
      expect(response).toHaveProperty('bookingReference');
      expect(response).toHaveProperty('appointment');
      expect(response.appointmentId).toBe('apt-456');
      expect(response.bookingReference).toBe('BR-2025-002');
    });

    it('should accept optional vehicle make and model', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.appointment());

      const payload: AppointmentPayload = {
        serviceId: 'service-1',
        startTime: '2025-05-15T14:00:00Z',
        endTime: '2025-05-15T14:30:00Z',
        vehiclePlate: 'XYZ789',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
      };

      await createAppointment(payload);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/appointments',
        expect.objectContaining({
          method: 'POST',
          body: payload,
        }),
      );
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(
        new Error('Conflict: Slot not available'),
      );

      const payload: AppointmentPayload = {
        serviceId: 'service-1',
        startTime: '2025-05-15T14:00:00Z',
        endTime: '2025-05-15T14:30:00Z',
        vehiclePlate: 'ABC123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
      };

      await expect(createAppointment(payload)).rejects.toThrow(
        'Conflict: Slot not available',
      );
    });

    it('should log error to console on failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const testError = new Error('Booking failed');
      mockFetch.mockRejectedValueOnce(testError);

      const payload: AppointmentPayload = {
        serviceId: 'service-1',
        startTime: '2025-05-15T14:00:00Z',
        endTime: '2025-05-15T14:30:00Z',
        vehiclePlate: 'ABC123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
      };

      try {
        await createAppointment(payload);
      }
      catch {
        // Error expected
      }

      expect(console.error).toHaveBeenCalledWith(
        'Error creating appointment:',
        testError,
      );
    });
  });

  describe('fetchAppointments', () => {
    it('should fetch all appointments', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.appointments(3));

      const appointments = await fetchAppointments();

      expect(appointments).toHaveLength(3);
      expect(appointments[0]).toHaveProperty('id');
      expect(appointments[0]).toHaveProperty('customerName');
    });

    it('should call correct API endpoint', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockFetchResponse.appointments(1));

      await fetchAppointments();

      expect(mockFetch).toHaveBeenCalledWith('/api/appointments');
    });

    it('should extract appointments from response object', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const apt1 = createMockAppointment({ id: 'apt-1', customerName: 'Alice' });
      const apt2 = createMockAppointment({ id: 'apt-2', customerName: 'Bob' });
      mockFetch.mockResolvedValueOnce({
        appointments: [apt1, apt2],
      });

      const appointments = await fetchAppointments();

      expect(appointments[0].customerName).toBe('Alice');
      expect(appointments[1].customerName).toBe('Bob');
    });

    it('should handle empty appointments response', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce({ appointments: [] });

      const appointments = await fetchAppointments();

      expect(appointments).toHaveLength(0);
    });

    it('should throw error on API failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Database connection lost'));

      await expect(fetchAppointments()).rejects.toThrow(
        'Database connection lost',
      );
    });

    it('should log error to console on failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const testError = new Error('Server error');
      mockFetch.mockRejectedValueOnce(testError);

      try {
        await fetchAppointments();
      }
      catch {
        // Error expected
      }

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching appointments:',
        testError,
      );
    });
  });

  describe('error handling consistency', () => {
    it('all functions should log errors to console', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValue(new Error('API error'));

      const consoleSpy = console.error;

      try {
        await fetchServices();
      }
      catch {
        // Expected
      }
      expect(consoleSpy).toHaveBeenCalled();

      vi.clearAllMocks();
      mockFetch.mockRejectedValue(new Error('API error'));

      try {
        await fetchAvailability('svc', '2025-05-15');
      }
      catch {
        // Expected
      }
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});

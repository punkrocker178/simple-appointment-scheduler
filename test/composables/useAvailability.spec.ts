/**
 * useAvailability Composable Tests
 * Tests availability fetching, caching, loading states, error handling, and computed properties
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAvailability } from '~/composables/useAvailability';
import {
  withSetup,
  setupFetchMock,
  teardownFetchMock,
  createMockAvailabilityResponse,
} from '../testUtils';

describe('useAvailability Composable', () => {
  beforeEach(() => {
    setupFetchMock();
  });

  afterEach(() => {
    teardownFetchMock();
  });

  describe('initial state', () => {
    it('should start with empty slots', () => {
      const { slots } = withSetup(() => useAvailability());
      expect(slots.value).toEqual([]);
    });

    it('should start with null response', () => {
      const { response } = withSetup(() => useAvailability());
      expect(response.value).toBeNull();
    });

    it('should start with error null', () => {
      const { error } = withSetup(() => useAvailability());
      expect(error.value).toBeNull();
    });
  });

  describe('fetching availability', () => {
    it('should fetch response for a dealership, service, and date', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      const mockResponse = createMockAvailabilityResponse(3);
      mockFetch.mockResolvedValueOnce(mockResponse);

      const { fetch, response } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');

      expect(response.value).not.toBeNull();
      expect(response.value?.slots).toHaveLength(3);
      expect(response.value?.slots[0]).toHaveProperty('secondsFromMidnight');
    });

    it('should call $fetch with correct parameters', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(1));

      const { fetch } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-16');

      expect(mockFetch).toHaveBeenCalledWith('/api/booking/availability', {
        query: {
          dealershipId: 'd1',
          serviceTypeId: 's1',
          date: '2025-05-16',
        },
      });
    });
  });

  describe('error handling', () => {
    it('should capture error message on fetch failure', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Service unavailable'));

      const { fetch, error } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');

      expect(error.value).toBe('Service unavailable');
    });

    it('should clear error on successful fetch', async () => {
      const mockFetch = vi.mocked(global.$fetch);

      mockFetch.mockRejectedValueOnce(new Error('First error'));
      const { fetch, error } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');
      expect(error.value).toBe('First error');

      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(1));
      await fetch('d1', 's1', '2025-05-16');
      expect(error.value).toBeNull();
    });

    it('should clear response on error', async () => {
      const mockFetch = vi.mocked(global.$fetch);

      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(2));
      const { fetch, response } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');
      expect(response.value).not.toBeNull();

      mockFetch.mockRejectedValueOnce(new Error('Failed to load'));
      await fetch('d1', 's1', '2025-05-16');
      expect(response.value).toBeNull();
    });

    it('should use default error message if error has no message', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error());

      const { fetch, error } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');

      expect(error.value).toBe('Failed to fetch availability');
    });
  });

  describe('computed properties', () => {
    it('slots should be computed and reactive', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(2));

      const { fetch, slots } = withSetup(() => useAvailability());

      expect(slots.value).toHaveLength(0);

      await fetch('d1', 's1', '2025-05-15');

      expect(slots.value).toHaveLength(2);
    });

    it('error should be computed and reactive', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const { fetch, error } = withSetup(() => useAvailability());

      expect(error.value).toBeNull();

      await fetch('d1', 's1', '2025-05-15');

      expect(error.value).toBe('Test error');
    });
  });

  describe('cache clearing', () => {
    it('should clear slots when clearCache is called', async () => {
      const mockFetch = vi.mocked(global.$fetch);
      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(2));

      const { fetch, clearCache, slots } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');
      expect(slots.value).toHaveLength(2);

      clearCache();

      expect(slots.value).toHaveLength(0);
    });
  });

  describe('multiple service/date combinations', () => {
    it('should fetch different availability for different services', async () => {
      const mockFetch = vi.mocked(global.$fetch);

      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(2));
      const { fetch, slots } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');
      expect(slots.value).toHaveLength(2);

      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(3));
      await fetch('d1', 's2', '2025-05-15');
      expect(slots.value).toHaveLength(3);
    });

    it('should fetch different availability for different dates', async () => {
      const mockFetch = vi.mocked(global.$fetch);

      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(1));
      const { fetch, slots } = withSetup(() => useAvailability());

      await fetch('d1', 's1', '2025-05-15');
      expect(slots.value).toHaveLength(1);

      mockFetch.mockResolvedValueOnce(createMockAvailabilityResponse(4));
      await fetch('d1', 's1', '2025-05-20');
      expect(slots.value).toHaveLength(4);
    });
  });
});

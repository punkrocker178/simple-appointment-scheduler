/**
 * useAvailability - Fetch available slots for a service and date
 *
 * Fetches and manages the list of available appointment slots from the real .NET endpoint.
 * On-demand fetch; caches per service/date combination within this composable instance.
 *
 * @returns {Object} Availability state and methods
 * - response: Reactive ref to the full availability response
 * - slots: Reactive ref to available slots array
 * - isLoading: Whether fetch is in progress
 * - error: Error message if fetch failed
 * - fetch(dealershipId, serviceTypeId, date): Load slots for given service and date
 */

import { ref, computed } from 'vue';
import type { AvailabilityResponse, AvailabilitySlotDto } from '~/types/api/booking';

export function useAvailability() {
  const response = ref<AvailabilityResponse | null>(null);
  const error = ref<string | null>(null);
  const cache = new Map<string, AvailabilityResponse>();

  const fetch = async (
    dealershipId: string,
    serviceTypeId: string,
    date: string,
  ): Promise<void> => {
    const cacheKey = `${dealershipId}:${serviceTypeId}:${date}`;

    if (cache.has(cacheKey)) {
      response.value = cache.get(cacheKey)!;
      error.value = null;
      return;
    }

    error.value = null;
    response.value = null;
    try {
      const result = await $fetch<AvailabilityResponse>('/api/booking/availability', {
        query: {
          dealershipId,
          serviceTypeId,
          date,
        },
      });
      response.value = result;
      cache.set(cacheKey, result);
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to fetch availability';
      response.value = null;
    }
  };

  const clearCache = (): void => {
    cache.clear();
    response.value = null;
  };

  return {
    response: computed(() => response.value),
    slots: computed<AvailabilitySlotDto[]>(() => response.value?.slots ?? []),
    error: computed(() => error.value),
    fetch,
    clearCache,
  };
}

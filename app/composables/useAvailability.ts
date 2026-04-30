/**
 * useAvailability - Fetch available slots for a service and date
 *
 * Fetches and manages the list of available appointment slots.
 * On-demand fetch; caches per service/date combination.
 *
 * @returns {Object} Availability state and methods
 * - slots: Reactive ref to available slots array
 * - isLoading: Whether fetch is in progress
 * - error: Error message if fetch failed
 * - fetch(serviceId, date): Load slots for given service and date
 */

import { ref, computed } from 'vue';
import type { Slot } from '#server/utils/types';
import { fetchAvailability } from './useApiClient';

const slots = ref<Slot[]>([]);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
const cache = new Map<string, Slot[]>();

function getCacheKey(serviceId: string, date: string): string {
  return `${serviceId}:${date}`;
}

export function useAvailability() {
  const fetch = async (serviceId: string, date: string): Promise<void> => {
    const key = getCacheKey(serviceId, date);

    // Return cached result if available
    if (cache.has(key)) {
      slots.value = cache.get(key) || [];
      error.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const result = await fetchAvailability(serviceId, date);
      slots.value = result;
      cache.set(key, result);
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to fetch availability';
      slots.value = [];
    }
    finally {
      isLoading.value = false;
    }
  };

  const clearCache = (): void => {
    cache.clear();
    slots.value = [];
  };

  return {
    slots: computed(() => slots.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetch,
    clearCache,
  };
}

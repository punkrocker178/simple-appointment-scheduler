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
const error = ref<string | null>(null);
const cache = new Map<string, Slot[]>();

export function useAvailability() {
  const fetch = async (serviceId: string, date: string): Promise<void> => {

    error.value = null;
    slots.value = [];
    try {
      const result = await fetchAvailability(serviceId, date);
      //mock Network delay for better loading state testing
      await new Promise(resolve => setTimeout(resolve, 500));
      slots.value = result;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to fetch availability';
      slots.value = [];
    }
  };

  const clearCache = (): void => {
    cache.clear();
    slots.value = [];
  };

  return {
    slots: computed(() => slots.value),
    error: computed(() => error.value),
    fetch,
    clearCache,
  };
}

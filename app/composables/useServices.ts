/**
 * useServices - Fetch and cache services
 *
 * Loads the service catalog from the API on first call and caches it.
 * Subsequent calls return the cached result.
 *
 * @returns {Object} Services state and methods
 * - services: Reactive ref to services array
 * - isLoading: Whether fetch is in progress
 * - error: Error message if fetch failed
 * - refresh(): Force re-fetch services
 */

import { ref, computed } from 'vue';
import type { Service } from '#server/utils/types';
import { fetchServices } from './useApiClient';

const services = ref<Service[]>([]);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);
let cached = false;

export function useServices() {
  const refresh = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      services.value = await fetchServices();
      cached = true;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to fetch services';
    }
    finally {
      isLoading.value = false;
    }
  };

  const load = async (): Promise<void> => {
    if (cached)
      return;
    await refresh();
  };

  return {
    services: computed(() => services.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    load,
    refresh,
  };
}

/**
 * useServices - Fetch and cache service types for the booking flow
 *
 * Loads active service types from the real .NET service-type endpoint via the BFF.
 * Subsequent calls within this composable instance return the cached result.
 *
 * @returns {Object} Services state and methods
 * - services: Reactive ref to active service types
 * - dealershipId: Reactive ref to the default dealership id
 * - isLoading: Whether fetch is in progress
 * - error: Error message if fetch failed
 * - refresh(): Force re-fetch services
 */

import { ref, computed } from 'vue';
import type { BookingServiceTypesResponse, ServiceTypeOption } from '~/types/api/booking';

export function useServices() {
  const services = ref<ServiceTypeOption[]>([]);
  const dealershipId = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  let cached = false;

  const refresh = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<BookingServiceTypesResponse>('/api/booking/service-types');
      services.value = response.serviceTypes;
      dealershipId.value = response.dealershipId;
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
    dealershipId: computed(() => dealershipId.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    load,
    refresh,
  };
}

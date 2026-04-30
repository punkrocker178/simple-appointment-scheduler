/**
 * useBooking - Manage booking form state
 *
 * Reactive state for the multi-step booking form.
 * Encapsulates vehicle, service, date, slot, and customer data.
 *
 * @returns {Object} Form state and methods
 * - vehicle: Reactive object {plate, make, model}
 * - serviceId: Selected service ID
 * - selectedDate: Selected booking date (YYYY-MM-DD)
 * - selectedSlot: Selected time slot {startTime, endTime}
 * - customer: {name, email}
 * - setVehicle(data): Update vehicle info
 * - setService(id): Set selected service
 * - setDate(date): Set booking date
 * - setSlot(slot): Set selected time slot
 * - setCustomer(name, email): Set customer info
 * - reset(): Clear all data
 * - isComplete(): Check if all required fields filled
 */

import { ref, computed } from 'vue';
import type { Slot } from '#server/utils/types';

export interface VehicleData {
  plate: string
  make?: string
  model?: string
}

export interface CustomerData {
  name: string
  email: string
}

export function useBooking() {
  const vehicle = ref<VehicleData>({ plate: '', make: '', model: '' });
  const serviceId = ref<string>('');
  const selectedDate = ref<string>('');
  const selectedSlot = ref<Slot | null>(null);
  const customer = ref<CustomerData>({ name: '', email: '' });

  const setVehicle = (data: Partial<VehicleData>): void => {
    vehicle.value = { ...vehicle.value, ...data };
  };

  const setService = (id: string): void => {
    serviceId.value = id;
    // Reset later steps when service changes
    selectedDate.value = '';
    selectedSlot.value = null;
  };

  const setDate = (date: string): void => {
    selectedDate.value = date;
    // Reset slot when date changes
    selectedSlot.value = null;
  };

  const setSlot = (slot: Slot): void => {
    selectedSlot.value = slot;
  };

  const setCustomer = (name: string, email: string): void => {
    customer.value = { name, email };
  };

  const reset = (): void => {
    vehicle.value = { plate: '', make: '', model: '' };
    serviceId.value = '';
    selectedDate.value = '';
    selectedSlot.value = null;
    customer.value = { name: '', email: '' };
  };

  const isComplete = computed((): boolean => {
    return Boolean(
      vehicle.value.plate
      && serviceId.value
      && selectedDate.value
      && selectedSlot.value
      && customer.value.name
      && customer.value.email,
    );
  });

  return {
    vehicle: computed(() => vehicle.value),
    serviceId: computed(() => serviceId.value),
    selectedDate: computed(() => selectedDate.value),
    selectedSlot: computed(() => selectedSlot.value),
    customer: computed(() => customer.value),
    setVehicle,
    setService,
    setDate,
    setSlot,
    setCustomer,
    reset,
    isComplete,
  };
}

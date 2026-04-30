/**
 * Pinia Booking Store - Manages the entire appointment booking workflow
 *
 * **State:**
 * - services: List of available services
 * - selectedServiceId: Currently selected service ID
 * - selectedDate: Currently selected booking date
 * - availableSlots: Slots available for selected date/service
 * - selectedSlot: Currently selected time slot
 * - vehicle: Vehicle information (plate, make, model)
 * - customer: Customer information (name, email)
 * - appointmentId: ID after successful booking
 * - bookingReference: Reference number after successful booking
 * - isLoading: Whether API call in progress
 * - error: Error message if operation failed
 *
 * **Getters:**
 * - selectedService: Full service object for selectedServiceId
 * - isBookingComplete: Whether all required fields are filled
 *
 * **Actions:**
 * - loadServices(): Fetch service catalog
 * - selectService(id): Set service and reset dependent fields
 * - selectDate(date): Set booking date
 * - fetchAvailability(date): Load slots for selected service and date
 * - selectSlot(slot): Select a time slot
 * - setVehicle(plate, make, model): Update vehicle information
 * - setCustomer(name, email): Update customer information
 * - submitBooking(): Create appointment on backend
 * - resetBooking(): Clear all state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Service, Slot, Appointment } from '#server/utils/types';

export const useBookingStore = defineStore('bookingStore', () => {
  // ============ State ============
  const services = ref<Service[]>([]);
  const selectedServiceId = ref<string>('');
  const selectedDate = ref<string>('');
  const availableSlots = ref<Slot[]>([]);
  const selectedSlot = ref<Slot | null>(null);
  const vehicle = ref<{ plate: string, make?: string, model?: string }>({
    plate: '',
    make: '',
    model: '',
  });
  const customer = ref<{ name: string, email: string }>({
    name: '',
    email: '',
  });
  const appointmentId = ref<string | null>(null);
  const bookingReference = ref<string | null>(null);
  const confirmation = ref<Appointment | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // ============ Getters ============
  const selectedService = computed((): Service | undefined => {
    return services.value.find(s => s.id === selectedServiceId.value);
  });

  const isBookingComplete = computed((): boolean => {
    return Boolean(
      vehicle.value.plate
      && selectedServiceId.value
      && selectedDate.value
      && selectedSlot.value
      && customer.value.name
      && customer.value.email,
    );
  });

  // ============ Actions ============
  const loadServices = async (): Promise<void> => {
    const { services: svc } = useServices();
    isLoading.value = true;
    error.value = null;
    try {
      await useServices().load();
      services.value = svc.value;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to load services';
    }
    finally {
      isLoading.value = false;
    }
  };

  const selectService = (id: string): void => {
    selectedServiceId.value = id;
    selectedDate.value = '';
    availableSlots.value = [];
    selectedSlot.value = null;
  };

  const selectDate = (date: string): void => {
    selectedDate.value = date;
    selectedSlot.value = null;
    availableSlots.value = [];
  };

  const fetchAvailability = async (date: string): Promise<void> => {
    if (!selectedServiceId.value)
      throw new Error('Service not selected');

    isLoading.value = true;
    error.value = null;
    try {
      const { slots } = useAvailability();
      await useAvailability().fetch(selectedServiceId.value, date);
      availableSlots.value = slots.value;
      selectedDate.value = date;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to fetch availability';
      availableSlots.value = [];
    }
    finally {
      isLoading.value = false;
    }
  };

  const selectSlot = (slot: Slot): void => {
    selectedSlot.value = slot;
  };

  const setVehicle = (plate: string, make?: string, model?: string): void => {
    vehicle.value = { plate, make: make || '', model: model || '' };
  };

  const setCustomer = (name: string, email: string): void => {
    customer.value = { name, email };
  };

  const submitBooking = async (): Promise<void> => {
    if (!isBookingComplete.value)
      throw new Error('Booking is incomplete');

    isLoading.value = true;
    error.value = null;
    try {
      const response = await createAppointment({
        serviceId: selectedServiceId.value,
        startTime: selectedSlot.value!.startTime,
        endTime: selectedSlot.value!.endTime,
        vehiclePlate: vehicle.value.plate,
        vehicleMake: vehicle.value.make,
        vehicleModel: vehicle.value.model,
        customerName: customer.value.name,
        customerEmail: customer.value.email,
      });

      appointmentId.value = response.appointmentId;
      bookingReference.value = response.bookingReference;
      confirmation.value = response.appointment;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to create appointment';
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  };

  const resetBooking = (): void => {
    services.value = [];
    selectedServiceId.value = '';
    selectedDate.value = '';
    availableSlots.value = [];
    selectedSlot.value = null;
    vehicle.value = { plate: '', make: '', model: '' };
    customer.value = { name: '', email: '' };
    appointmentId.value = null;
    bookingReference.value = null;
    confirmation.value = null;
    error.value = null;
  };

  return {
    // State
    services,
    selectedServiceId,
    selectedDate,
    availableSlots,
    selectedSlot,
    vehicle,
    customer,
    appointmentId,
    bookingReference,
    confirmation,
    isLoading,
    error,
    // Getters
    selectedService,
    isBookingComplete,
    // Actions
    loadServices,
    selectService,
    selectDate,
    fetchAvailability,
    selectSlot,
    setVehicle,
    setCustomer,
    submitBooking,
    resetBooking,
  };
});

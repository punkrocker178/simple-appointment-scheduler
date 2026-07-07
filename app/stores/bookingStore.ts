/**
 * Pinia Booking Store - Manages the authenticated customer booking workflow
 *
 * **State:**
 * - services: Active service types from the real .NET endpoint
 * - dealershipId: Default dealership id resolved by the BFF
 * - selectedServiceTypeId: Currently selected service type id
 * - selectedDate: Currently selected booking date (yyyy-MM-dd)
 * - availabilityResponse: Full backend availability response
 * - availableSlots: Slots available for selected date/service
 * - selectedSlot: Currently selected time slot (secondsFromMidnight)
 * - vehicles: Customer's saved vehicles
 * - selectedVehicleId: Currently selected vehicle id
 * - customerProfile: Customer's profile from /api/me/customer
 * - appointment: Created appointment response
 * - isLoading: Whether an async operation is in progress
 * - error: Error message if operation failed
 *
 * **Getters:**
 * - selectedService: Full service type object for selectedServiceTypeId
 * - selectedVehicle: Full vehicle object for selectedVehicleId
 * - isBookingComplete: Whether all required fields are filled
 *
 * **Actions:**
 * - bootstrap(): Load service types, vehicles, and customer profile
 * - selectServiceType(id): Set service type and reset dependent fields
 * - selectDate(date): Set booking date
 * - fetchAvailability(date): Load slots for selected service and date
 * - selectSlot(slot): Select a time slot
 * - selectVehicle(id): Select an existing vehicle
 * - addVehicle(make, model, year): Create and select a new vehicle
 * - submitBooking(): Create appointment on the backend
 * - resetBooking(): Clear all state
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  AppointmentResponse,
  AvailabilityResponse,
  AvailabilitySlotDto,
  BookingVehicle,
  CreateAppointmentRequest,
  ServiceTypeOption,
} from '~/types/api/booking';
import type { Customer } from '~/types/api';

export const useBookingStore = defineStore('bookingStore', () => {
  // ============ State ============
  const services = ref<ServiceTypeOption[]>([]);
  const dealershipId = ref<string | null>(null);
  const selectedServiceTypeId = ref<string | null>(null);
  const selectedDate = ref<string>('');
  const availabilityResponse = ref<AvailabilityResponse | null>(null);
  const availableSlots = ref<AvailabilitySlotDto[]>([]);
  const selectedSlot = ref<AvailabilitySlotDto | null>(null);
  const vehicles = ref<BookingVehicle[]>([]);
  const selectedVehicleId = ref<string | null>(null);
  const customerProfile = ref<Customer | null>(null);
  const appointment = ref<AppointmentResponse | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // ============ Getters ============
  const selectedService = computed((): ServiceTypeOption | undefined => {
    return services.value.find(s => s.id === selectedServiceTypeId.value);
  });

  const selectedVehicle = computed((): BookingVehicle | undefined => {
    return vehicles.value.find(v => v.id === selectedVehicleId.value);
  });

  const isBookingComplete = computed((): boolean => {
    return Boolean(
      selectedVehicleId.value
      && selectedServiceTypeId.value
      && selectedDate.value
      && selectedSlot.value
      && customerProfile.value,
    );
  });

  // ============ Actions ============
  const api = useBookingApi();
  const authStore = useAuthStore();

  const bootstrap = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const [serviceTypesResult, vehiclesResult, customerResult] = await Promise.all([
        api.fetchServiceTypes(),
        api.fetchMyVehicles(),
        api.fetchMyCustomer(),
      ]);
      services.value = serviceTypesResult.serviceTypes;
      dealershipId.value = serviceTypesResult.dealershipId;
      vehicles.value = vehiclesResult;
      customerProfile.value = customerResult;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to load booking data';
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  };

  const selectServiceType = (id: string | null): void => {
    selectedServiceTypeId.value = id;
    selectedDate.value = '';
    availabilityResponse.value = null;
    availableSlots.value = [];
    selectedSlot.value = null;
  };

  const selectDate = (date: string): void => {
    selectedDate.value = date;
    selectedSlot.value = null;
    availabilityResponse.value = null;
    availableSlots.value = [];
  };

  const fetchAvailability = async (date: string): Promise<void> => {
    if (!selectedServiceTypeId.value)
      throw new Error('Service type not selected');
    if (!dealershipId.value)
      throw new Error('Dealership not loaded');

    isLoading.value = true;
    error.value = null;
    try {
      const result = await api.fetchAvailability(
        dealershipId.value,
        selectedServiceTypeId.value,
        date,
      );
      availabilityResponse.value = result;
      availableSlots.value = result.slots;
      selectedDate.value = date;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to fetch availability';
      availabilityResponse.value = null;
      availableSlots.value = [];
    }
    finally {
      isLoading.value = false;
    }
  };

  const selectSlot = (slot: AvailabilitySlotDto): void => {
    selectedSlot.value = slot;
  };

  const selectVehicle = (id: string | null): void => {
    selectedVehicleId.value = id;
  };

  const addVehicle = async (make: string, model: string, year: number): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const vehicle = await api.createVehicle({ make, model, year });
      vehicles.value.push(vehicle);
      selectedVehicleId.value = vehicle.id;
    }
    catch (err) {
      error.value = (err as Error).message || 'Failed to add vehicle';
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  };

  const submitBooking = async (): Promise<void> => {
    if (!isBookingComplete.value)
      throw new Error('Booking is incomplete');
    if (!authStore.customerId)
      throw new Error('Customer profile not linked');

    const payload: CreateAppointmentRequest = {
      customerId: authStore.customerId,
      vehicleId: selectedVehicleId.value!,
      serviceTypeId: selectedServiceTypeId.value!,
      bookingDate: selectedDate.value,
      secondsFromMidnight: selectedSlot.value!.secondsFromMidnight,
    };

    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.createAppointment(payload);
      appointment.value = response;
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
    dealershipId.value = null;
    selectedServiceTypeId.value = null;
    selectedDate.value = '';
    availabilityResponse.value = null;
    availableSlots.value = [];
    selectedSlot.value = null;
    vehicles.value = [];
    selectedVehicleId.value = null;
    customerProfile.value = null;
    appointment.value = null;
    error.value = null;
  };

  return {
    // State
    services,
    dealershipId,
    selectedServiceTypeId,
    selectedDate,
    availabilityResponse,
    availableSlots,
    selectedSlot,
    vehicles,
    selectedVehicleId,
    customerProfile,
    appointment,
    isLoading,
    error,
    // Getters
    selectedService,
    selectedVehicle,
    isBookingComplete,
    // Actions
    bootstrap,
    selectServiceType,
    selectDate,
    fetchAvailability,
    selectSlot,
    selectVehicle,
    addVehicle,
    submitBooking,
    resetBooking,
  };
});

/**
 * useBookingApi - Typed client for customer self-service booking APIs
 *
 * Stateless wrappers around /api/booking/* and /api/me/* BFF routes.
 * Handles 401 by logging out and redirecting to /login.
 */
import type {
  AppointmentResponse,
  AvailabilityResponse,
  BookingServiceTypesResponse,
  BookingVehicle,
  CreateAppointmentRequest,
  ServiceTypeOption,
} from '~/types/api/booking';
import type { Customer, Vehicle, CreateVehicleRequest } from '~/types/api';
import { getApiErrorStatusCode, toApiError } from '~/utils/apiErrors';

async function bookingFetch<T>(url: string, options?: Record<string, unknown>): Promise<T> {
  try {
    return await $fetch<T>(url, options as Parameters<typeof $fetch>[1]);
  }
  catch (error: unknown) {
    const statusCode = getApiErrorStatusCode(error);
    const authStore = useAuthStore();

    if (statusCode === 401) {
      await authStore.logout();
      await navigateTo('/login');
      throw toApiError(error);
    }

    throw toApiError(error);
  }
}

export function useBookingApi() {
  const fetchServiceTypes = async (): Promise<BookingServiceTypesResponse> =>
    bookingFetch<BookingServiceTypesResponse>('/api/booking/service-types');

  const fetchAvailability = async (
    dealershipId: string,
    serviceTypeId: string,
    date: string,
  ): Promise<AvailabilityResponse> =>
    bookingFetch<AvailabilityResponse>('/api/booking/availability', {
      query: { dealershipId, serviceTypeId, date },
    });

  const createAppointment = async (payload: CreateAppointmentRequest): Promise<AppointmentResponse> =>
    bookingFetch<AppointmentResponse>('/api/booking/appointments', {
      method: 'POST',
      body: payload,
    });

  const fetchMyCustomer = async (): Promise<Customer> =>
    bookingFetch<Customer>('/api/me/customer');

  const fetchMyVehicles = async (): Promise<BookingVehicle[]> =>
    bookingFetch<BookingVehicle[]>('/api/me/vehicles');

  const fetchMyAppointments = async (): Promise<AppointmentResponse[]> =>
    bookingFetch<AppointmentResponse[]>('/api/me/appointments');

  const createVehicle = async (payload: CreateVehicleRequest): Promise<BookingVehicle> => {
    const vehicle = await bookingFetch<Vehicle>('/api/me/vehicles', {
      method: 'POST',
      body: payload,
    });
    return {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
    };
  };

  return {
    fetchServiceTypes,
    fetchAvailability,
    createAppointment,
    fetchMyCustomer,
    fetchMyVehicles,
    fetchMyAppointments,
    createVehicle,
  };
}

export type BookingServiceType = ServiceTypeOption;

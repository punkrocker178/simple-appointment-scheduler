/**
 * useApiClient - Wrapper around $fetch for booking API calls
 *
 * Provides typed HTTP methods for communicating with the BFF proxies that
 * forward to the real .NET backend.
 */

import type {
  AppointmentResponse,
  AvailabilityResponse,
  BookingServiceTypesResponse,
  CreateAppointmentRequest,
} from '~/types/api/booking';

export interface BookingServiceTypesResult {
  dealershipId: string;
  dealershipName: string;
  serviceTypes: Array<{
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: number;
  }>;
}

export interface CreateAppointmentResult {
  appointmentId: string;
  appointment: AppointmentResponse;
}

/**
 * Fetch active service types for the default dealership
 */
export async function fetchServices(): Promise<BookingServiceTypesResult> {
  const response = await $fetch<BookingServiceTypesResponse>('/api/booking/service-types');
  return {
    dealershipId: response.dealershipId,
    dealershipName: response.dealershipName,
    serviceTypes: response.serviceTypes,
  };
}

/**
 * Fetch available slots for a service and date
 */
export async function fetchAvailability(
  dealershipId: string,
  serviceTypeId: string,
  date: string,
): Promise<AvailabilityResponse> {
  return await $fetch<AvailabilityResponse>('/api/booking/availability', {
    query: {
      dealershipId,
      serviceTypeId,
      date,
    },
  });
}

/**
 * Create a new appointment
 */
export async function createAppointment(payload: CreateAppointmentRequest): Promise<CreateAppointmentResult> {
  const appointment = await $fetch<AppointmentResponse>('/api/booking/appointments', {
    method: 'POST',
    body: payload,
  });

  return {
    appointmentId: appointment.id,
    appointment,
  };
}

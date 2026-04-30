/**
 * useApiClient - Wrapper around $fetch for API calls with error handling
 *
 * Provides typed HTTP methods for communicating with Nitro backend.
 * All responses are typed based on the endpoint contract.
 *
 * @returns {Object} API methods
 * - fetchServices(): Returns services list
 * - fetchAvailability(serviceId, date): Returns available slots
 * - createAppointment(data): Posts appointment and returns confirmation
 * - fetchAppointments(): Returns all appointments
 */

import type { Service, Slot, Appointment, AvailabilityResponse } from '#server/utils/types';

export interface AppointmentPayload {
  serviceId: string
  startTime: string
  endTime: string
  vehiclePlate: string
  vehicleMake?: string
  vehicleModel?: string
  customerName: string
  customerEmail: string
}

export interface CreateAppointmentResponse {
  appointmentId: string
  bookingReference: string
  appointment: Appointment
}

/**
 * Fetch services from the API
 */
export async function fetchServices(): Promise<Service[]> {
  try {
    const response = await $fetch<{ services: Service[] }>('/api/services');
    return response.services;
  }
  catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

/**
 * Fetch available slots for a service and date
 */
export async function fetchAvailability(serviceId: string, date: string): Promise<Slot[]> {
  try {
    const response = await $fetch<AvailabilityResponse>('/api/availability', {
      query: {
        serviceId,
        date,
      },
    });
    return response.slots;
  }
  catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(payload: AppointmentPayload): Promise<CreateAppointmentResponse> {
  try {
    const response = await $fetch<CreateAppointmentResponse>('/api/appointments', {
      method: 'POST',
      body: payload,
    });
    return response;
  }
  catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Fetch all appointments
 */
export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const response = await $fetch<{ appointments: Appointment[] }>('/api/appointments');
    return response.appointments;
  }
  catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

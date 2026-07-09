/**
 * Pure helpers for customer "My appointments" list display.
 * Joins appointment IDs against vehicle and service-type catalogs.
 */
import type {
  AppointmentResponse,
  BookingVehicle,
  ServiceTypeOption,
} from '~/types/api/booking';
import { AppointmentStatus } from '~/types/api/booking';
import {
  bookingDateToLocalDate,
  formatBookingDate,
  formatBookingTime,
  slotEndSeconds,
} from '~/utils/bookingTime';

export interface MyAppointmentDisplay {
  id: string;
  dateLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  vehicleLabel: string;
  serviceLabel: string;
  durationMinutes: number;
  status: AppointmentStatus;
}

export function formatVehicleLabel(vehicle: BookingVehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export function toMyAppointmentDisplay(
  appointment: AppointmentResponse,
  vehicleMap: Map<string, BookingVehicle>,
  serviceMap: Map<string, ServiceTypeOption>,
): MyAppointmentDisplay {
  const vehicle = vehicleMap.get(appointment.vehicleId);
  const service = serviceMap.get(appointment.serviceTypeId);
  const start = bookingDateToLocalDate(
    appointment.bookingDate,
    appointment.secondsFromMidnight,
  );
  const end = bookingDateToLocalDate(
    appointment.bookingDate,
    slotEndSeconds(appointment.secondsFromMidnight, appointment.durationMinutes),
  );

  return {
    id: appointment.id,
    dateLabel: formatBookingDate(start),
    startTimeLabel: formatBookingTime(start),
    endTimeLabel: formatBookingTime(end),
    vehicleLabel: vehicle ? formatVehicleLabel(vehicle) : 'Unknown vehicle',
    serviceLabel: service?.name ?? 'Unknown service',
    durationMinutes: appointment.durationMinutes,
    status: appointment.status,
  };
}

export function toMyAppointmentDisplays(
  appointments: AppointmentResponse[],
  vehicles: BookingVehicle[],
  serviceTypes: ServiceTypeOption[],
): MyAppointmentDisplay[] {
  const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
  const serviceMap = new Map(serviceTypes.map(s => [s.id, s]));
  return appointments.map(apt => toMyAppointmentDisplay(apt, vehicleMap, serviceMap));
}

export interface ServiceTypeOption {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

export interface BookingServiceTypesResponse {
  dealershipId: string;
  dealershipName: string;
  serviceTypes: ServiceTypeOption[];
}

export interface AvailabilitySlotDto {
  secondsFromMidnight: number;
  available: boolean;
}

export interface AvailabilityResponse {
  bookingDate: string;
  serviceTypeId: string;
  durationMinutes: number;
  slots: AvailabilitySlotDto[];
}

export interface BookingVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
}

export interface CreateAppointmentRequest {
  customerId: string;
  vehicleId: string;
  serviceTypeId: string;
  bookingDate: string;
  secondsFromMidnight: number;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

export interface CancelAppointmentRequest {
  reason: string;
}

export enum AppointmentStatus {
  Scheduled = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface AppointmentResponse {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceTypeId: string;
  technicianId: string;
  serviceBayId: string;
  bookingDate: string;
  secondsFromMidnight: number;
  durationMinutes: number;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  startedAtUtc?: string | null;
  completedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
}

import type { AppointmentStatus } from '~/types/api';

export interface CalendarAppointment {
  id: string;
  bookingDate: string;
  secondsFromMidnight: number;
  durationMinutes: number;
  time: string;
  customer: string;
  vehicle: string;
  service: string;
  technician: string;
  serviceBayId: string;
  bay: string;
  status: AppointmentStatus;
}

export interface CalendarBayColumn {
  id: string;
  name: string;
}

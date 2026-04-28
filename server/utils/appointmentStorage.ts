import type { Appointment } from './types';

const appointments: Appointment[] = [];

export function storeAppointment(appointment: Appointment): Appointment {
  appointments.push(appointment);
  return appointment;
}

export function getAllAppointments(): Appointment[] {
  return appointments.slice();
}

export function resetAppointments(): void {
  appointments.length = 0;
}

export function findOverlappingAppointments(startISO: string, endISO: string): Appointment[] {
  return appointments.filter((a) => !(a.endTime <= startISO || a.startTime >= endISO));
}

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

export function findOverlappingAppointments(startMs: number, endMs: number): Appointment[] {
  return appointments.filter((a) => !(a.endTime <= startMs || a.startTime >= endMs));
}

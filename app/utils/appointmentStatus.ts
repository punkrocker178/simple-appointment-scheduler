import { AppointmentStatus } from '~/types/api';

/** Human-readable label for backend appointment status values. */
export function formatAppointmentStatus(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return 'Scheduled';
    case AppointmentStatus.InProgress:
      return 'In Progress';
    case AppointmentStatus.Completed:
      return 'Completed';
    case AppointmentStatus.Cancelled:
      return 'Cancelled';
    default:
      return String(status);
  }
}

/** Vuetify chip color for appointment status. */
export function appointmentStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return 'primary';
    case AppointmentStatus.InProgress:
      return 'warning';
    case AppointmentStatus.Completed:
      return 'success';
    case AppointmentStatus.Cancelled:
      return 'error';
    default:
      return 'default';
  }
}

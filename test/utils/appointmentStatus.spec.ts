import { describe, it, expect } from 'vitest';
import { AppointmentStatus } from '~/types/api';
import { appointmentStatusColor, formatAppointmentStatus } from '~/utils/appointmentStatus';

describe('appointmentStatus utils', () => {
  it('formats numeric backend status values', () => {
    expect(formatAppointmentStatus(AppointmentStatus.Scheduled)).toBe('Scheduled');
    expect(formatAppointmentStatus(AppointmentStatus.InProgress)).toBe('In Progress');
    expect(formatAppointmentStatus(AppointmentStatus.Completed)).toBe('Completed');
    expect(formatAppointmentStatus(AppointmentStatus.Cancelled)).toBe('Cancelled');
  });

  it('returns chip colors for each status', () => {
    expect(appointmentStatusColor(AppointmentStatus.Scheduled)).toBe('primary');
    expect(appointmentStatusColor(AppointmentStatus.InProgress)).toBe('warning');
    expect(appointmentStatusColor(AppointmentStatus.Completed)).toBe('success');
    expect(appointmentStatusColor(AppointmentStatus.Cancelled)).toBe('error');
  });
});

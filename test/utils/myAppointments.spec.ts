/**
 * myAppointments utils — label enrichment for customer appointment list
 */

import { describe, it, expect } from 'vitest';
import { AppointmentStatus } from '~/types/api/booking';
import {
  formatVehicleLabel,
  toMyAppointmentDisplays,
} from '~/utils/myAppointments';
import {
  createMockAppointmentResponse,
  createMockServiceType,
} from '../testUtils';

describe('myAppointments utils', () => {
  const vehicles = [
    { id: 'v1', make: 'Toyota', model: 'Camry', year: 2024 },
    { id: 'v2', make: 'Honda', model: 'Civic', year: 2022 },
  ];

  const serviceTypes = [
    createMockServiceType({ id: 's1', name: 'Oil Change' }),
    createMockServiceType({ id: 's2', name: 'Tire Rotation' }),
  ];

  it('formats vehicle label as year make model', () => {
    expect(formatVehicleLabel(vehicles[0]!)).toBe('2024 Toyota Camry');
  });

  it('maps appointment IDs to vehicle and service labels', () => {
    const appointments = [
      createMockAppointmentResponse({
        id: 'apt-1',
        vehicleId: 'v1',
        serviceTypeId: 's1',
        bookingDate: '2026-07-10',
        secondsFromMidnight: 28800,
        durationMinutes: 30,
        status: AppointmentStatus.Scheduled,
      }),
    ];

    const displays = toMyAppointmentDisplays(appointments, vehicles, serviceTypes);

    expect(displays).toHaveLength(1);
    expect(displays[0]).toMatchObject({
      id: 'apt-1',
      vehicleLabel: '2024 Toyota Camry',
      serviceLabel: 'Oil Change',
      durationMinutes: 30,
      status: AppointmentStatus.Scheduled,
    });
    expect(displays[0]!.dateLabel).toBeTruthy();
    expect(displays[0]!.startTimeLabel).toBeTruthy();
    expect(displays[0]!.endTimeLabel).toBeTruthy();
  });

  it('uses fallback labels when vehicle or service is missing', () => {
    const appointments = [
      createMockAppointmentResponse({
        id: 'apt-2',
        vehicleId: 'missing-vehicle',
        serviceTypeId: 'missing-service',
      }),
    ];

    const displays = toMyAppointmentDisplays(appointments, vehicles, serviceTypes);

    expect(displays[0]!.vehicleLabel).toBe('Unknown vehicle');
    expect(displays[0]!.serviceLabel).toBe('Unknown service');
  });

  it('returns an empty array for an empty appointment list', () => {
    expect(toMyAppointmentDisplays([], vehicles, serviceTypes)).toEqual([]);
  });
});

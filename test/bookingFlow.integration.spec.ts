import { describe, it, expect, beforeEach } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils/e2e';
import { clearAppointments } from '../server/utils/appointmentStorage';

describe('booking flow integration', async () => {
  await setup();

  beforeEach(() => {
    clearAppointments();
  });

  it('completes full booking workflow', async () => {
    // Step 1: Fetch services
    const services = await $fetch('/api/services');
    expect(services).toBeInstanceOf(Array);
    expect(services.length).toBeGreaterThan(0);

    const serviceId = services[0].id.toString();

    // Step 2: Check availability
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];

    const availability = await $fetch(`/api/availability?serviceId=${serviceId}&date=${dateStr}`);
    expect(availability.slots).toBeInstanceOf(Array);
    expect(availability.slots.length).toBeGreaterThan(0);

    const slot = availability.slots.find((s: any) => s.available);
    expect(slot).toBeDefined();

    // Step 3: Create appointment
    const appointmentData = {
      serviceId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      vehiclePlate: 'ABC123',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    };

    const response = await $fetch('/api/appointments', {
      method: 'POST',
      body: appointmentData,
    });

    expect(response.appointmentId).toBeDefined();
    expect(response.bookingReference).toBeDefined();
    expect(response.bookingReference).toHaveLength(8);
    expect(response.appointment.vehiclePlate).toBe('ABC123');

    // Step 4: Verify appointment was stored
    const appointments = await $fetch('/api/appointments');
    expect(appointments).toBeInstanceOf(Array);
    expect(appointments.length).toBe(1);
    expect(appointments[0].id).toBe(response.appointmentId);
  });

  it('prevents double-booking same slot', async () => {
    const services = await $fetch('/api/services');
    const serviceId = services[0].id.toString();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];

    const availability = await $fetch(`/api/availability?serviceId=${serviceId}&date=${dateStr}`);
    const slot = availability.slots.find((s: any) => s.available);

    const appointmentData = {
      serviceId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      vehiclePlate: 'ABC123',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    };

    // First booking succeeds
    await $fetch('/api/appointments', {
      method: 'POST',
      body: appointmentData,
    });

    // Second booking for same slot should fail
    await expect(
      $fetch('/api/appointments', {
        method: 'POST',
        body: { ...appointmentData, vehiclePlate: 'XYZ789' },
      }),
    ).rejects.toThrow();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { generateSlots, checkConflict, generateBookingReference } from '../server/utils/schedulingLogic';
import { getAppointments, addAppointment, clearAppointments } from '../server/utils/appointmentStorage';
import { services, technicians, serviceBays } from '../server/utils/seedData';

describe('schedulingLogic', () => {
  beforeEach(() => {
    clearAppointments();
  });

  describe('generateSlots', () => {
    it('generates 30-minute slots within operating hours', () => {
      const date = new Date('2025-05-15');
      const slots = generateSlots(date, 30);
      
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].startTime).toBe(new Date('2025-05-15T08:00:00').getTime());
      expect(slots[slots.length - 1].endTime).toBe(new Date('2025-05-15T18:00:00').getTime());
    });

    it('returns empty array for Sunday', () => {
      const sunday = new Date('2025-05-18');
      const slots = generateSlots(sunday, 30);
      
      expect(slots).toEqual([]);
    });

    it('filters out past slots for today', () => {
      const now = new Date();
      const slots = generateSlots(now, 30);
      
      slots.forEach(slot => {
        expect(slot.startTime).toBeGreaterThanOrEqual(now.getTime() + 2 * 60 * 60 * 1000);
      });
    });
  });

  describe('checkConflict', () => {
    it('assigns resources when no conflict exists', () => {
      const result = checkConflict(
        new Date('2025-05-15T10:00:00').getTime(),
        new Date('2025-05-15T10:30:00').getTime(),
        services[0].id.toString(),
      );

      expect(result.hasConflict).toBe(false);
      expect(result.assignedTechnicianId).toBeDefined();
      expect(result.assignedBayId).toBeDefined();
    });

    it('detects conflict when all resources are busy', () => {
      const startTime = new Date('2025-05-15T10:00:00').getTime();
      const endTime = new Date('2025-05-15T10:30:00').getTime();

      technicians.forEach(tech => {
        serviceBays.forEach(bay => {
          addAppointment({
            id: `${tech.id}-${bay.id}`,
            serviceId: services[0].id.toString(),
            startTime,
            endTime,
            vehiclePlate: 'TEST',
            customerName: 'Test',
            customerEmail: 'test@test.com',
            bookingReference: 'REF',
            technicianId: tech.id,
            bayId: bay.id,
          });
        });
      });

      const result = checkConflict(startTime, endTime, services[0].id.toString());
      expect(result.hasConflict).toBe(true);
    });
  });

  describe('generateBookingReference', () => {
    it('generates unique 8-character reference', () => {
      const ref1 = generateBookingReference();
      const ref2 = generateBookingReference();

      expect(ref1).toHaveLength(8);
      expect(ref2).toHaveLength(8);
      expect(ref1).not.toBe(ref2);
    });
  });
});

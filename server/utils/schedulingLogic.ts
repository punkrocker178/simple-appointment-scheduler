import { SERVICES, TECHNICIANS, SERVICE_BAYS, OPERATING_HOURS, OPERATING_DAYS, SAME_DAY_MIN_HOURS } from './seedData';
import { getAllAppointments } from './appointmentStorage';
import type { ConflictCheckResult } from './types';

function overlaps(aStartMs: number, aEndMs: number, bStartMs: number, bEndMs: number): boolean {
  return !(aEndMs <= bStartMs || aStartMs >= bEndMs);
}

export function isSlotAvailable(serviceId: number, startMs: number, endMs: number): ConflictCheckResult {
  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) return { hasConflict: true, reason: 'Service not found' };

  const start = new Date(startMs);
  const end = new Date(endMs);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { hasConflict: true, reason: 'Invalid date' };

  // Operating day check (0=Sunday, 1=Monday...)
  const day = start.getDay();
  if (!OPERATING_DAYS.includes(day)) return { hasConflict: true, reason: 'Outside operating days' };

  // Operating hours check
  const startHour = start.getHours() + start.getMinutes() / 60;
  const endHour = end.getHours() + end.getMinutes() / 60;
  if (startHour < OPERATING_HOURS.startHour || endHour > OPERATING_HOURS.endHour) {
    return { hasConflict: true, reason: 'Outside operating hours' };
  }

  // Same-day minimum hours rule
  const now = new Date();
  const sameDay = start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth() && start.getDate() === now.getDate();
  if (sameDay) {
    const diffMs = start.getTime() - now.getTime();
    const minMs = SAME_DAY_MIN_HOURS * 60 * 60 * 1000;
    if (diffMs < minMs) return { hasConflict: true, reason: `Same-day bookings require at least ${SAME_DAY_MIN_HOURS} hours notice` };
  }

  // Resource availability check: find a technician with required skill and an available bay
  const appointments = getAllAppointments();

  // find available technician
  const candidateTech = TECHNICIANS.find((tech) => {
    if (tech.skill !== service.requiredSkill) return false;
    const busy = appointments.some((a) => a.technicianId === tech.id && overlaps(a.startTime, a.endTime, startMs, endMs));
    return !busy;
  });
  if (!candidateTech) return { hasConflict: true, reason: 'No available qualified technician' };

  // find available bay
  const candidateBay = SERVICE_BAYS.find((bay) => {
    const busy = appointments.some((a) => a.bayId === bay.id && overlaps(a.startTime, a.endTime, startMs, endMs));
    return !busy;
  });
  if (!candidateBay) return { hasConflict: true, reason: 'No available service bay' };

  return { hasConflict: false, assignedTechnicianId: candidateTech.id, assignedBayId: candidateBay.id };
}

export function generateBookingReference(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100 + Math.random() * 900);
  return `BOOK-${datePart}-${rand}`;
}

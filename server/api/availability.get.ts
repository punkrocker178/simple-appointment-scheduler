import { SERVICES, OPERATING_HOURS } from '../utils/seedData';
import { isSlotAvailable } from '../utils/schedulingLogic';
import type { Slot } from '../utils/types';

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const serviceId = query.serviceId ? parseInt(query.serviceId as string, 10) : null;
  const date = query.date as string | undefined; // expected YYYY-MM-DD

  if (!serviceId || !date) throw createError({ statusCode: 400, message: 'serviceId and date are required' });

  const service = SERVICES.find((s) => s.id === serviceId);
  if (!service) throw createError({ statusCode: 404, message: 'Service not found' });

  const duration = service.durationMinutes;
  const interval = 30; // minutes (configured via UX choice)

  const openMinutes = OPERATING_HOURS.startHour * 60;
  const closeMinutes = OPERATING_HOURS.endHour * 60;
  const lastStartMinutes = closeMinutes - duration;

  const slots: Slot[] = [];

  for (let m = openMinutes; m <= lastStartMinutes; m += interval) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    // construct ISO datetime for the given local date/time
    const startLocal = new Date(`${date}T${pad(hh)}:${pad(mm)}:00`);
    const endLocal = new Date(startLocal.getTime() + duration * 60 * 1000);
    const startISO = startLocal.toISOString();
    const endISO = endLocal.toISOString();

    const check = isSlotAvailable(serviceId, startISO, endISO);
    const slot: Slot = {
      startTime: startISO,
      endTime: endISO,
      available: !check.hasConflict,
      technicianId: check.assignedTechnicianId,
      bayId: check.assignedBayId,
    };
    slots.push(slot);
  }

  return {
    slots,
  };
});

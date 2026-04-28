import { isSlotAvailable, generateBookingReference } from '../../utils/schedulingLogic';
import { storeAppointment } from '../../utils/appointmentStorage';
import type { Appointment } from '../../utils/types';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    serviceId,
    startTime,
    endTime,
    vehiclePlate,
    vehicleMake,
    vehicleModel,
    customerName,
    customerEmail,
  } = body || {};

  if (!serviceId || !startTime || !endTime || !vehiclePlate || !customerName || !customerEmail) {
    throw createError({ statusCode: 400, message: 'Missing required fields' });
  }

  const check = isSlotAvailable(serviceId, startTime, endTime);
  if (check.hasConflict) {
    throw createError({ statusCode: 409, message: check.reason || 'Selected slot is no longer available' });
  }

  const id = `apt-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const bookingReference = generateBookingReference();

  const appointment: Appointment = {
    id,
    serviceId,
    startTime,
    endTime,
    vehiclePlate,
    vehicleMake,
    vehicleModel,
    customerName,
    customerEmail,
    bookingReference,
    technicianId: check.assignedTechnicianId,
    bayId: check.assignedBayId,
  };

  storeAppointment(appointment);

  return {
    appointmentId: id,
    bookingReference,
    appointment,
  };
});

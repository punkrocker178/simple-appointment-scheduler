import { getAllAppointments } from '../../utils/appointmentStorage';

export default defineEventHandler(() => {
  return {
    appointments: getAllAppointments(),
  };
});

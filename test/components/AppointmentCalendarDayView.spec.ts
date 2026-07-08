import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AppointmentCalendarDayView from '~/components/admin/appointments/AppointmentCalendarDayView.vue';
import AppointmentCalendarCard from '~/components/admin/appointments/AppointmentCalendarCard.vue';
import { AppointmentStatus } from '~/types/api';
import { vuetifyStubs } from '../testUtils';

const bays = [
  { id: 'bay-1', name: 'Bay 1' },
  { id: 'bay-2', name: 'Bay 2' },
];

const baseAppointment = {
  id: 'apt-1',
  bookingDate: '2026-07-07',
  secondsFromMidnight: 28_800,
  durationMinutes: 60,
  time: '08:00 – 09:00',
  customer: 'Jane Doe',
  vehicle: '2020 Toyota Camry',
  service: 'Oil Change',
  technician: 'Alex Tech',
  serviceBayId: 'bay-1',
  bay: 'Bay 1',
  status: AppointmentStatus.Scheduled,
};

describe('AppointmentCalendarDayView', () => {
  it('renders a column header for each bay', async () => {
    const wrapper = await mountSuspended(AppointmentCalendarDayView, {
      props: { bays, openSeconds: 28_800, closeSeconds: 61_200, appointments: [] },
      global: { stubs: vuetifyStubs },
    });

    expect(wrapper.text()).toContain('Bay 1');
    expect(wrapper.text()).toContain('Bay 2');
  });

  it('renders time slots for business hours', async () => {
    const wrapper = await mountSuspended(AppointmentCalendarDayView, {
      props: { bays, openSeconds: 28_800, closeSeconds: 61_200, appointments: [] },
      global: { stubs: vuetifyStubs },
    });

    expect(wrapper.text()).toContain('08:00');
    expect(wrapper.text()).toContain('16:30');
  });

  it('places an appointment in the correct bay column', async () => {
    const wrapper = await mountSuspended(AppointmentCalendarDayView, {
      props: {
        bays,
        openSeconds: 28_800,
        closeSeconds: 61_200,
        appointments: [baseAppointment],
      },
      global: { stubs: vuetifyStubs },
    });

    const cards = wrapper.findAllComponents(AppointmentCalendarCard);
    expect(cards).toHaveLength(1);
    expect(cards[0].props('appointment').serviceBayId).toBe('bay-1');
  });
});

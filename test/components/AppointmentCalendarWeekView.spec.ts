import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import AppointmentCalendarWeekView from '~/components/admin/appointments/AppointmentCalendarWeekView.vue';
import AppointmentCalendarCard from '~/components/admin/appointments/AppointmentCalendarCard.vue';
import { vuetifyStubs } from '../testUtils';

const days = ['2026-07-06', '2026-07-07', '2026-07-08'];

const appointment = {
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
  status: 0,
};

describe('AppointmentCalendarWeekView', () => {
  it('renders a header for each day', async () => {
    const wrapper = await mountSuspended(AppointmentCalendarWeekView, {
      props: { days, openSeconds: 28_800, closeSeconds: 61_200, appointments: [] },
      global: { stubs: vuetifyStubs },
    });

    expect(wrapper.text()).toContain('Tue, 7/7');
  });

  it('renders an appointment only on its booking date', async () => {
    const wrapper = await mountSuspended(AppointmentCalendarWeekView, {
      props: { days, openSeconds: 28_800, closeSeconds: 61_200, appointments: [appointment] },
      global: { stubs: vuetifyStubs },
    });

    const cards = wrapper.findAllComponents(AppointmentCalendarCard);
    expect(cards).toHaveLength(1);
  });
});

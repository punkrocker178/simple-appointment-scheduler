/**
 * SuccessMessage component tests
 */

import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SuccessMessage from '~/components/SuccessMessage.vue';
import {
  createMockAppointmentResponse,
  createMockServiceType,
  vuetifyStubs,
} from '../testUtils';

const stubs = {
  ...vuetifyStubs,
  'v-btn': {
    template: '<button type="button" :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\')"><slot /></button>',
    props: ['color', 'variant', 'class'],
  },
};

describe('SuccessMessage', () => {
  it('emits view-appointments when secondary button is clicked', async () => {
    const wrapper = await mountSuspended(SuccessMessage, {
      props: {
        appointment: createMockAppointmentResponse(),
        service: createMockServiceType(),
        vehicle: { id: 'v1', make: 'Toyota', model: 'Camry', year: 2024 },
        customer: {
          id: 'c1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '555-0100',
          createdAt: '2026-01-01T00:00:00Z',
        },
      },
      global: { stubs },
    });

    await wrapper.find('[data-testid="success-view-appointments-btn"]').trigger('click');
    expect(wrapper.emitted('view-appointments')).toBeTruthy();
  });

  it('emits new-booking when Done is clicked', async () => {
    const wrapper = await mountSuspended(SuccessMessage, {
      props: {
        appointment: createMockAppointmentResponse(),
      },
      global: { stubs },
    });

    await wrapper.find('[data-testid="success-done-btn"]').trigger('click');
    expect(wrapper.emitted('new-booking')).toBeTruthy();
  });
});

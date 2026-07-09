/**
 * My Appointments page tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { Pinia } from 'pinia';
import MyAppointmentsPage from '~/pages/my-appointments.vue';
import { AppointmentStatus } from '~/types/api/booking';
import {
  setupPinia,
  setupFetchMock,
  teardownFetchMock,
  vuetifyStubs,
  createMockAppointmentResponse,
  createMockServiceType,
} from '../testUtils';

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}));

mockNuxtImport('navigateTo', () => navigateToMock);

const pageStubs = {
  ...vuetifyStubs,
  'v-progress-circular': {
    template: '<div data-testid="progress-circular" />',
  },
  'v-alert': {
    template: '<div class="alert" data-testid="my-appointments-error"><slot /></div>',
    props: ['type', 'variant'],
  },
  'v-chip': {
    template: '<span class="chip"><slot /></span>',
    props: ['color', 'size', 'variant'],
  },
  'v-btn': {
    template: '<a v-if="to" :href="to" :data-testid="$attrs[\'data-testid\']"><slot /></a><button v-else type="button" :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\')"><slot /></button>',
    props: ['to', 'color', 'variant', 'size'],
  },
};

describe('my-appointments page', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = setupPinia();
    setupFetchMock();
    navigateToMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    teardownFetchMock();
    vi.restoreAllMocks();
  });

  it('renders empty state when there are no appointments', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/me/appointments') {
        return Promise.resolve([]);
      }
      if (url === '/api/me/vehicles') {
        return Promise.resolve([]);
      }
      if (url === '/api/booking/service-types') {
        return Promise.resolve({
          dealershipId: 'd1',
          dealershipName: 'Alpha',
          serviceTypes: [],
        });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    const wrapper = await mountSuspended(MyAppointmentsPage, {
      global: { plugins: [pinia], stubs: pageStubs },
    });

    expect(wrapper.find('[data-testid="my-appointments-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="my-appointments-empty-cta"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="my-appointments-list"]').exists()).toBe(false);
  });

  it('renders appointment cards with enriched labels', async () => {
    const mockFetch = vi.mocked(global.$fetch);
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/me/appointments') {
        return Promise.resolve([
          createMockAppointmentResponse({
            id: 'apt-1',
            vehicleId: 'v1',
            serviceTypeId: 's1',
            status: AppointmentStatus.Scheduled,
          }),
        ]);
      }
      if (url === '/api/me/vehicles') {
        return Promise.resolve([
          { id: 'v1', make: 'Toyota', model: 'Camry', year: 2024 },
        ]);
      }
      if (url === '/api/booking/service-types') {
        return Promise.resolve({
          dealershipId: 'd1',
          dealershipName: 'Alpha',
          serviceTypes: [createMockServiceType({ id: 's1', name: 'Oil Change' })],
        });
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    const wrapper = await mountSuspended(MyAppointmentsPage, {
      global: { plugins: [pinia], stubs: pageStubs },
    });

    expect(wrapper.find('[data-testid="my-appointments-list"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="my-appointment-card-apt-1"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Oil Change');
    expect(wrapper.text()).toContain('2024 Toyota Camry');
    expect(wrapper.text()).toContain('Scheduled');
  });
});

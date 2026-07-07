/**
 * Test Utilities - Shared factories, mocks, and helpers for unit tests
 */

import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';
import type { Service, Slot, Appointment } from '#server/utils/types';

/**
 * withSetup - Run composables in Vue setup context for proper injection
 * Borrowed from Nuxt testing best practices
 */
export function withSetup<T>(composable: () => T): T {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => null;
    },
  });
  app.mount(document.createElement('div'));
  return result!;
}

/**
 * Initialize fresh Pinia store for tests
 */
export function setupPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

/**
 * Test data factories - Create realistic mock objects
 */

export function createMockService(overrides?: Partial<Service>): Service {
  return {
    id: 1,
    name: 'Oil Change',
    durationMinutes: 30,
    requiredSkill: 'general',
    ...overrides,
  };
}

export function createMockSlot(overrides?: Partial<Slot>): Slot {
  const now = Date.now();
  const startTime = now + 24 * 60 * 60 * 1000; // Tomorrow
  return {
    startTime,
    endTime: startTime + 30 * 60 * 1000, // 30 min duration
    available: true,
    ...overrides,
  };
}

export function createMockAppointment(
  overrides?: Partial<Appointment>,
): Appointment {
  const now = Date.now();
  const startTime = now + 24 * 60 * 60 * 1000;
  return {
    id: 'apt-123',
    serviceId: '1',
    startTime,
    endTime: startTime + 30 * 60 * 1000,
    vehiclePlate: 'ABC123',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    bookingReference: 'BR-2025-001',
    ...overrides,
  };
}

export function createMockBookingStoreState() {
  return {
    services: [createMockService()],
    selectedServiceId: '',
    selectedDate: '',
    availableSlots: [],
    selectedSlot: null as Slot | null,
    vehicle: { plate: '', make: '', model: '' },
    customer: { name: '', email: '' },
    appointmentId: null as string | null,
    bookingReference: null as string | null,
    confirmation: null as Appointment | null,
    isLoading: false,
    error: null as string | null,
  };
}

/**
 * New mock factories for the real backend booking types
 */
export function createMockServiceType(overrides?: Partial<{
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
}>): {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
} {
  return {
    id: 's1',
    name: 'Oil Change',
    description: 'Standard oil change service',
    durationMinutes: 30,
    price: 49.99,
    ...overrides,
  };
}

export function createMockAvailabilitySlot(overrides?: Partial<{
  secondsFromMidnight: number
}>): {
  secondsFromMidnight: number;
} {
  return {
    secondsFromMidnight: 28800, // 08:00
    ...overrides,
  };
}

export function createMockAvailabilityResponse(
  countOrOverrides?: number | Partial<{
    bookingDate: string
    serviceTypeId: string
    durationMinutes: number
    slots: Array<{ secondsFromMidnight: number }>
  }>,
): {
  bookingDate: string;
  serviceTypeId: string;
  durationMinutes: number;
  slots: Array<{ secondsFromMidnight: number }>;
} {
  const slotCount = typeof countOrOverrides === 'number' ? countOrOverrides : 3;
  const overrides = typeof countOrOverrides === 'object' ? countOrOverrides : {};
  return {
    bookingDate: '2025-05-15',
    serviceTypeId: 's1',
    durationMinutes: 30,
    slots: Array.from({ length: slotCount }, (_, i) =>
      createMockAvailabilitySlot({ secondsFromMidnight: 28800 + i * 1800 }),
    ),
    ...overrides,
  };
}

export function createMockAppointmentResponse(overrides?: Partial<{
  id: string
  customerId: string
  vehicleId: string
  serviceTypeId: string
  bookingDate: string
  secondsFromMidnight: number
  durationMinutes: number
}>): {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceTypeId: string;
  technicianId: string;
  serviceBayId: string;
  bookingDate: string;
  secondsFromMidnight: number;
  durationMinutes: number;
  status: 'Scheduled';
} {
  return {
    id: 'apt-456',
    customerId: 'c1',
    vehicleId: 'v1',
    serviceTypeId: 's1',
    technicianId: 't1',
    serviceBayId: 'b1',
    bookingDate: '2025-05-15',
    secondsFromMidnight: 28800,
    durationMinutes: 30,
    status: 'Scheduled',
    ...overrides,
  };
}

/**
 * Vuetify component stubs for unit tests
 * Mocks Vuetify components to isolate business logic from UI library
 */
export const vuetifyStubs = {
  'v-card': { template: '<div><slot /></div>' },
  'v-form': { template: '<form @submit.prevent><slot /></form>' },
  'v-text-field': {
    template: `<input 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
    />`,
    props: ['modelValue', 'label', 'required', 'rules'],
    emits: ['update:modelValue'],
  },
  'v-progress-circular': { template: '<div class="spinner" />' },
  'v-icon': { template: '<span>{{ icon }}</span>', props: ['color'] },
  'v-radio': { template: '<input type="radio" :value="value" />', props: ['value'] },
  'v-radio-group': { template: '<div><slot /></div>', props: ['modelValue'] },
  'v-btn': { template: '<button><slot /></button>', props: ['color', 'variant', 'loading', 'disabled'] },
  'v-dialog': { template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue'] },
};

/**
 * Mock $fetch responses
 */
export const createMockFetchResponse = {
  services: (count = 1): { services: Service[] } => ({
    services: Array.from({ length: count }, (_, i) =>
      createMockService({ id: i + 1, name: `Service ${i + 1}` }),
    ),
  }),

  availability: (count = 3): { slots: Slot[] } => ({
    slots: Array.from({ length: count }, (_, i) => {
      const base = createMockSlot();
      return {
        ...base,
        startTime: base.startTime + i * 30 * 60 * 1000,
        endTime: base.endTime + i * 30 * 60 * 1000,
      };
    }),
  }),

  appointment: (): { appointmentId: string, bookingReference: string, appointment: Appointment } => ({
    appointmentId: 'apt-456',
    bookingReference: 'BR-2025-002',
    appointment: createMockAppointment(),
  }),

  appointments: (count = 1): { appointments: Appointment[] } => ({
    appointments: Array.from({ length: count }, (_, i) =>
      createMockAppointment({ id: `apt-${i}` }),
    ),
  }),
};

/**
 * Setup mock $fetch for composables
 * Mocks the global $fetch function to intercept API calls
 */
export function setupFetchMock() {
  const mockFetch = vi.fn();
  vi.stubGlobal('$fetch', mockFetch);
  return mockFetch;
}

export function teardownFetchMock() {
  vi.unstubAllGlobals();
}

/**
 * Date/time utilities for testing slot times
 */
export function getISOStringFromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

export function getISOTodayPlus(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

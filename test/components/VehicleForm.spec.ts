/**
 * VehicleForm Component Tests
 * Tests vehicle picker, add-vehicle dialog, and store integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import VehicleForm from '~/components/VehicleForm.vue';
import { vuetifyStubs, setupPinia } from '../testUtils';
import { useBookingStore } from '~/stores/bookingStore';

describe('VehicleForm Component', () => {
  beforeEach(() => {
    setupPinia();
  });

  describe('rendering', () => {
    it('should show empty state when no vehicles exist', async () => {
      const store = useBookingStore();
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      expect(wrapper.text()).toContain('No saved vehicles');
      expect(wrapper.text()).toContain('Add one to continue');
    });

    it('should render saved vehicles as selectable cards', async () => {
      const store = useBookingStore();
      store.vehicles = [
        { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020 },
        { id: 'v2', make: 'Honda', model: 'Civic', year: 2021 },
      ];

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      expect(wrapper.text()).toContain('Toyota Camry');
      expect(wrapper.text()).toContain('Honda Civic');
    });
  });

  describe('vehicle selection', () => {
    it('should select a vehicle when clicked', async () => {
      const store = useBookingStore();
      store.vehicles = [
        { id: 'v1', make: 'Toyota', model: 'Camry', year: 2020 },
      ];

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const card = wrapper.findAll('div.cursor-pointer')[0];
      await card.trigger('click');

      expect(store.selectedVehicleId).toBe('v1');
    });
  });

  describe('add vehicle dialog', () => {
    it('should open the add vehicle dialog when button is clicked', async () => {
      const store = useBookingStore();
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const addButton = wrapper.find('button');
      await addButton.trigger('click');

      expect(wrapper.text()).toContain('Add Vehicle');
      // v-text-field stubs render as inputs, so the dialog should expose three inputs
      expect(wrapper.findAll('input').length).toBeGreaterThanOrEqual(3);
    });
  });
});

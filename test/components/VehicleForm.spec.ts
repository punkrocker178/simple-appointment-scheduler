/**
 * VehicleForm Component Tests
 * Tests form initialization, input updates, store synchronization, and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import VehicleForm from '~/components/VehicleForm.vue';
import { useBookingStore } from '~/stores/bookingStore';
import {
  setupPinia,
  vuetifyStubs,
} from '../testUtils';

describe('VehicleForm Component', () => {
  let store: ReturnType<typeof useBookingStore>;

  beforeEach(() => {
    setupPinia();
    store = useBookingStore();
  });

  describe('rendering', () => {
    it('should render form card with heading', async () => {
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      expect(wrapper.find('div').text()).toContain('Vehicle Information');
    });

    it('should render three input fields', async () => {
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const inputs = wrapper.findAll('input');
      expect(inputs.length).toBe(3);
    });
  });

  describe('form initialization', () => {
    it('should initialize form with empty store values', async () => {
      store.setVehicle('', '', '');

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const inputs = wrapper.findAll('input');
      expect(inputs[0].element.value).toBe('');
      expect(inputs[1].element.value).toBe('');
      expect(inputs[2].element.value).toBe('');
    });

    it('should initialize form with existing store values', async () => {
      store.setVehicle('ABC123', 'Toyota', 'Camry');

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const inputs = wrapper.findAll('input');
      expect(inputs[0].element.value).toBe('ABC123');
      expect(inputs[1].element.value).toBe('Toyota');
      expect(inputs[2].element.value).toBe('Camry');
    });
  });

  describe('user input and store synchronization', () => {
    it('should update store when plate input changes', async () => {
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const plateInput = wrapper.findAll('input')[0];
      await plateInput.setValue('XYZ789');

      // Wait for watcher to trigger store update
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.vehicle.plate).toBe('XYZ789');
    });

    it('should update store when make input changes', async () => {
      store.setVehicle('ABC123', '', '');

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const makeInput = wrapper.findAll('input')[1];
      await makeInput.setValue('Honda');

      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.vehicle.make).toBe('Honda');
    });

    it('should update store when model input changes', async () => {
      store.setVehicle('ABC123', 'Honda', '');

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const modelInput = wrapper.findAll('input')[2];
      await modelInput.setValue('Accord');

      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.vehicle.model).toBe('Accord');
    });

    it('should call store.setVehicle with all three fields when any field changes', async () => {
      const spy = vi.spyOn(store, 'setVehicle');
      store.setVehicle('ABC123', 'Toyota', 'Camry');

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const plateInput = wrapper.findAll('input')[0];
      await plateInput.setValue('XYZ789');

      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should call setVehicle with new plate and existing make/model
      expect(spy).toHaveBeenCalledWith('XYZ789', 'Toyota', 'Camry');
      spy.mockRestore();
    });
  });

  describe('validation', () => {
    it('plate field should be required', async () => {
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const plateInput = wrapper.findAll('input')[0];
      expect(plateInput.element.required).toBe(true);
    });

    it('make field should be optional', async () => {
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const makeInput = wrapper.findAll('input')[1];
      expect(makeInput.element.required).toBeFalsy();
    });

    it('model field should be optional', async () => {
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const modelInput = wrapper.findAll('input')[2];
      expect(modelInput.element.required).toBeFalsy();
    });
  });

  describe('error case', () => {
    it('should handle rapid successive changes without losing data', async () => {
      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const plateInput = wrapper.findAll('input')[0];

      await plateInput.setValue('ABC');
      await wrapper.vm.$nextTick();
      await plateInput.setValue('ABC1');
      await wrapper.vm.$nextTick();
      await plateInput.setValue('ABC12');
      await wrapper.vm.$nextTick();
      await plateInput.setValue('ABC123');
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.vehicle.plate).toBe('ABC123');
    });

    it('should accept empty make and model fields', async () => {
      store.setVehicle('ABC123', 'Toyota', 'Camry');

      const wrapper = await mountSuspended(VehicleForm, {
        props: { store },
        global: { stubs: vuetifyStubs },
      });

      const makeInput = wrapper.findAll('input')[1];
      const modelInput = wrapper.findAll('input')[2];

      await makeInput.setValue('');
      await modelInput.setValue('');
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(store.vehicle.make).toBe('');
      expect(store.vehicle.model).toBe('');
    });
  });
});

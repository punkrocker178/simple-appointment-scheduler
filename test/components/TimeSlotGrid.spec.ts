/**
 * TimeSlotGrid Component Tests
 * Tests slot rendering, selection, time formatting, loading/empty states
 */

import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TimeSlotGrid from '~/components/TimeSlotGrid.vue';
import { createMockAvailabilitySlot, vuetifyStubs } from '../testUtils';

describe('TimeSlotGrid Component', () => {
  describe('rendering', () => {
    it('should render heading with available slots count', async () => {
      const slots = [createMockAvailabilitySlot(), createMockAvailabilitySlot()];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, durationMinutes: 30, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      expect(wrapper.text()).toContain('Available Time Slots');
    });

    it('should render slot cards for each available slot', async () => {
      const slots = [
        createMockAvailabilitySlot(),
        createMockAvailabilitySlot(),
        createMockAvailabilitySlot(),
      ];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, durationMinutes: 30, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const cards = wrapper.findAll('div').filter(el =>
        el.classes().includes('cursor-pointer'),
      );
      expect(cards.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('slot selection', () => {
    it('should select slot on click and emit selected event', async () => {
      const slots = [createMockAvailabilitySlot()];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, durationMinutes: 30, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const slotCard = wrapper.find('div.cursor-pointer');
      await slotCard.trigger('click');

      expect(wrapper.emitted('selected')).toBeTruthy();
      expect(wrapper.emitted('selected')?.[0]).toEqual([slots[0]]);
    });

    it('should emit selected event with correct slot object', async () => {
      const slot = createMockAvailabilitySlot({ secondsFromMidnight: 36000 });
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [slot], durationMinutes: 30, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const slotCard = wrapper.find('div.cursor-pointer');
      await slotCard.trigger('click');

      expect(wrapper.emitted('selected')?.[0]?.[0]).toEqual(slot);
    });
  });

  describe('time formatting', () => {
    it('should format seconds from midnight to HH:MM', async () => {
      const slot = createMockAvailabilitySlot({ secondsFromMidnight: 52200 }); // 14:30
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [slot], durationMinutes: 30, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const html = wrapper.html();
      expect(html).toContain('14:30');
    });

    it('should display both start and end times for each slot', async () => {
      const slot = createMockAvailabilitySlot({ secondsFromMidnight: 28800 }); // 08:00
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [slot], durationMinutes: 60, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const text = wrapper.text();
      expect(text).toContain('08:00');
      expect(text).toContain('09:00');
    });
  });

  describe('loading state', () => {
    it('should show progress spinner when isLoading is true', async () => {
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [createMockAvailabilitySlot()], durationMinutes: 30, isLoading: true },
        global: { stubs: vuetifyStubs },
      });

      const spinner = wrapper.find('div.spinner');
      expect(spinner.exists()).toBe(true);
    });

    it('should not render slot cards when isLoading is true', async () => {
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [createMockAvailabilitySlot()], durationMinutes: 30, isLoading: true },
        global: { stubs: vuetifyStubs },
      });

      const loaderDiv = wrapper.find('div.spinner');
      expect(loaderDiv.exists()).toBe(true);
    });
  });

  describe('empty state', () => {
    it('should show empty message when slots array is empty', async () => {
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [], durationMinutes: 30, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      expect(wrapper.text()).toContain('No slots available');
    });
  });

  describe('multiple slots', () => {
    it('should render multiple slots in grid layout', async () => {
      const slots = [
        createMockAvailabilitySlot(),
        createMockAvailabilitySlot(),
        createMockAvailabilitySlot(),
        createMockAvailabilitySlot(),
      ];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, durationMinutes: 30, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const html = wrapper.html();
      expect(html).toContain('grid');
      expect(html).toContain('grid-cols-2');
    });
  });
});

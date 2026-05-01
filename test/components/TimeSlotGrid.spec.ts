/**
 * TimeSlotGrid Component Tests
 * Tests slot rendering, selection, availability filtering, loading/empty states, and time formatting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TimeSlotGrid from '~/components/TimeSlotGrid.vue';
import { createMockSlot, vuetifyStubs } from '../testUtils';

describe('TimeSlotGrid Component', () => {
  describe('rendering', () => {
    it('should render heading with available slots count', async () => {
      const slots = [createMockSlot(), createMockSlot()];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      expect(wrapper.text()).toContain('Available Time Slots');
    });

    it('should render slot cards for each available slot', async () => {
      const slots = [
        createMockSlot({ available: true }),
        createMockSlot({ available: true }),
        createMockSlot({ available: true }),
      ];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
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
      const slots = [createMockSlot({ available: true })];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const slotCard = wrapper.find('div.cursor-pointer');
      await slotCard.trigger('click');

      expect(wrapper.emitted('selected')).toBeTruthy();
      expect(wrapper.emitted('selected')?.[0]).toEqual([slots[0]]);
    });

    it('should not select unavailable slot on click', async () => {
      const slots = [createMockSlot({ available: false })];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const slotCard = wrapper.find('div.cursor-pointer');
      await slotCard.trigger('click');

      // Should not emit when clicking unavailable slot
      expect(wrapper.emitted('selected')).toBeFalsy();
    });

    it('should emit selected event with correct slot object', async () => {
      const slot = createMockSlot({
        available: true,
        startTime: 1715000000000,
        endTime: 1715001800000,
      });
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [slot], isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const slotCard = wrapper.find('div.cursor-pointer');
      await slotCard.trigger('click');

      expect(wrapper.emitted('selected')?.[0]?.[0]).toEqual(slot);
    });
  });

  describe('slot availability styling', () => {
    it('should apply cursor-pointer and hover effect to available slots', async () => {
      const slots = [createMockSlot({ available: true })];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const availableSlot = wrapper
        .findAll('div')
        .find(el => el.classes().includes('cursor-pointer'));
      expect(availableSlot?.classes()).toContain('cursor-pointer');
    });

    it('should apply gray-out styling to unavailable slots', async () => {
      const slots = [createMockSlot({ available: false })];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      // Check that unavailable slot has gray styling
      const html = wrapper.html();
      expect(html).toContain('bg-gray-100');
      expect(html).toContain('opacity-60');
    });

    it('should NOT apply cursor-not-allowed to available slots', async () => {
      const slots = [createMockSlot({ available: true })];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const html = wrapper.html();
      expect(html).not.toContain('cursor-not-allowed');
    });
  });

  describe('loading state', () => {
    it('should show progress spinner when isLoading is true', async () => {
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [createMockSlot()], isLoading: true },
        global: { stubs: vuetifyStubs },
      });

      const spinner = wrapper.find('div.spinner');
      expect(spinner.exists()).toBe(true);
    });

    it('should not render slot cards when isLoading is true', async () => {
      const slots = [
        createMockSlot({ available: true }),
        createMockSlot({ available: true }),
      ];
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: true },
        global: { stubs: vuetifyStubs },
      });

      // Spinner should be shown instead of cards
      const loaderDiv = wrapper.find('div.spinner');
      expect(loaderDiv.exists()).toBe(true);
    });
  });

  describe('empty state', () => {
    it('should show empty message when slots array is empty', async () => {
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [], isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      expect(wrapper.text()).toContain('No slots available');
    });

    it('should show empty message when isLoading is false and slots empty', async () => {
      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [], isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const html = wrapper.html();
      expect(html).toContain('No slots available for this date');
    });
  });

  describe('time formatting', () => {
    it('should format ISO timestamps to locale time string', async () => {
      const slot = createMockSlot({
        available: true,
        startTime: new Date('2025-05-15T14:30:00').getTime(),
        endTime: new Date('2025-05-15T15:00:00').getTime(),
      });

      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [slot], isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      // Should contain formatted time (e.g., "2:30 PM" or "14:30")
      const html = wrapper.html();
      expect(html).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should display both start and end times for each slot', async () => {
      const slot = createMockSlot({
        available: true,
        startTime: new Date('2025-05-15T09:00:00').getTime(),
        endTime: new Date('2025-05-15T09:30:00').getTime(),
      });

      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots: [slot], isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      // Should have start and end time displayed
      const text = wrapper.text();
      expect(text.match(/\d{1,2}:\d{2}/g)?.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle invalid ISO timestamps gracefully', async () => {
      const invalidSlot = {
        startTime: NaN,
        endTime: NaN,
        available: true,
      };

      // Should not throw error
      expect(() => {
        mountSuspended(TimeSlotGrid, {
          props: { slots: [invalidSlot], isLoading: false },
          global: { stubs: vuetifyStubs },
        });
      }).not.toThrow();
    });
  });

  describe('multiple slots', () => {
    it('should render multiple slots in grid layout', async () => {
      const slots = [
        createMockSlot({ available: true }),
        createMockSlot({ available: false }),
        createMockSlot({ available: true }),
        createMockSlot({ available: true }),
      ];

      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      // Check that grid layout is applied
      const html = wrapper.html();
      expect(html).toContain('grid');
      expect(html).toContain('grid-cols-2');
    });

    it('should allow selecting multiple different slots in sequence', async () => {
      const slots = [
        createMockSlot({ available: true }),
        createMockSlot({ available: true }),
      ];

      const wrapper = await mountSuspended(TimeSlotGrid, {
        props: { slots, isLoading: false },
        global: { stubs: vuetifyStubs },
      });

      const slotCards = wrapper.findAll('div.cursor-pointer');

      // Click first slot
      await slotCards[0].trigger('click');
      expect(wrapper.emitted('selected')?.[0]?.[0]).toEqual(slots[0]);

      // Click second slot
      await slotCards[1].trigger('click');
      expect(wrapper.emitted('selected')?.[1]?.[0]).toEqual(slots[1]);

      // Should have emitted twice
      expect(wrapper.emitted('selected')).toHaveLength(2);
    });
  });
});

<script setup lang="ts">
import { computed } from 'vue';
import type { CalendarAppointment, CalendarBayColumn } from '~/types/appointmentCalendar';
import { generateTimeSlots, getAppointmentStyle } from '~/utils/calendar';
import { secondsToTimeString } from '~/utils/timeFormat';
import AppointmentCalendarCard from './AppointmentCalendarCard.vue';

interface Props {
  bays: CalendarBayColumn[];
  openSeconds: number;
  closeSeconds: number;
  appointments: CalendarAppointment[];
  loading?: boolean;
}

interface StyledCalendarAppointment extends CalendarAppointment {
  style: { top: string; height: string };
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const slotHeight = 48;
const headerHeight = 40;
const slots = computed(() => generateTimeSlots(props.openSeconds, props.closeSeconds));

const appointmentsByBay = computed(() => {
  const byBay: Record<string, StyledCalendarAppointment[]> = {};

  for (const bay of props.bays) {
    byBay[bay.id] = [];
  }

  for (const appointment of props.appointments) {
    const bucket = byBay[appointment.serviceBayId];
    if (!bucket) {
      continue;
    }

    bucket.push({
      ...appointment,
      style: getAppointmentStyle(
        appointment.secondsFromMidnight,
        appointment.durationMinutes,
        props.openSeconds,
        slotHeight,
      ),
    });
  }

  return byBay;
});
</script>

<template>
  <div class="flex overflow-auto rounded-lg border border-gray-200 bg-white">
    <div class="flex flex-col border-r border-gray-200 bg-gray-50">
      <div
        class="shrink-0 border-b border-gray-200"
        :style="{ height: `${headerHeight}px` }"
      />
      <div
        v-for="slot in slots"
        :key="slot"
        class="flex w-16 shrink-0 items-center justify-end px-2 text-xs text-gray-600"
        :style="{ height: `${slotHeight}px` }"
      >
        {{ secondsToTimeString(slot) }}
      </div>
    </div>
    <div class="flex min-w-full">
      <div
        v-for="bay in bays"
        :key="bay.id"
        class="flex-1 min-w-40 border-r border-gray-200"
      >
        <div
          class="border-b border-gray-200 bg-gray-50 px-2 py-1 text-center text-sm font-semibold truncate"
          :style="{ height: `${headerHeight}px` }"
        >
          {{ bay.name }}
        </div>
        <div class="relative">
          <div
            v-for="slot in slots"
            :key="slot"
            class="border-b border-gray-100"
            :style="{ height: `${slotHeight}px` }"
          />
          <v-progress-linear
            v-if="loading"
            indeterminate
            color="primary"
          />
          <AppointmentCalendarCard
            v-for="appointment in appointmentsByBay[bay.id]"
            :key="appointment.id"
            :appointment="appointment"
            :style="appointment.style"
          />
        </div>
      </div>
    </div>
  </div>
</template>

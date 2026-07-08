<script setup lang="ts">
import { computed } from 'vue';
import type { CalendarAppointment } from '~/types/appointmentCalendar';
import { generateTimeSlots, getAppointmentStyle, formatDayHeader } from '~/utils/calendar';
import { secondsToTimeString } from '~/utils/timeFormat';
import AppointmentCalendarCard from './AppointmentCalendarCard.vue';

interface Props {
  days: string[];
  openSeconds: number;
  closeSeconds: number;
  appointments: CalendarAppointment[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const slotHeight = 48;
const headerHeight = 40;
const slots = computed(() => generateTimeSlots(props.openSeconds, props.closeSeconds));

const appointmentsForDay = (day: string) =>
  props.appointments
    .filter(a => a.bookingDate === day)
    .map(appointment => ({
      ...appointment,
      style: getAppointmentStyle(
        appointment.secondsFromMidnight,
        appointment.durationMinutes,
        props.openSeconds,
        slotHeight,
      ),
    }));
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
        v-for="day in days"
        :key="day"
        class="flex-1 min-w-40 border-r border-gray-200"
      >
        <div
          class="border-b border-gray-200 bg-gray-50 px-2 py-1 text-center text-sm font-semibold"
          :style="{ height: `${headerHeight}px` }"
        >
          {{ formatDayHeader(day) }}
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
            v-for="appointment in appointmentsForDay(day)"
            :key="appointment.id"
            :appointment="appointment"
            :style="appointment.style"
          />
        </div>
      </div>
    </div>
  </div>
</template>

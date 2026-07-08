<script setup lang="ts">
import { computed } from 'vue';
import type { CalendarAppointment } from '~/types/appointmentCalendar';
import { AppointmentStatus } from '~/types/api';
import { appointmentStatusColor, formatAppointmentStatus } from '~/utils/appointmentStatus';

interface Props {
  appointment: CalendarAppointment;
  style: { top: string; height: string };
}

const props = defineProps<Props>();

const appointment = computed(() => props.appointment);

const cardStyle = computed(() => ({
  top: props.style.top,
  height: props.style.height,
}));

const isCancelled = computed(
  () => appointment.value.status === AppointmentStatus.Cancelled,
);

const statusColor = computed(() => appointmentStatusColor(appointment.value.status));

const statusLabel = computed(() => formatAppointmentStatus(appointment.value.status));
</script>

<template>
  <div
    class="absolute left-1 right-1 overflow-hidden rounded border border-gray-200 bg-white p-2 text-xs shadow-sm"
    :class="{ 'opacity-50 grayscale': isCancelled }"
    :style="cardStyle"
  >
    <div class="font-semibold text-gray-900">
      {{ appointment.time }}
    </div>
    <div class="text-gray-700 truncate">
      {{ appointment.customer }}
    </div>
    <div class="text-gray-500 truncate">
      {{ appointment.vehicle }}
    </div>
    <div class="text-gray-500 truncate">
      {{ appointment.service }} | {{ appointment.technician }}
    </div>
    <v-chip
      :color="statusColor"
      size="x-small"
      variant="tonal"
      class="mt-1"
    >
      {{ statusLabel }}
    </v-chip>
  </div>
</template>

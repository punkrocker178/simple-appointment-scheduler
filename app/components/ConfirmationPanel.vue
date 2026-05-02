<template>
  <v-card class="p-6 rounded-xl">
    <div class="text-lg font-semibold text-gray-900 mb-4">Confirm Appointment</div>

    <div class="space-y-2">
      <div><span class="font-semibold">Service:</span> {{ serviceName }}</div>
      <div><span class="font-semibold">Date:</span> {{ date }}</div>
      <div><span class="font-semibold">Time:</span> {{ startTime }} - {{ endTime }}</div>
      <div><span class="font-semibold">Vehicle:</span> {{ vehicleDisplay }}</div>
      <div><span class="font-semibold">Customer:</span> {{ customerDisplay }}</div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Slot, Service } from '#server/utils/types';

interface Props {
  service?: Service | null
  timeSlot?: Slot | null
  vehicle?: { plate: string; make?: string; model?: string } | null
  customer?: { name: string; email: string } | null
}

const props = withDefaults(defineProps<Props>(), {
  service: null,
  timeSlot: null,
  vehicle: null,
  customer: null,
});

const serviceName = computed(() => props.service?.name ?? '-');
const date = computed(() => props.timeSlot ? new Date(props.timeSlot.startTime).toLocaleDateString() : '-');
const startTime = computed(() => props.timeSlot ? new Date(props.timeSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');
const endTime = computed(() => props.timeSlot ? new Date(props.timeSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');
const vehicleDisplay = computed(() => props.vehicle ? `${props.vehicle.plate}${props.vehicle.make ? ` — ${props.vehicle.make} ${props.vehicle.model ?? ''}` : ''}` : '-');
const customerDisplay = computed(() => props.customer ? `${props.customer.name} — ${props.customer.email}` : '-');
</script>

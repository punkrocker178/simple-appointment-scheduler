<template>
  <v-card class="p-6">
    <div class="text-lg font-semibold text-gray-900 mb-4">Confirm Appointment</div>

    <div class="space-y-2">
      <div><span class="font-semibold">Service:</span> {{ serviceName }}</div>
      <div><span class="font-semibold">Date:</span> {{ date }}</div>
      <div><span class="font-semibold">Time:</span> {{ startTime }} - {{ endTime }}</div>
      <div><span class="font-semibold">Vehicle:</span> {{ vehicle }}</div>
      <div><span class="font-semibold">Customer:</span> {{ customer }}</div>
    </div>

    <div class="flex gap-3 pt-6">
      <v-btn color="primary" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" @click="confirm">Book Appointment</v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Slot, Service } from '#server/utils/types';

interface Props {
  service?: Service | null
  slot?: Slot | null
  vehicle?: { plate: string; make?: string; model?: string } | null
  customer?: { name: string; email: string } | null
}

const props = withDefaults(defineProps<Props>(), {
  service: null,
  slot: null,
  vehicle: null,
  customer: null,
});

const emit = defineEmits<{
  (e: 'confirm'): void
}>();

const serviceName = computed(() => props.service?.name ?? '-');
const date = computed(() => props.slot ? new Date(props.slot.startTime).toLocaleDateString() : '-');
const startTime = computed(() => props.slot ? new Date(props.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');
const endTime = computed(() => props.slot ? new Date(props.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');
const vehicle = computed(() => props.vehicle ? `${props.vehicle.plate}${props.vehicle.make ? ` — ${props.vehicle.make} ${props.vehicle.model ?? ''}` : ''}` : '-');
const customer = computed(() => props.customer ? `${props.customer.name} — ${props.customer.email}` : '-');

function confirm() {
  // @ts-ignore
  emit('confirm');
}
</script>

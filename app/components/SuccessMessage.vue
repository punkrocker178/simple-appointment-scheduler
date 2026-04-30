<template>
  <v-card class="p-6 text-center">
    <div class="text-2xl font-semibold text-green-700 mb-4">Booking Confirmed</div>
    <div class="mb-4">Reference: <span class="font-mono text-sm">{{ bookingReference }}</span></div>

    <div v-if="appointment" class="text-left max-w-lg mx-auto">
      <div class="mb-2"><strong>Service:</strong> {{ appointment.serviceId }}</div>
      <div class="mb-2"><strong>Date:</strong> {{ new Date(appointment.startTime).toLocaleDateString() }}</div>
      <div class="mb-2"><strong>Time:</strong> {{ new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} - {{ new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</div>
      <div class="mb-2"><strong>Vehicle:</strong> {{ appointment.vehiclePlate }} {{ appointment.vehicleMake ? `— ${appointment.vehicleMake} ${appointment.vehicleModel ?? ''}` : '' }}</div>
      <div class="mb-2"><strong>Customer:</strong> {{ appointment.customerName }} — {{ appointment.customerEmail }}</div>
    </div>

    <div class="pt-6">
      <v-btn color="primary" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" @click="$emit('done')">Done</v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Appointment } from '#server/utils/types';

const props = withDefaults(defineProps<{ bookingReference?: string | null; appointment?: Appointment | null }>(), {
  bookingReference: null,
  appointment: null,
});
</script>

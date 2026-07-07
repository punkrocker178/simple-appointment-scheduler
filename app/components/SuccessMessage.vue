<template>
  <v-card class="p-6 text-center rounded-xl">
    <div class="text-2xl font-semibold text-green-700 mb-4">Booking Confirmed</div>
    <div class="mb-4">Reference: <span class="font-mono text-sm">{{ appointment?.id ?? bookingReference }}</span></div>

    <div v-if="appointment" class="text-left max-w-lg mx-auto">
      <div class="mb-2"><strong>Service:</strong> {{ service?.name ?? 'Scheduled Service' }}</div>
      <div class="mb-2"><strong>Date:</strong> {{ date }}</div>
      <div class="mb-2"><strong>Time:</strong> {{ startTime }} - {{ endTime }}</div>
      <div class="mb-2"><strong>Vehicle:</strong> {{ vehicleDisplay }}</div>
      <div class="mb-2"><strong>Customer:</strong> {{ customerDisplay }}</div>
    </div>

    <div class="pt-6">
      <v-btn color="primary" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" @click="$emit('new-booking')">Done</v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AppointmentResponse, BookingVehicle, ServiceTypeOption } from '~/types/api/booking';
import type { Customer } from '~/types/api';
import { bookingDateToLocalDate, formatBookingDate, formatBookingTime, slotEndSeconds } from '~/utils/bookingTime';

defineEmits<{
  'new-booking': []
}>();

const props = withDefaults(defineProps<{
  bookingReference?: string | null;
  appointment?: AppointmentResponse | null;
  service?: ServiceTypeOption | null;
  vehicle?: BookingVehicle | null;
  customer?: Customer | null;
}>(), {
  bookingReference: null,
  appointment: null,
  service: null,
  vehicle: null,
  customer: null,
});

const appointmentDateTime = computed((): Date | null => {
  if (!props.appointment)
    return null;
  return bookingDateToLocalDate(
    props.appointment.bookingDate,
    props.appointment.secondsFromMidnight,
  );
});

const date = computed(() =>
  appointmentDateTime.value ? formatBookingDate(appointmentDateTime.value) : '-',
);

const startTime = computed(() =>
  appointmentDateTime.value ? formatBookingTime(appointmentDateTime.value) : '-',
);

const endTime = computed(() => {
  if (!props.appointment)
    return '-';
  const endSeconds = slotEndSeconds(
    props.appointment.secondsFromMidnight,
    props.appointment.durationMinutes,
  );
  const endDate = bookingDateToLocalDate(props.appointment.bookingDate, endSeconds);
  return formatBookingTime(endDate);
});

const vehicleDisplay = computed(() =>
  props.vehicle ? `${props.vehicle.make} ${props.vehicle.model} (${props.vehicle.year})` : 'Your saved vehicle',
);

const customerDisplay = computed(() =>
  props.customer ? `${props.customer.firstName} ${props.customer.lastName} — ${props.customer.email}` : 'Your profile',
);
</script>

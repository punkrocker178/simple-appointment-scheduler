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
import { computed } from 'vue';
import type { AvailabilitySlotDto, ServiceTypeOption, BookingVehicle } from '~/types/api/booking';
import type { Customer } from '~/types/api';
import { bookingDateToLocalDate, formatBookingDate, formatBookingTime, slotEndSeconds } from '~/utils/bookingTime';

interface Props {
  service?: ServiceTypeOption | null
  timeSlot?: AvailabilitySlotDto | null
  bookingDate?: string | null
  vehicle?: BookingVehicle | null
  customer?: Customer | null
}

const props = withDefaults(defineProps<Props>(), {
  service: null,
  timeSlot: null,
  bookingDate: null,
  vehicle: null,
  customer: null,
});

const serviceName = computed(() => props.service?.name ?? '-');

const bookingDateTime = computed((): Date | null => {
  if (!props.bookingDate || !props.timeSlot)
    return null;
  return bookingDateToLocalDate(props.bookingDate, props.timeSlot.secondsFromMidnight);
});

const date = computed(() =>
  bookingDateTime.value ? formatBookingDate(bookingDateTime.value) : '-',
);

const startTime = computed(() =>
  bookingDateTime.value ? formatBookingTime(bookingDateTime.value) : '-',
);

const endTime = computed(() => {
  if (!props.timeSlot || !props.service)
    return '-';
  const endSeconds = slotEndSeconds(
    props.timeSlot.secondsFromMidnight,
    props.service.durationMinutes,
  );
  const endDate = props.bookingDate
    ? bookingDateToLocalDate(props.bookingDate, endSeconds)
    : null;
  return endDate ? formatBookingTime(endDate) : '-';
});

const vehicleDisplay = computed(() =>
  props.vehicle ? `${props.vehicle.make} ${props.vehicle.model} (${props.vehicle.year})` : '-',
);

const customerDisplay = computed(() =>
  props.customer ? `${props.customer.firstName} ${props.customer.lastName} — ${props.customer.email}` : '-',
);
</script>

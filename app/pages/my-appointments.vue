<script setup lang="ts">
import { useBookingApi } from '~/composables/useBookingApi';
import { toApiError } from '~/utils/apiErrors';
import {
  appointmentStatusColor,
  formatAppointmentStatus,
} from '~/utils/appointmentStatus';
import { toMyAppointmentDisplays } from '~/utils/myAppointments';
import type { MyAppointmentDisplay } from '~/utils/myAppointments';

definePageMeta({ middleware: 'auth' });

const api = useBookingApi();

const { data, pending, error, refresh } = await useAsyncData(
  'my-appointments',
  async () => {
    const [appointments, vehicles, serviceTypesResponse] = await Promise.all([
      api.fetchMyAppointments(),
      api.fetchMyVehicles(),
      api.fetchServiceTypes(),
    ]);
    return toMyAppointmentDisplays(
      appointments,
      vehicles,
      serviceTypesResponse.serviceTypes,
    );
  },
);

const appointments = computed((): MyAppointmentDisplay[] => data.value ?? []);

const errorMessage = computed((): string | null => {
  if (!error.value) {
    return null;
  }
  return toApiError(error.value).message;
});
</script>

<template>
  <div
    class="max-w-2xl mx-auto p-6"
    data-testid="my-appointments-page"
  >
    <div class="flex items-center justify-between gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        My Appointments
      </h1>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        data-testid="my-appointments-book-cta"
        to="/booking-start"
      >
        Book
      </v-btn>
    </div>

    <div
      v-if="pending"
      class="flex justify-center py-16"
      data-testid="my-appointments-loading"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>

    <v-alert
      v-else-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-6"
      data-testid="my-appointments-error"
    >
      <div class="flex items-center justify-between gap-4">
        <span>{{ errorMessage }}</span>
        <v-btn
          size="small"
          variant="text"
          data-testid="my-appointments-retry"
          @click="refresh()"
        >
          Retry
        </v-btn>
      </div>
    </v-alert>

    <div
      v-else-if="appointments.length === 0"
      class="text-center py-16"
      data-testid="my-appointments-empty"
    >
      <p class="text-gray-600 mb-6">
        You have no appointments yet.
      </p>
      <v-btn
        color="primary"
        variant="flat"
        to="/booking-start"
        data-testid="my-appointments-empty-cta"
      >
        Book an appointment
      </v-btn>
    </div>

    <ul
      v-else
      class="space-y-4 list-none p-0 m-0"
      data-testid="my-appointments-list"
    >
      <li
        v-for="appointment in appointments"
        :key="appointment.id"
      >
        <v-card
          class="p-4 rounded-xl"
          :data-testid="`my-appointment-card-${appointment.id}`"
        >
          <div class="flex items-start justify-between gap-4 mb-3">
            <div>
              <div class="text-lg font-semibold text-gray-900">
                {{ appointment.serviceLabel }}
              </div>
              <div class="text-sm text-gray-600 mt-1">
                {{ appointment.dateLabel }}
              </div>
              <div class="text-sm text-gray-600">
                {{ appointment.startTimeLabel }} – {{ appointment.endTimeLabel }}
                · {{ appointment.durationMinutes }} min
              </div>
            </div>
            <v-chip
              size="small"
              :color="appointmentStatusColor(appointment.status)"
              variant="tonal"
              :data-testid="`my-appointment-status-${appointment.id}`"
            >
              {{ formatAppointmentStatus(appointment.status) }}
            </v-chip>
          </div>
          <div class="text-sm text-gray-700">
            <strong>Vehicle:</strong> {{ appointment.vehicleLabel }}
          </div>
        </v-card>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  AppointmentStatus,
  type AppointmentResponse,
  type Dealership,
} from '~/types/api';
import type {
  CalendarAppointment,
  CalendarBayColumn,
} from '~/types/appointmentCalendar';
import { addDays, startOfWeek, toDateString } from '~/utils/calendar';
import {
  appointmentStatusColor,
  formatAppointmentStatus,
} from '~/utils/appointmentStatus';
import { secondsToTimeString } from '~/utils/timeFormat';
import CancelAppointmentDialog from '~/components/admin/CancelAppointmentDialog.vue';
import AppointmentCalendarDayView from '~/components/admin/appointments/AppointmentCalendarDayView.vue';
import AppointmentCalendarWeekView from '~/components/admin/appointments/AppointmentCalendarWeekView.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const route = useRoute();
const dealershipId = computed(() => route.params.id as string);

const {
  fetchDealerships,
  fetchDealershipAppointments,
  fetchDealershipAppointmentsRange,
  fetchServiceTypes,
  fetchTechnicians,
  fetchServiceBays,
  fetchCustomers,
  fetchVehicles,
  updateAppointmentStatus,
  cancelAppointment,
} = useAdminApi();

const { showError, showSuccess } = useAppNotification();

const formatTimeRange = (
  secondsFromMidnight: number,
  durationMinutes: number,
): string => {
  const endSeconds = secondsFromMidnight + durationMinutes * 60;
  return `${secondsToTimeString(secondsFromMidnight)} – ${secondsToTimeString(endSeconds)}`;
};

const dealerships = ref<Dealership[]>([]);
const selectedDate = ref(toDateString(new Date()));
const selectedView = ref<'grid' | 'day' | 'week'>('grid');
const items = ref<CalendarAppointment[]>([]);
const bayColumns = ref<CalendarBayColumn[]>([]);
const loading = ref(false);
const actionLoadingId = ref<string | null>(null);
const pageError = ref<string | null>(null);
const cancelDialogOpen = ref(false);
const cancelTargetId = ref<string | null>(null);

const dealership = computed(() =>
  dealerships.value.find((d) => d.id === dealershipId.value),
);
const dealershipName = computed(() => dealership.value?.name ?? 'Dealership');

const weekStart = computed(() =>
  toDateString(startOfWeek(new Date(selectedDate.value))),
);

const weekDays = computed<string[]>(() => {
  const start = new Date(weekStart.value);
  return Array.from({ length: 7 }, (_, i) => toDateString(addDays(start, i)));
});

const shiftDate = (direction: number): void => {
  const base = new Date(selectedDate.value);
  const days = selectedView.value === 'week' ? direction * 7 : direction;
  selectedDate.value = toDateString(addDays(base, days));
};

const goToToday = (): void => {
  selectedDate.value = toDateString(new Date());
};

const headers = [
  { title: 'Time', key: 'time' },
  { title: 'Customer', key: 'customer' },
  { title: 'Vehicle', key: 'vehicle' },
  { title: 'Service', key: 'service' },
  { title: 'Technician', key: 'technician' },
  { title: 'Bay', key: 'bay' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const buildRows = (
  appointments: AppointmentResponse[],
  customerMap: Map<string, string>,
  vehicleMap: Map<string, string>,
  serviceTypeMap: Map<string, string>,
  technicianMap: Map<string, string>,
  bayMap: Map<string, string>,
): CalendarAppointment[] =>
  appointments.map((appointment) => ({
    id: appointment.id,
    bookingDate: appointment.bookingDate,
    secondsFromMidnight: appointment.secondsFromMidnight,
    durationMinutes: appointment.durationMinutes,
    time: formatTimeRange(
      appointment.secondsFromMidnight,
      appointment.durationMinutes,
    ),
    customer: customerMap.get(appointment.customerId) ?? appointment.customerId,
    vehicle: vehicleMap.get(appointment.vehicleId) ?? appointment.vehicleId,
    service:
      serviceTypeMap.get(appointment.serviceTypeId) ??
      appointment.serviceTypeId,
    technician:
      technicianMap.get(appointment.technicianId) ?? appointment.technicianId,
    serviceBayId: appointment.serviceBayId,
    bay: bayMap.get(appointment.serviceBayId) ?? appointment.serviceBayId,
    status: appointment.status,
  }));

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    const appointments =
      selectedView.value === 'week'
        ? await fetchDealershipAppointmentsRange(
            dealershipId.value,
            weekStart.value,
            toDateString(addDays(new Date(weekStart.value), 6)),
          )
        : await fetchDealershipAppointments(
            dealershipId.value,
            selectedDate.value,
          );

    const [fetchedDealerships, serviceTypes, technicians, bays, customers] =
      await Promise.all([
        fetchDealerships(),
        fetchServiceTypes(dealershipId.value),
        fetchTechnicians(dealershipId.value),
        fetchServiceBays(dealershipId.value),
        fetchCustomers(),
      ]);

    dealerships.value = fetchedDealerships;

    bayColumns.value = bays
      .map((b) => ({ id: b.id, name: b.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const uniqueCustomerIds = [
      ...new Set(appointments.map((a) => a.customerId)),
    ];
    const vehicleLists = await Promise.all(
      uniqueCustomerIds.map((id) => fetchVehicles(id)),
    );
    const vehicles = vehicleLists.flat();

    const customerMap = new Map(
      customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`]),
    );
    const vehicleMap = new Map(
      vehicles.map((v) => [v.id, `${v.year} ${v.make} ${v.model}`]),
    );
    const serviceTypeMap = new Map(serviceTypes.map((s) => [s.id, s.name]));
    const technicianMap = new Map(
      technicians.map((t) => [t.id, `${t.firstName} ${t.lastName}`]),
    );
    const bayMap = new Map(bays.map((b) => [b.id, b.name]));

    items.value = buildRows(
      appointments,
      customerMap,
      vehicleMap,
      serviceTypeMap,
      technicianMap,
      bayMap,
    );
  } catch (err) {
    pageError.value =
      err instanceof Error ? err.message : 'Failed to load appointments.';
  } finally {
    loading.value = false;
  }
};

const runAction = async (
  id: string,
  action: () => Promise<void>,
): Promise<void> => {
  actionLoadingId.value = id;
  try {
    await action();
    await load();
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Action failed.');
  } finally {
    actionLoadingId.value = null;
  }
};

const startAppointment = (id: string): void => {
  void runAction(id, async () => {
    await updateAppointmentStatus(id, { status: AppointmentStatus.InProgress });
    showSuccess('Appointment started.');
  });
};

const completeAppointment = (id: string): void => {
  void runAction(id, async () => {
    await updateAppointmentStatus(id, { status: AppointmentStatus.Completed });
    showSuccess('Appointment completed.');
  });
};

const openCancelDialog = (id: string): void => {
  cancelTargetId.value = id;
  cancelDialogOpen.value = true;
};

const closeCancelDialog = (): void => {
  cancelDialogOpen.value = false;
  cancelTargetId.value = null;
};

const confirmCancel = (reason: string): void => {
  if (!cancelTargetId.value) {
    return;
  }

  const id = cancelTargetId.value;
  void runAction(id, async () => {
    await cancelAppointment(id, { reason });
    showSuccess('Appointment cancelled.');
    closeCancelDialog();
  });
};

const canStart = (status: AppointmentStatus): boolean =>
  status === AppointmentStatus.Scheduled;

const canComplete = (status: AppointmentStatus): boolean =>
  status === AppointmentStatus.InProgress;

const canCancel = (status: AppointmentStatus): boolean =>
  status === AppointmentStatus.Scheduled ||
  status === AppointmentStatus.InProgress;

watch([selectedDate, selectedView], () => {
  load();
});

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <v-breadcrumbs
      :items="[
        { title: 'Dealerships', to: '/admin/dealerships' },
        { title: dealershipName, disabled: true },
        { title: 'Appointments', disabled: true },
      ]"
      class="px-0 mb-4" />

    <div class="flex flex-col mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Appointments</h1>
      <div class="flex justify-between">
        <p class="text-gray-600">
          {{ dealershipName }}
        </p>
        <div class="flex-col md:flex-row flex items-center gap-4">
          <div class="flex items-center gap-2">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click="shiftDate(-1)" />
            <v-btn variant="text" @click="goToToday"> Today </v-btn>
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              @click="shiftDate(1)" />
          </div>
          <v-text-field
            v-model="selectedDate"
            type="date"
            label="Date"
            density="compact"
            hide-details
            class="max-w-48" />
          <v-btn-toggle
            v-model="selectedView"
            density="compact"
            variant="outlined"
            divided>
            <v-btn value="grid"> Grid </v-btn>
            <v-btn value="day"> Day </v-btn>
            <v-btn value="week"> Week </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </div>

    <v-alert v-if="pageError" type="error" variant="tonal" class="mb-4">
      {{ pageError }}
    </v-alert>

    <AdminDataTable
      v-if="selectedView === 'grid'"
      :items="items"
      :headers="headers"
      :loading="loading">
      <template #empty> No appointments scheduled for this date. </template>
      <template #item.status="{ value }">
        <v-chip
          :color="appointmentStatusColor(value)"
          size="small"
          variant="tonal">
          {{ formatAppointmentStatus(value) }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <div class="flex gap-2 py-1">
          <v-btn
            v-if="canStart(item.status)"
            size="small"
            variant="tonal"
            color="primary"
            :loading="actionLoadingId === item.id"
            :disabled="actionLoadingId !== null && actionLoadingId !== item.id"
            @click="startAppointment(item.id)">
            Start
          </v-btn>
          <v-btn
            v-if="canComplete(item.status)"
            size="small"
            variant="tonal"
            color="success"
            :loading="actionLoadingId === item.id"
            :disabled="actionLoadingId !== null && actionLoadingId !== item.id"
            @click="completeAppointment(item.id)">
            Complete
          </v-btn>
          <v-btn
            v-if="canCancel(item.status)"
            size="small"
            variant="tonal"
            color="error"
            :loading="actionLoadingId === item.id"
            :disabled="actionLoadingId !== null && actionLoadingId !== item.id"
            @click="openCancelDialog(item.id)">
            Cancel
          </v-btn>
        </div>
      </template>
    </AdminDataTable>

    <AppointmentCalendarDayView
      v-else-if="selectedView === 'day'"
      :bays="bayColumns"
      :open-seconds="dealership?.openSecondsFromMidnight ?? 28_800"
      :close-seconds="dealership?.closeSecondsFromMidnight ?? 61_200"
      :appointments="items"
      :loading="loading" />

    <AppointmentCalendarWeekView
      v-else
      :days="weekDays"
      :open-seconds="dealership?.openSecondsFromMidnight ?? 28_800"
      :close-seconds="dealership?.closeSecondsFromMidnight ?? 61_200"
      :appointments="items"
      :loading="loading" />

    <CancelAppointmentDialog
      v-model:open="cancelDialogOpen"
      :loading="actionLoadingId !== null"
      @confirm="confirmCancel"
      @cancel="closeCancelDialog" />
  </div>
</template>

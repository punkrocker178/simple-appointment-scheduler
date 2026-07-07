<script setup lang="ts">
import type { AppointmentResponse, AppointmentStatus } from '~/types/api';
import { appointmentStatusColor, formatAppointmentStatus } from '~/utils/appointmentStatus';
import { secondsToTimeString } from '~/utils/timeFormat';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

interface AppointmentRow {
  id: string;
  time: string;
  customer: string;
  vehicle: string;
  service: string;
  technician: string;
  bay: string;
  status: AppointmentStatus;
}

const route = useRoute();
const dealershipId = computed(() => route.params.id as string);

const {
  fetchDealerships,
  fetchDealershipAppointments,
  fetchServiceTypes,
  fetchTechnicians,
  fetchServiceBays,
  fetchCustomers,
  fetchVehicles,
} = useAdminApi();

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeRange = (secondsFromMidnight: number, durationMinutes: number): string => {
  const endSeconds = secondsFromMidnight + durationMinutes * 60;
  return `${secondsToTimeString(secondsFromMidnight)} – ${secondsToTimeString(endSeconds)}`;
};

const dealershipName = ref('');
const selectedDate = ref(toDateString(new Date()));
const items = ref<AppointmentRow[]>([]);
const loading = ref(false);
const pageError = ref<string | null>(null);

const headers = [
  { title: 'Time', key: 'time' },
  { title: 'Customer', key: 'customer' },
  { title: 'Vehicle', key: 'vehicle' },
  { title: 'Service', key: 'service' },
  { title: 'Technician', key: 'technician' },
  { title: 'Bay', key: 'bay' },
  { title: 'Status', key: 'status' },
];

const buildRows = (
  appointments: AppointmentResponse[],
  customerMap: Map<string, string>,
  vehicleMap: Map<string, string>,
  serviceTypeMap: Map<string, string>,
  technicianMap: Map<string, string>,
  bayMap: Map<string, string>,
): AppointmentRow[] =>
  appointments.map(appointment => ({
    id: appointment.id,
    time: formatTimeRange(appointment.secondsFromMidnight, appointment.durationMinutes),
    customer: customerMap.get(appointment.customerId) ?? appointment.customerId,
    vehicle: vehicleMap.get(appointment.vehicleId) ?? appointment.vehicleId,
    service: serviceTypeMap.get(appointment.serviceTypeId) ?? appointment.serviceTypeId,
    technician: technicianMap.get(appointment.technicianId) ?? appointment.technicianId,
    bay: bayMap.get(appointment.serviceBayId) ?? appointment.serviceBayId,
    status: appointment.status,
  }));

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    const [dealerships, appointments, serviceTypes, technicians, bays, customers] = await Promise.all([
      fetchDealerships(),
      fetchDealershipAppointments(dealershipId.value, selectedDate.value),
      fetchServiceTypes(dealershipId.value),
      fetchTechnicians(dealershipId.value),
      fetchServiceBays(dealershipId.value),
      fetchCustomers(),
    ]);

    dealershipName.value = dealerships.find(d => d.id === dealershipId.value)?.name ?? 'Dealership';

    const uniqueCustomerIds = [...new Set(appointments.map(a => a.customerId))];
    const vehicleLists = await Promise.all(uniqueCustomerIds.map(id => fetchVehicles(id)));
    const vehicles = vehicleLists.flat();

    const customerMap = new Map(
      customers.map(c => [c.id, `${c.firstName} ${c.lastName}`]),
    );
    const vehicleMap = new Map(
      vehicles.map(v => [v.id, `${v.year} ${v.make} ${v.model}`]),
    );
    const serviceTypeMap = new Map(serviceTypes.map(s => [s.id, s.name]));
    const technicianMap = new Map(
      technicians.map(t => [t.id, `${t.firstName} ${t.lastName}`]),
    );
    const bayMap = new Map(bays.map(b => [b.id, b.name]));

    items.value = buildRows(
      appointments,
      customerMap,
      vehicleMap,
      serviceTypeMap,
      technicianMap,
      bayMap,
    );
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load appointments.';
  }
  finally {
    loading.value = false;
  }
};

watch(selectedDate, () => {
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
      class="px-0 mb-4"
    />

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Appointments
        </h1>
        <p class="text-gray-600 mt-1">
          {{ dealershipName }}
        </p>
      </div>
      <v-text-field
        v-model="selectedDate"
        type="date"
        label="Date"
        density="compact"
        hide-details
        class="max-w-48"
      />
    </div>

    <v-alert
      v-if="pageError"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ pageError }}
    </v-alert>

    <AdminDataTable
      :items="items"
      :headers="headers"
      :loading="loading"
    >
      <template #empty>
        No appointments scheduled for this date.
      </template>
      <template #item.status="{ value }">
        <v-chip
          :color="appointmentStatusColor(value)"
          size="small"
          variant="tonal"
        >
          {{ formatAppointmentStatus(value) }}
        </v-chip>
      </template>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import type { CreateVehicleRequest, Customer, UpdateVehicleRequest, Vehicle } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const route = useRoute();
const customerId = computed(() => route.params.id as string);

const { fetchCustomers, fetchVehicles, createVehicle, updateVehicle, deleteVehicle } = useAdminApi();

const customerName = ref('');
const items = ref<Vehicle[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const itemToDelete = ref<Vehicle | null>(null);

const currentYear = new Date().getFullYear();

const defaultForm = (): CreateVehicleRequest => ({
  make: '',
  model: '',
  year: currentYear,
});

const form = ref<CreateVehicleRequest>(defaultForm());

const headers = [
  { title: 'Make', key: 'make' },
  { title: 'Model', key: 'model' },
  { title: 'Year', key: 'year' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const isEditing = computed(() => editingId.value !== null);

const vehicleLabel = (v: Vehicle): string => `${v.year} ${v.make} ${v.model}`;

const rules = {
  required: (value: string) => !!value?.trim() || 'Required',
  year: (value: number) => (value >= 1900 && value <= currentYear + 1) || `Year must be 1900–${currentYear + 1}`,
};

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    const [customers, vehicles] = await Promise.all([
      fetchCustomers(),
      fetchVehicles(customerId.value),
    ]);
    const customer = customers.find((c: Customer) => c.id === customerId.value);
    customerName.value = customer ? `${customer.firstName} ${customer.lastName}` : 'Customer';
    items.value = vehicles;
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load vehicles.';
  }
  finally {
    loading.value = false;
  }
};

const openCreate = (): void => {
  editingId.value = null;
  form.value = defaultForm();
  formError.value = null;
  dialogOpen.value = true;
};

const openEdit = (item: Vehicle): void => {
  editingId.value = item.id;
  form.value = {
    make: item.make,
    model: item.model,
    year: item.year,
  };
  formError.value = null;
  dialogOpen.value = true;
};

const handleSave = async (): Promise<void> => {
  if (!form.value.make.trim() || !form.value.model.trim()) {
    formError.value = 'Make and model are required.';
    return;
  }
  if (!rules.year(form.value.year)) {
    formError.value = `Year must be between 1900 and ${currentYear + 1}.`;
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    const body = {
      make: form.value.make.trim(),
      model: form.value.model.trim(),
      year: form.value.year,
    };
    if (isEditing.value && editingId.value) {
      await updateVehicle(customerId.value, editingId.value, body as UpdateVehicleRequest);
    }
    else {
      await createVehicle(customerId.value, body);
    }
    dialogOpen.value = false;
    await load();
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to save vehicle.';
  }
  finally {
    saving.value = false;
  }
};

const openDelete = (item: Vehicle): void => {
  itemToDelete.value = item;
  deleteDialogOpen.value = true;
};

const handleDelete = async (): Promise<void> => {
  if (!itemToDelete.value) {
    return;
  }
  deleting.value = true;
  pageError.value = null;
  try {
    await deleteVehicle(customerId.value, itemToDelete.value.id);
    deleteDialogOpen.value = false;
    itemToDelete.value = null;
    await load();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to delete vehicle.';
  }
  finally {
    deleting.value = false;
  }
};

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <v-breadcrumbs
      :items="[
        { title: 'Customers', to: '/admin/customers' },
        { title: customerName, disabled: true },
        { title: 'Vehicles', disabled: true },
      ]"
      class="px-0 mb-4"
    />

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Vehicles
        </h1>
        <p class="text-gray-600 mt-1">
          {{ customerName }}
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Add vehicle
      </v-btn>
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
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          size="small"
          @click="openEdit(item)"
        />
        <v-btn
          icon="mdi-delete"
          variant="text"
          color="error"
          size="small"
          @click="openDelete(item)"
        />
      </template>
    </AdminDataTable>

    <EntityFormDialog
      v-model:open="dialogOpen"
      :title="isEditing ? 'Edit vehicle' : 'Add vehicle'"
      :loading="saving"
      :error="formError"
      @submit="handleSave"
    >
      <div class="space-y-4">
        <v-text-field
          v-model="form.make"
          label="Make"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.model"
          label="Model"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model.number="form.year"
          label="Year"
          type="number"
          :rules="[rules.year]"
        />
      </div>
    </EntityFormDialog>

    <ConfirmDeleteDialog
      v-model:open="deleteDialogOpen"
      :entity-name="itemToDelete ? vehicleLabel(itemToDelete) : ''"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

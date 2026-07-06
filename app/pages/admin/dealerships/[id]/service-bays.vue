<script setup lang="ts">
import type { CreateServiceBayRequest, ServiceBay, UpdateServiceBayRequest } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const route = useRoute();
const dealershipId = computed(() => route.params.id as string);

const {
  fetchDealerships,
  fetchServiceBays,
  createServiceBay,
  updateServiceBay,
  deleteServiceBay,
} = useAdminApi();

const dealershipName = ref('');
const items = ref<ServiceBay[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const itemToDelete = ref<ServiceBay | null>(null);

const form = ref<CreateServiceBayRequest>({ name: '' });

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Status', key: 'isActive' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const isEditing = computed(() => editingId.value !== null);

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    const [dealerships, bays] = await Promise.all([
      fetchDealerships(),
      fetchServiceBays(dealershipId.value),
    ]);
    dealershipName.value = dealerships.find(d => d.id === dealershipId.value)?.name ?? 'Dealership';
    items.value = bays;
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load service bays.';
  }
  finally {
    loading.value = false;
  }
};

const openCreate = (): void => {
  editingId.value = null;
  form.value = { name: '' };
  formError.value = null;
  dialogOpen.value = true;
};

const openEdit = (item: ServiceBay): void => {
  editingId.value = item.id;
  form.value = { name: item.name };
  formError.value = null;
  dialogOpen.value = true;
};

const handleSave = async (): Promise<void> => {
  if (!form.value.name.trim()) {
    formError.value = 'Name is required.';
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    const body = { name: form.value.name.trim() };
    if (isEditing.value && editingId.value) {
      await updateServiceBay(dealershipId.value, editingId.value, body as UpdateServiceBayRequest);
    }
    else {
      await createServiceBay(dealershipId.value, body);
    }
    dialogOpen.value = false;
    await load();
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to save service bay.';
  }
  finally {
    saving.value = false;
  }
};

const openDelete = (item: ServiceBay): void => {
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
    await deleteServiceBay(dealershipId.value, itemToDelete.value.id);
    deleteDialogOpen.value = false;
    itemToDelete.value = null;
    await load();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to delete service bay.';
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
        { title: 'Dealerships', to: '/admin/dealerships' },
        { title: dealershipName, disabled: true },
        { title: 'Service Bays', disabled: true },
      ]"
      class="px-0 mb-4"
    />

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Service Bays
        </h1>
        <p class="text-gray-600 mt-1">
          {{ dealershipName }}
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Add service bay
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
      <template #item.isActive="{ value }">
        <v-chip
          :color="value ? 'success' : 'default'"
          size="small"
          variant="tonal"
        >
          {{ value ? 'Active' : 'Inactive' }}
        </v-chip>
      </template>
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
          :disabled="!item.isActive"
          @click="openDelete(item)"
        />
      </template>
    </AdminDataTable>

    <EntityFormDialog
      v-model:open="dialogOpen"
      :title="isEditing ? 'Edit service bay' : 'Add service bay'"
      :loading="saving"
      :error="formError"
      @submit="handleSave"
    >
      <v-text-field
        v-model="form.name"
        label="Name"
        required
      />
    </EntityFormDialog>

    <ConfirmDeleteDialog
      v-model:open="deleteDialogOpen"
      :entity-name="itemToDelete?.name ?? ''"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

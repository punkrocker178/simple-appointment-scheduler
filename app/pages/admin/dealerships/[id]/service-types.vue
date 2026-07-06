<script setup lang="ts">
import type { CreateServiceTypeRequest, ServiceType, Skill, UpdateServiceTypeRequest } from '~/types/api';
import EntityFormDialog from '~/components/admin/EntityFormDialog.vue';
import ConfirmDeleteDialog from '~/components/admin/ConfirmDeleteDialog.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const route = useRoute();
const dealershipId = computed(() => route.params.id as string);

const {
  fetchDealerships,
  fetchSkills,
  fetchServiceTypes,
  createServiceType,
  updateServiceType,
  deleteServiceType,
} = useAdminApi();

const dealershipName = ref('');
const skills = ref<Skill[]>([]);
const items = ref<ServiceType[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const itemToDelete = ref<ServiceType | null>(null);

const defaultForm = (): CreateServiceTypeRequest => ({
  skillId: '',
  name: '',
  description: '',
  durationMinutes: 30,
  price: 0,
});

const form = ref<CreateServiceTypeRequest>(defaultForm());

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Duration (min)', key: 'durationMinutes' },
  { title: 'Price', key: 'price' },
  { title: 'Status', key: 'isActive' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const skillOptions = computed(() =>
  skills.value.map(s => ({ title: s.name, value: s.id })),
);

const isEditing = computed(() => editingId.value !== null);

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    const [dealerships, skillsList, serviceTypes] = await Promise.all([
      fetchDealerships(),
      fetchSkills(),
      fetchServiceTypes(dealershipId.value),
    ]);
    dealershipName.value = dealerships.find(d => d.id === dealershipId.value)?.name ?? 'Dealership';
    skills.value = skillsList;
    items.value = serviceTypes;
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load service types.';
  }
  finally {
    loading.value = false;
  }
};

const openCreate = (): void => {
  editingId.value = null;
  form.value = {
    ...defaultForm(),
    skillId: skills.value[0]?.id ?? '',
  };
  formError.value = null;
  dialogOpen.value = true;
};

const openEdit = (item: ServiceType): void => {
  editingId.value = item.id;
  form.value = {
    skillId: item.skillId,
    name: item.name,
    description: item.description ?? '',
    durationMinutes: item.durationMinutes,
    price: item.price,
  };
  formError.value = null;
  dialogOpen.value = true;
};

const handleSave = async (): Promise<void> => {
  if (!form.value.name.trim() || !form.value.skillId) {
    formError.value = 'Name and skill are required.';
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    const body = {
      skillId: form.value.skillId,
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      durationMinutes: form.value.durationMinutes,
      price: form.value.price,
    };
    if (isEditing.value && editingId.value) {
      await updateServiceType(dealershipId.value, editingId.value, body as UpdateServiceTypeRequest);
    }
    else {
      await createServiceType(dealershipId.value, body);
    }
    dialogOpen.value = false;
    await load();
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to save service type.';
  }
  finally {
    saving.value = false;
  }
};

const openDelete = (item: ServiceType): void => {
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
    await deleteServiceType(dealershipId.value, itemToDelete.value.id);
    deleteDialogOpen.value = false;
    itemToDelete.value = null;
    await load();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to delete service type.';
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
        { title: 'Service Types', disabled: true },
      ]"
      class="px-0 mb-4"
    />

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Service Types
        </h1>
        <p class="text-gray-600 mt-1">
          {{ dealershipName }}
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        :disabled="skills.length === 0"
        @click="openCreate"
      >
        Add service type
      </v-btn>
    </div>

    <v-alert
      v-if="skills.length === 0 && !loading"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      Create skills before adding service types.
    </v-alert>

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
      <template #item.price="{ value }">
        ${{ Number(value).toFixed(2) }}
      </template>
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
      :title="isEditing ? 'Edit service type' : 'Add service type'"
      :loading="saving"
      :error="formError"
      @submit="handleSave"
    >
      <div class="space-y-4">
        <v-select
          v-model="form.skillId"
          :items="skillOptions"
          label="Skill"
          required
        />
        <v-text-field
          v-model="form.name"
          label="Name"
          required
        />
        <v-textarea
          v-model="form.description"
          label="Description"
          rows="2"
        />
        <v-text-field
          v-model.number="form.durationMinutes"
          label="Duration (minutes)"
          type="number"
          min="1"
        />
        <v-text-field
          v-model.number="form.price"
          label="Price"
          type="number"
          min="0"
          step="0.01"
          prefix="$"
        />
      </div>
    </EntityFormDialog>

    <ConfirmDeleteDialog
      v-model:open="deleteDialogOpen"
      :entity-name="itemToDelete?.name ?? ''"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

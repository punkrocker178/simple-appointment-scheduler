<script setup lang="ts">
import type { CreateTechnicianRequest, Skill, Technician, UpdateTechnicianRequest } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const route = useRoute();
const dealershipId = computed(() => route.params.id as string);

const {
  fetchDealerships,
  fetchSkills,
  fetchTechnicians,
  createTechnician,
  updateTechnician,
  deleteTechnician,
} = useAdminApi();

const dealershipName = ref('');
const skills = ref<Skill[]>([]);
const items = ref<Technician[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);

const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const editingId = ref<string | null>(null);
const itemToDelete = ref<Technician | null>(null);

const defaultForm = (): CreateTechnicianRequest => ({
  firstName: '',
  lastName: '',
  skillIds: [],
});

const form = ref<CreateTechnicianRequest>(defaultForm());

const headers = [
  { title: 'Name', key: 'fullName' },
  { title: 'Skills', key: 'skills' },
  { title: 'Status', key: 'isActive' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const skillOptions = computed(() =>
  skills.value.map(s => ({ title: s.name, value: s.id })),
);

const tableItems = computed(() =>
  items.value.map(t => ({
    ...t,
    fullName: `${t.firstName} ${t.lastName}`,
  })),
);

const isEditing = computed(() => editingId.value !== null);

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    const [dealerships, skillsList, technicians] = await Promise.all([
      fetchDealerships(),
      fetchSkills(),
      fetchTechnicians(dealershipId.value),
    ]);
    dealershipName.value = dealerships.find(d => d.id === dealershipId.value)?.name ?? 'Dealership';
    skills.value = skillsList;
    items.value = technicians;
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load technicians.';
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

const openEdit = (item: Technician): void => {
  editingId.value = item.id;
  form.value = {
    firstName: item.firstName,
    lastName: item.lastName,
    skillIds: item.skills.map(s => s.id),
  };
  formError.value = null;
  dialogOpen.value = true;
};

const handleSave = async (): Promise<void> => {
  if (!form.value.firstName.trim() || !form.value.lastName.trim()) {
    formError.value = 'First and last name are required.';
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    const body = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      skillIds: form.value.skillIds ?? [],
    };
    if (isEditing.value && editingId.value) {
      await updateTechnician(dealershipId.value, editingId.value, body as UpdateTechnicianRequest);
    }
    else {
      await createTechnician(dealershipId.value, body);
    }
    dialogOpen.value = false;
    await load();
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to save technician.';
  }
  finally {
    saving.value = false;
  }
};

const openDelete = (item: Technician): void => {
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
    await deleteTechnician(dealershipId.value, itemToDelete.value.id);
    deleteDialogOpen.value = false;
    itemToDelete.value = null;
    await load();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to delete technician.';
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
        { title: 'Technicians', disabled: true },
      ]"
      class="px-0 mb-4"
    />

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Technicians
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
        Add technician
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
      :items="tableItems"
      :headers="headers"
      :loading="loading"
    >
      <template #item.skills="{ item }">
        <div class="flex flex-wrap gap-1">
          <v-chip
            v-for="skill in item.skills"
            :key="skill.id"
            size="x-small"
            variant="tonal"
          >
            {{ skill.name }}
          </v-chip>
          <span v-if="item.skills.length === 0" class="text-gray-400">—</span>
        </div>
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
      :title="isEditing ? 'Edit technician' : 'Add technician'"
      :loading="saving"
      :error="formError"
      @submit="handleSave"
    >
      <div class="space-y-4">
        <v-text-field
          v-model="form.firstName"
          label="First name"
          required
        />
        <v-text-field
          v-model="form.lastName"
          label="Last name"
          required
        />
        <v-select
          v-model="form.skillIds"
          :items="skillOptions"
          label="Skills"
          multiple
          chips
          closable-chips
        />
      </div>
    </EntityFormDialog>

    <ConfirmDeleteDialog
      v-model:open="deleteDialogOpen"
      :entity-name="itemToDelete ? `${itemToDelete.firstName} ${itemToDelete.lastName}` : ''"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

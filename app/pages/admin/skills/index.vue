<script setup lang="ts">
import type { CreateSkillRequest, Skill } from '~/types/api';
import EntityFormDialog from '~/components/admin/EntityFormDialog.vue';
import ConfirmDeleteDialog from '~/components/admin/ConfirmDeleteDialog.vue';
import DeleteActionButton from '~/components/admin/DeleteActionButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const { fetchSkills, createSkill, deleteSkill } = useAdminApi();

const items = ref<Skill[]>([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);

const createDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const skillToDelete = ref<Skill | null>(null);

const form = ref<CreateSkillRequest>({
  name: '',
  description: '',
});

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const rules = {
  required: (value: string) => !!value?.trim() || 'Required',
};

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    items.value = await fetchSkills();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load skills.';
  }
  finally {
    loading.value = false;
  }
};

const openCreate = (): void => {
  form.value = { name: '', description: '' };
  formError.value = null;
  createDialogOpen.value = true;
};

const handleCreate = async (): Promise<void> => {
  if (!form.value.name.trim()) {
    formError.value = 'Name is required.';
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    await createSkill({
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
    });
    createDialogOpen.value = false;
    await load();
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to create skill.';
  }
  finally {
    saving.value = false;
  }
};

const openDelete = (skill: Skill): void => {
  skillToDelete.value = skill;
  deleteDialogOpen.value = true;
};

const handleDelete = async (): Promise<void> => {
  if (!skillToDelete.value) {
    return;
  }
  deleting.value = true;
  pageError.value = null;
  try {
    await deleteSkill(skillToDelete.value.id);
    deleteDialogOpen.value = false;
    skillToDelete.value = null;
    await load();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to delete skill.';
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
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Skills
        </h1>
        <p class="text-gray-600 mt-1">
          Manage technician skill catalog
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Add skill
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
      <template #item.description="{ value }">
        {{ value || '—' }}
      </template>
      <template #item.actions="{ item }">
        <DeleteActionButton
          :can-delete="item.canDelete"
          disabled-reason="This skill is used by service types or technicians."
          @click="openDelete(item)"
        />
      </template>
    </AdminDataTable>

    <EntityFormDialog
      v-model:open="createDialogOpen"
      title="Add skill"
      :loading="saving"
      :error="formError"
      submit-label="Create"
      @submit="handleCreate"
    >
      <div class="space-y-4">
        <v-text-field
          v-model="form.name"
          label="Name"
          :rules="[rules.required]"
          required
        />
        <v-textarea
          v-model="form.description"
          label="Description"
          rows="2"
        />
      </div>
    </EntityFormDialog>

    <ConfirmDeleteDialog
      v-model:open="deleteDialogOpen"
      :entity-name="skillToDelete?.name ?? ''"
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>

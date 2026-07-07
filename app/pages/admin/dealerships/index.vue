<script setup lang="ts">
import type { CreateDealershipRequest, Dealership, UpdateDealershipRequest } from '~/types/api';
import { formatHoursRange } from '~/utils/timeFormat';
import EntityFormDialog from '~/components/admin/EntityFormDialog.vue';
import TimeRangePicker from '~/components/admin/TimeRangePicker.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const { fetchDealerships, createDealership, updateDealership } = useAdminApi();

const items = ref<Dealership[]>([]);
const loading = ref(false);
const saving = ref(false);
const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);

const defaultForm = (): CreateDealershipRequest => ({
  name: '',
  address: '',
  phone: '',
  timezone: 'America/New_York',
  openSecondsFromMidnight: 28800,
  closeSecondsFromMidnight: 61200,
});

const form = ref<CreateDealershipRequest>(defaultForm());

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'Phone', key: 'phone' },
  { title: 'Hours', key: 'hours' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const isEditing = computed(() => editingId.value !== null);

const dialogTitle = computed(() => (isEditing.value ? 'Edit dealership' : 'Add dealership'));

const rules = {
  required: (value: string) => !!value?.trim() || 'Required',
};

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    items.value = await fetchDealerships();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load dealerships.';
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

const openEdit = (dealership: Dealership): void => {
  editingId.value = dealership.id;
  form.value = {
    name: dealership.name,
    address: dealership.address,
    phone: dealership.phone,
    timezone: dealership.timezone,
    openSecondsFromMidnight: dealership.openSecondsFromMidnight,
    closeSecondsFromMidnight: dealership.closeSecondsFromMidnight,
  };
  formError.value = null;
  dialogOpen.value = true;
};

const handleSave = async (): Promise<void> => {
  if (!form.value.name.trim() || !form.value.address.trim() || !form.value.phone.trim()) {
    formError.value = 'Name, address, and phone are required.';
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    if (isEditing.value && editingId.value) {
      const body: UpdateDealershipRequest = {
        name: form.value.name.trim(),
        address: form.value.address.trim(),
        phone: form.value.phone.trim(),
        timezone: form.value.timezone.trim(),
        openSecondsFromMidnight: form.value.openSecondsFromMidnight ?? 28800,
        closeSecondsFromMidnight: form.value.closeSecondsFromMidnight ?? 61200,
      };
      await updateDealership(editingId.value, body);
    }
    else {
      await createDealership({
        name: form.value.name.trim(),
        address: form.value.address.trim(),
        phone: form.value.phone.trim(),
        timezone: form.value.timezone.trim(),
        openSecondsFromMidnight: form.value.openSecondsFromMidnight,
        closeSecondsFromMidnight: form.value.closeSecondsFromMidnight,
      });
    }
    dialogOpen.value = false;
    await load();
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to save dealership.';
  }
  finally {
    saving.value = false;
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
          Dealerships
        </h1>
        <p class="text-gray-600 mt-1">
          Manage dealership locations and resources
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Add dealership
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
      <template #item.hours="{ item }">
        {{ formatHoursRange(item.openSecondsFromMidnight, item.closeSecondsFromMidnight) }}
      </template>
      <template #item.actions="{ item }">
        <div class="flex items-center gap-1 flex-wrap">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            @click="openEdit(item)"
          />
          <v-btn
            :to="`/admin/dealerships/${item.id}/service-types`"
            variant="text"
            size="small"
            prepend-icon="mdi-wrench-clock"
          >
            Types
          </v-btn>
          <v-btn
            :to="`/admin/dealerships/${item.id}/service-bays`"
            variant="text"
            size="small"
            prepend-icon="mdi-garage"
          >
            Bays
          </v-btn>
          <v-btn
            :to="`/admin/dealerships/${item.id}/technicians`"
            variant="text"
            size="small"
            prepend-icon="mdi-account-hard-hat"
          >
            Techs
          </v-btn>
          <v-btn
            :to="`/admin/dealerships/${item.id}/appointments`"
            variant="text"
            size="small"
            prepend-icon="mdi-calendar-clock"
          >
            Schedule
          </v-btn>
        </div>
      </template>
    </AdminDataTable>

    <EntityFormDialog
      v-model:open="dialogOpen"
      :title="dialogTitle"
      :loading="saving"
      :error="formError"
      @submit="handleSave"
    >
      <div class="space-y-4">
        <v-text-field
          v-model="form.name"
          label="Name"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.address"
          label="Address"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.phone"
          label="Phone"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.timezone"
          label="Timezone"
          :rules="[rules.required]"
        />
        <TimeRangePicker
          v-model:open-seconds-from-midnight="form.openSecondsFromMidnight"
          v-model:close-seconds-from-midnight="form.closeSecondsFromMidnight"
        />
      </div>
    </EntityFormDialog>
  </div>
</template>

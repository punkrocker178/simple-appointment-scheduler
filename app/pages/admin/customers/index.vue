<script setup lang="ts">
import type { CreateCustomerRequest, Customer, UpdateCustomerRequest } from '~/types/api';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const { fetchCustomers, createCustomer, updateCustomer } = useAdminApi();

const items = ref<Customer[]>([]);
const loading = ref(false);
const saving = ref(false);
const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);

const defaultForm = (): CreateCustomerRequest => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const form = ref<CreateCustomerRequest>(defaultForm());

const headers = [
  { title: 'First name', key: 'firstName' },
  { title: 'Last name', key: 'lastName' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Created', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const isEditing = computed(() => editingId.value !== null);

const rules = {
  required: (value: string) => !!value?.trim() || 'Required',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email',
};

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString();
};

const load = async (): Promise<void> => {
  loading.value = true;
  pageError.value = null;
  try {
    items.value = await fetchCustomers();
  }
  catch (err) {
    pageError.value = err instanceof Error ? err.message : 'Failed to load customers.';
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

const openEdit = (customer: Customer): void => {
  editingId.value = customer.id;
  form.value = {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
  };
  formError.value = null;
  dialogOpen.value = true;
};

const handleSave = async (): Promise<void> => {
  if (!form.value.firstName.trim() || !form.value.lastName.trim() || !form.value.email.trim()) {
    formError.value = 'First name, last name, and email are required.';
    return;
  }
  if (!rules.email(form.value.email)) {
    formError.value = 'Invalid email address.';
    return;
  }
  saving.value = true;
  formError.value = null;
  try {
    const body = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
    };
    if (isEditing.value && editingId.value) {
      await updateCustomer(editingId.value, body as UpdateCustomerRequest);
    }
    else {
      await createCustomer(body);
    }
    dialogOpen.value = false;
    await load();
  }
  catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to save customer.';
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
          Customers
        </h1>
        <p class="text-gray-600 mt-1">
          Manage customer records and vehicles
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Add customer
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
      <template #item.createdAt="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #item.actions="{ item }">
        <div class="flex items-center gap-1">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            @click="openEdit(item)"
          />
          <v-btn
            :to="`/admin/customers/${item.id}/vehicles`"
            variant="text"
            size="small"
            prepend-icon="mdi-car"
          >
            Vehicles
          </v-btn>
        </div>
      </template>
    </AdminDataTable>

    <EntityFormDialog
      v-model:open="dialogOpen"
      :title="isEditing ? 'Edit customer' : 'Add customer'"
      :loading="saving"
      :error="formError"
      @submit="handleSave"
    >
      <div class="space-y-4">
        <v-text-field
          v-model="form.firstName"
          label="First name"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.lastName"
          label="Last name"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[rules.required, rules.email]"
        />
        <v-text-field
          v-model="form.phone"
          label="Phone"
        />
      </div>
    </EntityFormDialog>
  </div>
</template>

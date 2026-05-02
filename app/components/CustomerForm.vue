<template>
  <v-card class="p-6 rounded-xl">
    <div class="text-lg font-semibold text-gray-900 mb-4 rounded-xl">Your Details</div>

    <v-form class="space-y-4">
      <v-text-field
        v-model="form.name"
        label="Full name"
        required
        :rules="[rules.required]"
      />

      <v-text-field
        v-model="form.email"
        label="Email"
        type="email"
        required
        :rules="[rules.required, rules.email]"
      />
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { useBookingStore } from '@/stores/bookingStore';

interface Props {
  store: ReturnType<typeof useBookingStore>
}

const props = defineProps<Props>();

const form = ref({
  name: '',
  email: '',
});

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email',
};

// Watch form changes and update store
watch(
  () => form.value.name,
  (newName) => {
    props.store.setCustomer(newName, form.value.email);
  },
);

watch(
  () => form.value.email,
  (newEmail) => {
    props.store.setCustomer(form.value.name, newEmail);
  },
);

// Initialize form from store
onMounted(() => {
  form.value.name = props.store.customer.name;
  form.value.email = props.store.customer.email;
});
</script>

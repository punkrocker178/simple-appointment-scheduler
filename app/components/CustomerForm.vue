<template>
  <v-card class="p-6">
    <div class="text-lg font-semibold text-gray-900 mb-4">Your Details</div>

    <v-form class="space-y-4" @submit.prevent="handleSubmit">
      <v-text-field v-model="name" label="Full name" required :rules="[rules.required]" />
      <v-text-field v-model="email" label="Email" required :rules="[rules.required, rules.email]" />

      <div class="flex gap-3 pt-4">
        <v-btn type="submit" color="primary" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Confirm</v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'submit', name: string, email: string): void
}>();

const name = ref('');
const email = ref('');

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /\S+@\S+\.\S+/.test(v) || 'Invalid email',
};

function handleSubmit() {
  if (!name.value || !email.value) return;
  // @ts-ignore
  emit('submit', name.value, email.value);
}
</script>

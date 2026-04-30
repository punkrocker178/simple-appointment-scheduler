<template>
  <v-card class="p-6">
    <div class="text-lg font-semibold text-gray-900 mb-6">Vehicle Information</div>

    <v-form class="space-y-4" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="form.plate"
        label="Registration Plate *"
        required
        :rules="[rules.required]"
        class="mb-4"
      />

      <v-text-field
        v-model="form.make"
        label="Make / Brand"
        class="mb-4"
      />

      <v-text-field
        v-model="form.model"
        label="Model"
        class="mb-4"
      />

      <div class="flex gap-3 pt-4">
        <v-btn
          type="submit"
          color="primary"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Continue
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  plate?: string
  make?: string
  model?: string
}

interface Emit {
  (e: 'submitted', plate: string, make: string, model: string): void
}

const props = withDefaults(defineProps<Props>(), {
  plate: '',
  make: '',
  model: '',
});

const emit = defineEmits<Emit>();

const form = ref({
  plate: props.plate,
  make: props.make,
  model: props.model,
});

const rules = {
  required: (value: string) => !!value || 'Field is required',
};

const handleSubmit = (): void => {
  if (form.value.plate.trim()) {
    emit('submitted', form.value.plate, form.value.make, form.value.model);
  }
};
</script>

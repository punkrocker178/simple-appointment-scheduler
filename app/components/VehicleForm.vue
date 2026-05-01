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
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  store: ReturnType<typeof useBookingStore>
}

const props = defineProps<Props>();

const form = ref({
  plate: props.store.vehicle.plate,
  make: props.store.vehicle.make,
  model: props.store.vehicle.model,
});

const rules = {
  required: (value: string) => !!value || 'Field is required',
};

// Watch form changes and update store
watch(
  () => form.value.plate,
  (newPlate) => {
    props.store.setVehicle(newPlate, form.value.make, form.value.model);
  },
);

watch(
  () => form.value.make,
  (newMake) => {
    props.store.setVehicle(form.value.plate, newMake, form.value.model);
  },
);

watch(
  () => form.value.model,
  (newModel) => {
    props.store.setVehicle(form.value.plate, form.value.make, newModel);
  },
);
</script>

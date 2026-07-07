<template>
  <v-card class="p-6 rounded-xl">
    <div class="text-lg font-semibold text-gray-900 mb-6">Vehicle Information</div>

    <div v-if="store.isLoading" class="text-gray-600">
      Loading vehicles...
    </div>

    <div v-else-if="store.vehicles.length === 0" class="text-gray-600 mb-4">
      No saved vehicles. Add one to continue.
    </div>

    <div v-else class="space-y-3 mb-4">
      <v-radio-group :model-value="store.selectedVehicleId">
        <v-card
          v-for="vehicle in store.vehicles"
          :key="vehicle.id"
          class="cursor-pointer transition-all mb-3 rounded-xl"
          :class="{ 'border-2 border-blue-500': store.selectedVehicleId === vehicle.id }"
          @click="store.selectVehicle(vehicle.id)"
        >
          <div class="p-4 flex items-center justify-between">
            <div>
              <div class="font-semibold text-gray-900">{{ vehicle.make }} {{ vehicle.model }}</div>
              <div class="text-sm text-gray-600">{{ vehicle.year }}</div>
            </div>
            <v-radio :value="vehicle.id" />
          </div>
        </v-card>
      </v-radio-group>
    </div>

    <v-btn
      color="secondary"
      variant="outlined"
      class="mt-2"
      @click="showDialog = true"
    >
      Add Vehicle
    </v-btn>

    <v-dialog v-model="showDialog" max-width="500">
      <v-card class="p-6 rounded-xl">
        <div class="text-lg font-semibold text-gray-900 mb-4">Add Vehicle</div>

        <v-form class="space-y-4">
          <v-text-field
            v-model="newVehicle.make"
            label="Make / Brand"
            required
            :rules="[rules.required]"
          />
          <v-text-field
            v-model="newVehicle.model"
            label="Model"
            required
            :rules="[rules.required]"
          />
          <v-text-field
            v-model.number="newVehicle.year"
            label="Year"
            type="number"
            required
            :rules="[rules.required, rules.year]"
          />
        </v-form>

        <div class="flex justify-end gap-3 mt-6">
          <v-btn variant="outlined" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="store.isLoading"
            :disabled="!isVehicleValid"
            @click="handleAddVehicle"
          >
            Add
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  store: ReturnType<typeof useBookingStore>
}

const props = defineProps<Props>();

const showDialog = ref(false);
const newVehicle = ref({
  make: '',
  model: '',
  year: new Date().getFullYear(),
});

const rules = {
  required: (value: string | number) => Boolean(value) || 'Required',
  year: (value: number) =>
    value >= 1900 && value <= new Date().getFullYear() + 1 || 'Invalid year',
};

const isVehicleValid = computed((): boolean => {
  return Boolean(
    newVehicle.value.make
    && newVehicle.value.model
    && newVehicle.value.year >= 1900
    && newVehicle.value.year <= new Date().getFullYear() + 1,
  );
});

const closeDialog = (): void => {
  showDialog.value = false;
  newVehicle.value = { make: '', model: '', year: new Date().getFullYear() };
};

const handleAddVehicle = async (): Promise<void> => {
  if (!isVehicleValid.value)
    return;
  await props.store.addVehicle(
    newVehicle.value.make,
    newVehicle.value.model,
    newVehicle.value.year,
  );
  closeDialog();
};
</script>

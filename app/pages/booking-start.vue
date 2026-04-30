<script setup lang="ts">
const store = useBookingStore();

onMounted(async () => {
  await store.loadServices();
});

const handleNext = (): void => {
  if (store.vehicle.plate && store.selectedServiceId) {
    navigateTo('/availability');
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Book Your Service Appointment</h1>
    
    <div class="space-y-8">
      <VehicleForm
        :plate="store.vehicle.plate"
        :make="store.vehicle.make"
        :model="store.vehicle.model"
        @update:plate="(v) => store.setVehicle(v, store.vehicle.make, store.vehicle.model)"
        @update:make="(v) => store.setVehicle(store.vehicle.plate, v, store.vehicle.model)"
        @update:model="(v) => store.setVehicle(store.vehicle.plate, store.vehicle.make, v)"
      />

      <ServiceSelector
        :services="store.services"
        :selected-id="store.selectedServiceId"
        :loading="store.isLoading"
        @select="store.selectService"
      />

      <div class="flex justify-end">
        <button
          :disabled="!store.vehicle.plate || !store.selectedServiceId"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          @click="handleNext"
        >
          Next: Select Date & Time
        </button>
      </div>
    </div>
  </div>
</template>

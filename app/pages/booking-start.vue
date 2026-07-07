<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const store = useBookingStore();

onMounted(async () => {
  await store.bootstrap();
});

const handleNext = (): void => {
  if (store.selectedVehicleId && store.selectedServiceTypeId) {
    navigateTo('/availability');
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Book Your Service Appointment</h1>

    <div class="space-y-8">
      <CustomerForm :store="store" />
      <VehicleForm :store="store" />
      <ServiceSelector :store="store" />

      <div class="flex justify-end">
        <button
          :disabled="!store.selectedVehicleId || !store.selectedServiceTypeId"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          @click="handleNext"
        >
          Next: Select Date & Time
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const store = useBookingStore();

onMounted(() => {
  if (!store.selectedSlot) {
    navigateTo('/availability');
  }
});

const handleSubmit = async (): Promise<void> => {
  try {
    await store.submitBooking();
    navigateTo('/summary');
  }
  catch (err: unknown) {
    console.error('Booking submission failed:', err);
  }
};

const handleBack = (): void => {
  navigateTo('/availability');
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Confirm Your Appointment</h1>

    <div v-if="store.error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
      {{ store.error }}
    </div>

    <div class="space-y-8">
      <ConfirmationPanel
        :time-slot="store.selectedSlot"
        :service="store.selectedService"
        :booking-date="store.selectedDate"
        :vehicle="store.selectedVehicle"
        :customer="store.customerProfile"
      />

      <div class="flex justify-between">
        <button
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          @click="handleBack"
        >
          Back
        </button>
        <button
          :disabled="!store.isBookingComplete || store.isLoading"
          class="px-6 py-3 bg-green-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700"
          @click="handleSubmit"
        >
          {{ store.isLoading ? 'Booking...' : 'Confirm Booking' }}
        </button>
      </div>
    </div>
  </div>
</template>

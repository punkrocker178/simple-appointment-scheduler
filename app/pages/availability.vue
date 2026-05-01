<script setup lang="ts">
const store = useBookingStore();

onMounted(() => {
  if (!store.selectedServiceId || !store.vehicle.plate) {
    navigateTo('/booking-start');
  }
});

const handleDateSelect = async (date: string): Promise<void> => {
  console.log('Selected date:', date);
  await store.fetchAvailability(date);
};

const handleSlotSelect = (slot: any): void => {
  store.selectSlot(slot);
};

const handleNext = (): void => {
  if (store.selectedSlot) {
    navigateTo('/confirmation');
  }
};

const handleBack = (): void => {
  navigateTo('/booking-start');
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-8">Select Date & Time</h1>

    <div v-if="store.error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
      {{ store.error }}
    </div>

    <div class="space-y-8">
      <div>
        <h2 class="text-xl font-semibold mb-4">Selected Service</h2>
        <p class="text-gray-700">{{ store.selectedService?.name }} ({{ store.selectedService?.durationMinutes }} min)</p>
      </div>

      <DatePicker
        :selected-date="store.selectedDate"
        @selected="handleDateSelect"
      />

      <TimeSlotGrid
        :slots="store.availableSlots"
        :selected-slot="store.selectedSlot"
        :is-loading="store.isLoading"
        @selected="handleSlotSelect"
      />

      <div class="flex justify-between">
        <button
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          @click="handleBack"
        >
          Back
        </button>
        <button
          :disabled="!store.selectedSlot"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          @click="handleNext"
        >
          Next: Confirm Details
        </button>
      </div>
    </div>
  </div>
</template>

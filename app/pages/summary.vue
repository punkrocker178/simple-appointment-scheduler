<script setup lang="ts">
const store = useBookingStore();

onMounted(() => {
  if (!store.bookingReference) {
    navigateTo('/booking-start');
  }
});

const handleNewBooking = (): void => {
  store.resetBooking();
  navigateTo('/booking-start');
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <SuccessMessage
      v-if="store.bookingReference"
      :booking-reference="store.bookingReference"
      :appointment="store.confirmation"
      @new-booking="handleNewBooking"
    />
  </div>
</template>

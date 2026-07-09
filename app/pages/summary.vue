<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const store = useBookingStore();

onMounted(() => {
  if (!store.appointment) {
    navigateTo('/booking-start');
  }
});

const handleNewBooking = (): void => {
  store.resetBooking();
  navigateTo('/booking-start');
};

const handleViewAppointments = (): void => {
  navigateTo('/my-appointments');
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <SuccessMessage
      v-if="store.appointment"
      :booking-reference="store.appointment.id"
      :appointment="store.appointment"
      :service="store.selectedService"
      :vehicle="store.selectedVehicle"
      :customer="store.customerProfile"
      @new-booking="handleNewBooking"
      @view-appointments="handleViewAppointments"
    />
  </div>
</template>

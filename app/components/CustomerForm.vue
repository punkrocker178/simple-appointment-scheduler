<template>
  <v-card class="p-6 rounded-xl">
    <div class="text-lg font-semibold text-gray-900 mb-4 rounded-xl">Your Details</div>

    <div v-if="store.customerProfile" class="space-y-2 text-gray-700">
      <div><span class="font-semibold">Name:</span> {{ fullName }}</div>
      <div><span class="font-semibold">Email:</span> {{ store.customerProfile.email }}</div>
      <div v-if="store.customerProfile.phone">
        <span class="font-semibold">Phone:</span> {{ store.customerProfile.phone }}
      </div>
    </div>

    <div v-else class="text-gray-600">
      Loading profile...
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  store: ReturnType<typeof useBookingStore>
}

const props = defineProps<Props>();

const fullName = computed((): string => {
  const profile = props.store.customerProfile;
  if (!profile)
    return '';
  return `${profile.firstName} ${profile.lastName}`.trim();
});
</script>

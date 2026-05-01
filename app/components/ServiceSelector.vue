<template>
  <div class="space-y-4">
    <div class="text-lg font-semibold text-gray-900">Select a Service</div>

    <div v-if="store.isLoading" class="py-8">
      <v-progress-circular indeterminate />
    </div>

    <div v-else-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ store.error }}</p>
    </div>

    <div v-else-if="store.services.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <p class="text-gray-600">No services available</p>
    </div>

    <div v-else class="space-y-3">
      <v-radio-group :model-value="store.selectedServiceId">
        <v-card v-for="service in store.services" :key="service.id" class="cursor-pointer transition-all mb-4"
          :class="{ 'border-2 border-blue-500': store.selectedServiceId === service.id }"
          @click="store.selectService(service.id)">
          <div class="p-4 flex flex-col h-full">
            <div class="flex items-start">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Duration: {{ service.durationMinutes }} minutes
                </p>
                <p class="text-sm text-blue-600 mt-1">
                  Requires: {{ service.requiredSkill }}
                </p>
              </div>
              <div class="flex align-center h-[100%]">
                <v-radio :value="service.id" class="accent-blue-500" />
              </div>
            </div>
          </div>
        </v-card>
      </v-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Service } from '#server/utils/types';

interface Props {
  store: ReturnType<typeof useBookingStore>
}

defineProps<Props>();

</script>

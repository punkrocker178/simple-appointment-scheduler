<template>
  <div class="space-y-4">
    <div class="text-lg font-semibold text-gray-900">Select a Service</div>

    <div v-if="isLoading" class="py-8">
      <v-progress-circular indeterminate />
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <div v-else-if="services.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <p class="text-gray-600">No services available</p>
    </div>

    <div v-else class="space-y-3">
      <v-card
        v-for="service in services"
        :key="service.id"
        class="cursor-pointer hover:shadow-md hover:elevation-1 transition-all"
        :class="{ 'border-2 border-blue-500': modelValue === service.id }"
        @click="$emit('select', service.id)"
      >
        <div class="p-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                Duration: {{ service.durationMinutes }} minutes
              </p>
              <p class="text-sm text-blue-600 mt-1">
                Requires: {{ service.requiredSkill }}
              </p>
            </div>
            <v-radio
              :model-value="modelValue"
              :value="service.id"
              class="ml-4"
            />
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Service } from '#server/utils/types';

interface Props {
  services: Service[]
  isLoading?: boolean
  error?: string | null
  modelValue?: string
}

interface Emit {
  (e: 'select', serviceId: string): void
  (e: 'update:modelValue', serviceId: string): void
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  modelValue: '',
});

defineEmits<Emit>();
</script>

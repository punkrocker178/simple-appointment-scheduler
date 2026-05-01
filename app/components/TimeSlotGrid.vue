<template>
  <div class="space-y-3">
    <div class="text-lg font-semibold text-gray-900">Available Time Slots</div>

    <div v-if="isLoading" class="py-6 text-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="slots.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <p class="text-gray-600">No slots available for this date.</p>
    </div>

    <div v-else class="grid grid-cols-2 gap-3">
      <v-card
        v-for="slot in slots"
        :key="slot.startTime"
        class="p-3 cursor-pointer hover:shadow-md transition-all"
        :class="slot.available ? (selectedSlot === slot ? 'border-2 border-blue-500 text-white' : 'bg-white') : 'bg-gray-100 opacity-60 cursor-not-allowed'"
        @click="select(slot)"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold text-gray-900">{{ formatTime(slot.startTime) }}</div>
            <div class="text-sm text-gray-500">{{ formatTime(slot.endTime) }}</div>
          </div>
          <div>
            <v-icon v-if="slot.available" color="green">mdi-check-circle</v-icon>
            <v-icon v-else color="gray">mdi-cancel</v-icon>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Slot } from '#server/utils/types';
import { defineEmits, defineProps } from 'vue';

interface Props {
  slots: Slot[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit =  defineEmits<{
  (e: 'selected', slot: Slot): void
}>();

const selectedSlot = ref<Slot | null>(null);

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  catch {
    return iso;
  }
}

function select(slot: Slot) {
  if (!slot.available) return;
  selectedSlot.value = slot;
  // emit select
  // @ts-ignore - use defineEmits typing above
  emit('selected', slot);
}
</script>

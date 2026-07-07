<template>
  <div class="space-y-3">
    <div class="text-lg font-semibold text-gray-900">Time Slots</div>

    <div v-if="isLoading" class="py-6 text-center">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="slots.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <p class="text-gray-600">No slots available for this date.</p>
    </div>

    <div v-else class="grid grid-cols-2 gap-3">
      <v-card
        v-for="slot in slots"
        :key="slot.secondsFromMidnight"
        class="p-3 transition-all rounded-xl"
        :class="slotCardClass(slot)"
        :disabled="!slot.available"
        @click="select(slot)"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold" :class="slot.available ? 'text-gray-900' : 'text-gray-400'">
              {{ formatTime(slot.secondsFromMidnight) }}
            </div>
            <div class="text-sm" :class="slot.available ? 'text-gray-500' : 'text-gray-300'">
              {{ formatEndTime(slot.secondsFromMidnight) }}
            </div>
          </div>
          <div v-if="slot.available">
            <v-icon color="green">mdi-check-circle</v-icon>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AvailabilitySlotDto } from '~/types/api/booking';
import { secondsToTimeLabel, slotEndSeconds } from '~/utils/bookingTime';

interface Props {
  slots: AvailabilitySlotDto[]
  durationMinutes: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<{
  selected: [slot: AvailabilitySlotDto]
}>();

const selectedSlot = ref<AvailabilitySlotDto | null>(null);

function formatTime(secondsFromMidnight: number): string {
  return secondsToTimeLabel(secondsFromMidnight);
}

function formatEndTime(secondsFromMidnight: number): string {
  return secondsToTimeLabel(slotEndSeconds(secondsFromMidnight, props.durationMinutes));
}

function slotCardClass(slot: AvailabilitySlotDto): string {
  if (!slot.available) {
    return 'time-slot--disabled';
  }
  if (selectedSlot.value === slot) {
    return 'border-2 border-blue-500 text-white cursor-pointer hover:shadow-md';
  }
  return 'bg-white cursor-pointer hover:shadow-md';
}

function select(slot: AvailabilitySlotDto): void {
  if (!slot.available)
    return;
  selectedSlot.value = slot;
  emit('selected', slot);
}
</script>

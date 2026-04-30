<template>
  <v-card class="p-6">
    <div class="text-lg font-semibold text-gray-900 mb-6">Select Booking Date</div>

    <div class="mb-6">
      <v-date-picker
        v-model:model-value="selectedDateArray"
        :min="minDate"
        :disabled-dates="disabledDates"
        class="w-full"
        @input="handleDateChange"
      />
    </div>

    <div v-if="selectedDate" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="text-sm text-blue-900">
        Selected date:
        <span class="font-semibold">{{ formatDate(selectedDate) }}</span>
      </div>
    </div>

    <div v-if="warningMessage" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-yellow-800">{{ warningMessage }}</p>
    </div>

    <div class="flex gap-3">
      <v-btn
        color="primary"
        :disabled="!selectedDate"
        class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-300"
        @click="handleConfirm"
      >
        Continue
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Emit {
  (e: 'selected', date: string): void
}

const emit = defineEmits<Emit>();

const selectedDateArray = ref<number[] | null>(null);
const selectedDate = computed(() => {
  if (!selectedDateArray.value || selectedDateArray.value.length === 0)
    return null;
  const [year, month, day] = selectedDateArray.value;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
});

const minDate = computed(() => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return new Date(now.toISOString().split('T')[0] + 'T00:00:00');
});

const disabledDates = computed(() => {
  const disabled: Date[] = [];
  const now = new Date();

  // Disable next 90 days that are Sundays
  for (let i = 0; i < 90; i++) {
    const testDate = new Date(now);
    testDate.setDate(testDate.getDate() + i);
    if (testDate.getDay() === 0) {
      disabled.push(testDate);
    }
  }

  return disabled;
});

const warningMessage = computed(() => {
  if (!selectedDate.value)
    return null;

  const today = new Date();
  const selected = new Date(`${selectedDate.value}T00:00:00`);
  const sameDay = selected.getFullYear() === today.getFullYear()
    && selected.getMonth() === today.getMonth()
    && selected.getDate() === today.getDate();

  if (sameDay)
    return 'Same-day bookings require at least 2 hours notice.';

  return null;
});

const formatDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const handleDateChange = (): void => {
  // Triggered automatically when date changes
};

const handleConfirm = (): void => {
  if (selectedDate.value) {
    emit('selected', selectedDate.value);
  }
};
</script>

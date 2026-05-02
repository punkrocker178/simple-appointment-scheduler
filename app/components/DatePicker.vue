<template>
  <v-card class="p-6 rounded-xl">
    <div class="text-lg font-semibold text-gray-900 mb-6">Select Booking Date</div>

    <div class="mb-6">
      <v-date-picker
        v-model:model-value="selectedDate"
        :min="minDate"
        :disabled-dates="disabledDates"
        class="w-full"
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
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Emit {
  (e: 'selected', date: string): void
}

const emit = defineEmits<Emit>();

const selectedDate = ref<Date | null>(null);

watch(selectedDate, (newDate) => {
  if (newDate) {
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const day = newDate.getDate();
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    emit('selected', dateString);
  }
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
  const sameDay = selectedDate.value.getFullYear() === today.getFullYear()
    && selectedDate.value.getMonth() === today.getMonth()
    && selectedDate.value.getDate() === today.getDate();

  if (sameDay)
    return 'Same-day bookings require at least 2 hours notice.';

  return null;
});

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

</script>

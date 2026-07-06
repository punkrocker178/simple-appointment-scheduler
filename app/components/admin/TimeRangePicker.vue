<script setup lang="ts">
import { secondsToTimeString, timeStringToSeconds } from '~/utils/timeFormat';

interface Props {
  openSecondsFromMidnight?: number;
  closeSecondsFromMidnight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  openSecondsFromMidnight: 28800,
  closeSecondsFromMidnight: 61200,
});

const emit = defineEmits<{
  'update:openSecondsFromMidnight': [value: number];
  'update:closeSecondsFromMidnight': [value: number];
}>();

const openTime = computed({
  get: () => secondsToTimeString(props.openSecondsFromMidnight),
  set: (value: string) => {
    const seconds = timeStringToSeconds(value);
    if (seconds !== null) {
      emit('update:openSecondsFromMidnight', seconds);
    }
  },
});

const closeTime = computed({
  get: () => secondsToTimeString(props.closeSecondsFromMidnight),
  set: (value: string) => {
    const seconds = timeStringToSeconds(value);
    if (seconds !== null) {
      emit('update:closeSecondsFromMidnight', seconds);
    }
  },
});

const rules = {
  time: (value: string) => timeStringToSeconds(value) !== null || 'Use HH:MM format',
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <v-text-field
      v-model="openTime"
      label="Open time"
      placeholder="08:00"
      :rules="[rules.time]"
      hint="HH:MM (24h)"
      persistent-hint
    />
    <v-text-field
      v-model="closeTime"
      label="Close time"
      placeholder="17:00"
      :rules="[rules.time]"
      hint="HH:MM (24h)"
      persistent-hint
    />
  </div>
</template>

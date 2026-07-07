<script setup lang="ts">
interface Props {
  open: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [reason: string];
  cancel: [];
}>();

const reason = ref('');

const reset = (): void => {
  reason.value = '';
};

const close = (): void => {
  emit('update:open', false);
  emit('cancel');
  reset();
};

const confirm = (): void => {
  emit('confirm', reason.value.trim());
};

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      reset();
    }
  },
);
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="480"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card class="rounded-xl pa-6">
      <v-card-title class="text-lg font-semibold pa-0 mb-2">
        Cancel appointment
      </v-card-title>
      <v-card-text class="pa-0 mb-4 text-gray-600">
        Provide a reason for cancelling this appointment.
      </v-card-text>
      <v-textarea
        v-model="reason"
        label="Cancellation reason"
        rows="3"
        auto-grow
        :disabled="loading"
        class="mb-4"
      />
      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="close"
        >
          Close
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          :loading="loading"
          :disabled="!reason.trim()"
          @click="confirm"
        >
          Cancel appointment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

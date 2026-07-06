<script setup lang="ts">
interface Props {
  open: boolean;
  title: string;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  submitLabel: 'Save',
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [];
  cancel: [];
}>();

const close = (): void => {
  emit('update:open', false);
  emit('cancel');
};

const handleSubmit = (): void => {
  emit('submit');
};
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="560"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card class="rounded-xl">
      <v-card-title class="text-lg font-semibold pa-6 pb-2">
        {{ title }}
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="handleSubmit">
          <slot />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

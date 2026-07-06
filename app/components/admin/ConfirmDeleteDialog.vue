<script setup lang="ts">
interface Props {
  open: boolean;
  entityName: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const close = (): void => {
  emit('update:open', false);
  emit('cancel');
};
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="440"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card class="rounded-xl pa-6">
      <v-card-title class="text-lg font-semibold pa-0 mb-2">
        Confirm delete
      </v-card-title>
      <v-card-text class="pa-0 mb-6 text-gray-600">
        Are you sure you want to delete <strong>{{ entityName }}</strong>? This action cannot be undone.
      </v-card-text>
      <v-card-actions class="pa-0">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          :loading="loading"
          @click="emit('confirm')"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

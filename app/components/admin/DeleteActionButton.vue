<script setup lang="ts">
interface Props {
  canDelete: boolean;
  disabledReason?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabledReason: 'Cannot delete while in use.',
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = (): void => {
  if (props.canDelete) {
    emit('click');
  }
};
</script>

<template>
  <v-tooltip
  :text="disabledReason"
  :disabled="canDelete"
  >
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        icon="mdi-delete"
        variant="text"
        color="error"
        size="small"
        :disabled="!canDelete"
        @click="handleClick"
      />
    </template>
  </v-tooltip>
</template>

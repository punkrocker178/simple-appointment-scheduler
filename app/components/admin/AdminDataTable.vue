<script setup lang="ts" generic="T">
interface Header {
  title: string;
  key: string;
  sortable?: boolean;
}

interface Props {
  items: T[];
  headers: Header[];
  loading?: boolean;
  itemKey?: string;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  itemKey: 'id',
});
</script>

<template>
  <v-data-table
    :items="items"
    :headers="headers"
    :loading="loading"
    :item-value="itemKey"
    class="rounded-lg border border-gray-200"
    hover
  >
    <template #no-data>
      <div class="py-8 text-center text-gray-500">
        <slot name="empty">
          No records found.
        </slot>
      </div>
    </template>

    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
  </v-data-table>
</template>

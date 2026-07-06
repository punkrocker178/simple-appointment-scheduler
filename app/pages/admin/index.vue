<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
});

const { email, role } = useAuth();
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
      Admin
    </h1>
    <p class="text-gray-600">
      Signed in as {{ email }} ({{ role }}). Entity management pages arrive in the next phase.
    </p>
  </div>
</template>

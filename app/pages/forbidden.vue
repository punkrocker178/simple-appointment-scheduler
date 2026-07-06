<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
});

const { email, logout } = useAuth();

const handleLogout = async (): Promise<void> => {
  await logout();
  await navigateTo('/login');
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6">
    <v-card class="w-full max-w-md p-6 rounded-xl text-center">
      <v-icon
        icon="mdi-lock"
        size="48"
        color="warning"
        class="mb-4"
      />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Access denied
      </h1>
      <p class="text-gray-600 mb-2">
        Your account does not have permission to view admin pages.
      </p>
      <p
        v-if="email"
        class="text-sm text-gray-500 mb-6"
      >
        Signed in as {{ email }}
      </p>
      <div class="flex flex-col gap-3">
        <v-btn
          color="primary"
          variant="outlined"
          block
          @click="handleLogout"
        >
          Sign out
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

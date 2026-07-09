<script setup lang="ts">
const route = useRoute();
const { email, role, isAuthenticated, logout } = useAuth();

const showNav = computed((): boolean => {
  return !['/login', '/register'].includes(route.path);
});

const isCustomer = computed((): boolean => role.value === 'User');

const handleLogout = async (): Promise<void> => {
  await logout();
  await navigateTo('/login');
};
</script>

<template>
  <v-app theme="light">
    <v-app-bar
      v-if="showNav"
      color="white"
      elevation="1"
      class="border-b border-gray-200"
      data-testid="default-nav"
    >
      <v-app-bar-title class="text-base font-semibold text-gray-900">
        Universal Scheduler
      </v-app-bar-title>

      <v-spacer />

      <template v-if="isAuthenticated">
        <template v-if="isCustomer">
          <NuxtLink
            to="/booking-start"
            class="text-sm text-gray-700 hover:text-gray-900 mr-4"
            data-testid="nav-book-link"
          >
            Book
          </NuxtLink>
          <NuxtLink
            to="/my-appointments"
            class="text-sm text-gray-700 hover:text-gray-900 mr-4"
            data-testid="nav-my-appointments-link"
          >
            My appointments
          </NuxtLink>
        </template>
        <span
          class="text-sm text-gray-600 mr-4 hidden sm:inline"
          data-testid="nav-user-email"
        >
          {{ email }}
        </span>
        <v-btn
          variant="text"
          size="small"
          data-testid="nav-logout"
          @click="handleLogout"
        >
          Sign out
        </v-btn>
      </template>
      <template v-else>
        <NuxtLink
          to="/login"
          class="text-sm text-gray-700 hover:text-gray-900 mr-4"
          data-testid="nav-login-link"
        >
          Sign in
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          data-testid="nav-register-link"
        >
          Register
        </NuxtLink>
      </template>
    </v-app-bar>

    <v-main class="bg-gray-50">
      <div class="min-h-screen">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

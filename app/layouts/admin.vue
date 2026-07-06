<script setup lang="ts">
const route = useRoute();
const { email, role, hasPermission, logout } = useAuth();
const { notification, clear } = useAppNotification();
const snackbarOpen = computed({
  get: () => notification.value !== null,
  set: (open: boolean) => {
    if (!open) {
      clear();
    }
  },
});

interface NavItem {
  title: string;
  to: string;
  permission?: string;
  icon: string;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', to: '/admin', icon: 'mdi-view-dashboard' },
  { title: 'Dealerships', to: '/admin/dealerships', permission: 'dealerships:read', icon: 'mdi-store' },
  { title: 'Skills', to: '/admin/skills', permission: 'skills:read', icon: 'mdi-wrench' },
  { title: 'Customers', to: '/admin/customers', permission: 'customers:read', icon: 'mdi-account-group' },
];

const visibleNavItems = computed(() =>
  navItems.filter(item => !item.permission || hasPermission(item.permission)),
);

const isActive = (path: string): boolean => {
  if (path === '/admin') {
    return route.path === '/admin';
  }
  return route.path.startsWith(path);
};

const handleLogout = async (): Promise<void> => {
  await logout();
  await navigateTo('/login');
};
</script>

<template>
  <v-app theme="light">
    <v-navigation-drawer permanent width="200" class="border-r border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <h1 class="text-lg font-bold text-gray-900">
          Universal Scheduler
        </h1>
        <p class="text-xs text-gray-500 mt-1">
          Admin
        </p>
      </div>

      <v-list density="compact" nav class="py-2">
        <v-list-item v-for="item in visibleNavItems" :key="item.to" :to="item.to" :prepend-icon="item.icon"
          :title="item.title" :active="isActive(item.to)" rounded="lg" class="mx-2" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar flat border class="bg-white">
      <v-spacer />
      <div class="flex items-center gap-4 px-4">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-900">
            {{ email }}
          </p>
          <p class="text-xs text-gray-500">
            {{ role }}
          </p>
        </div>
        <v-btn variant="outlined" size="small" prepend-icon="mdi-logout" @click="handleLogout">
          Logout
        </v-btn>
      </div>
    </v-app-bar>

    <v-main class="bg-gray-50">
      <div class="p-6">
        <slot />
      </div>
    </v-main>

    <v-snackbar
      v-model="snackbarOpen"
      :color="notification?.color ?? 'error'"
      :timeout="5000"
      location="top"
    >
      {{ notification?.message }}
      <template #actions>
        <v-btn
          variant="text"
          @click="clear"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

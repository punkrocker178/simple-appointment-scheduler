<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
});

const { email, role, hasPermission } = useAuth();

interface DashboardCard {
  title: string;
  description: string;
  to: string;
  permission?: string;
  icon: string;
}

const cards: DashboardCard[] = [
  {
    title: 'Dealerships',
    description: 'Manage dealership locations, hours, and nested resources',
    to: '/admin/dealerships',
    permission: 'dealerships:read',
    icon: 'mdi-store',
  },
  {
    title: 'Skills',
    description: 'Manage technician skill catalog',
    to: '/admin/skills',
    permission: 'skills:read',
    icon: 'mdi-wrench',
  },
  {
    title: 'Customers',
    description: 'Manage customers and their vehicles',
    to: '/admin/customers',
    permission: 'customers:read',
    icon: 'mdi-account-group',
  },
];

const visibleCards = computed(() =>
  cards.filter(card => !card.permission || hasPermission(card.permission)),
);
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
      Dashboard
    </h1>
    <p class="text-gray-600 mb-8">
      Signed in as {{ email }} ({{ role }})
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <v-card
        v-for="card in visibleCards"
        :key="card.to"
        :to="card.to"
        class="p-6 rounded-xl hover:shadow-md transition-shadow"
        variant="outlined"
      >
        <div class="flex items-start gap-4">
          <v-icon :icon="card.icon" size="32" color="primary" />
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-1">
              {{ card.title }}
            </h2>
            <p class="text-sm text-gray-600">
              {{ card.description }}
            </p>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

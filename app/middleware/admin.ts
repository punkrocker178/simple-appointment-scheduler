export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  const canAccessAdmin
    = authStore.hasPermission('dealerships:read') || authStore.hasPermission('customers:read');

  if (!canAccessAdmin) {
    return navigateTo('/login');
  }
});

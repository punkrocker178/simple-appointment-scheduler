export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login') {
    return;
  }

  if (import.meta.server) {
    const tokenCookie = useCookie('auth-token');

    if (!tokenCookie.value) {
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});

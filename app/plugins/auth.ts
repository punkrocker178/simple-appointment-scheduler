/**
 * Auth bootstrap — hydrate session from httpOnly cookie via /api/auth/me.
 */
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  if (import.meta.server) {
    const tokenCookie = useCookie('auth-token');
    if (!tokenCookie.value) {
      authStore.clearSession();
      return;
    }
  }

  try {
    await authStore.fetchMe();
  }
  catch {
    authStore.clearSession();
  }
});

/**
 * useAuth - Thin wrapper around authStore for pages and middleware
 *
 * @returns Auth state, getters, and actions
 */
export function useAuth() {
  const store = useAuthStore();
  const {
    expiresAt,
    email,
    role,
    permissions,
    isLoading,
    error,
    isAuthenticated,
  } = storeToRefs(store);

  return {
    expiresAt,
    email,
    role,
    permissions,
    isLoading,
    error,
    isAuthenticated,
    hasPermission: store.hasPermission,
    login: store.login,
    logout: store.logout,
    fetchMe: store.fetchMe,
  };
}

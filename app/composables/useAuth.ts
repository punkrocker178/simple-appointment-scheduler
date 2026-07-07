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
    customerId,
    permissions,
    isLoading,
    error,
    isAuthenticated,
  } = storeToRefs(store);

  return {
    expiresAt,
    email,
    role,
    customerId,
    permissions,
    isLoading,
    error,
    isAuthenticated,
    hasPermission: store.hasPermission,
    login: store.login,
    register: store.register,
    logout: store.logout,
    fetchMe: store.fetchMe,
  };
}

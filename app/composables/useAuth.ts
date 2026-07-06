/**
 * useAuth - Thin wrapper around authStore for pages and middleware
 *
 * @returns Auth state, getters, and actions
 */
export function useAuth() {
  const store = useAuthStore();

  return {
    token: store.token,
    expiresAt: store.expiresAt,
    email: store.email,
    role: store.role,
    permissions: store.permissions,
    isLoading: store.isLoading,
    error: store.error,
    isAuthenticated: store.isAuthenticated,
    hasPermission: store.hasPermission,
    login: store.login,
    logout: store.logout,
    fetchMe: store.fetchMe,
  };
}

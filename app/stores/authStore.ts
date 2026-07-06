/**
 * Auth Store - Manages JWT authentication state and permissions
 *
 * JWT is stored in an httpOnly cookie by the Nitro BFF. This store holds
 * session metadata (email, role, permissions, expiry) synced via /api/auth/me.
 *
 * **State:**
 * - expiresAt: Token expiry (ISO string)
 * - email, role: User identity
 * - permissions: Permission names from /api/auth/me
 * - isLoading, error: Async operation state
 *
 * **Getters:**
 * - isAuthenticated: Session not expired (cookie + metadata)
 *
 * **Actions:**
 * - login(email, password): Authenticate via Nitro BFF (sets httpOnly cookie)
 * - fetchMe(): Load session from /api/auth/me
 * - logout(): Clear cookie and local session
 * - hasPermission(name): Check permission membership
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LoginResponse, MeBffResponse, ProblemDetails } from '~/types/api';

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('data' in error) {
      const data = (error as { data?: ProblemDetails }).data;
      if (data?.detail) {
        return data.detail;
      }
    }
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  return 'Request failed.';
}

async function authFetch<T>(url: string, options?: Record<string, unknown>): Promise<T> {
  if (import.meta.server) {
    return await useRequestFetch()(url, options) as T;
  }
  return await $fetch<T>(url, options as Parameters<typeof $fetch>[1]);
}

export const useAuthStore = defineStore('authStore', () => {
  const expiresAt = ref<string>('');
  const email = ref<string>('');
  const role = ref<string>('');
  const permissions = ref<string[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed((): boolean => {
    if (!expiresAt.value) {
      return false;
    }
    return new Date(expiresAt.value) > new Date();
  });

  const hasPermission = (name: string): boolean => {
    return permissions.value.includes(name);
  };

  const clearSession = (): void => {
    expiresAt.value = '';
    email.value = '';
    role.value = '';
    permissions.value = [];
    error.value = null;
  };

  const applyLoginResponse = (response: LoginResponse): void => {
    expiresAt.value = response.expiresAt;
    email.value = response.email;
    role.value = response.role;
    permissions.value = [];
  };

  const applyMeResponse = (response: MeBffResponse): void => {
    expiresAt.value = response.expiresAt;
    email.value = response.email;
    role.value = response.role;
    permissions.value = response.permissions;
  };

  const login = async (loginEmail: string, password: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password },
      });
      applyLoginResponse(response);
      await fetchMe();
    }
    catch (err) {
      error.value = extractErrorMessage(err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  };

  const fetchMe = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authFetch<MeBffResponse>('/api/auth/me');
      applyMeResponse(response);
    }
    catch (err) {
      const statusCode = err && typeof err === 'object' && 'statusCode' in err
        ? (err as { statusCode: number }).statusCode
        : undefined;
      if (statusCode === 401) {
        clearSession();
      }
      error.value = extractErrorMessage(err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    }
    catch {
      // Clear local session even if the logout request fails
    }
    clearSession();
  };

  return {
    expiresAt,
    email,
    role,
    permissions,
    isLoading,
    error,
    isAuthenticated,
    hasPermission,
    login,
    fetchMe,
    logout,
    clearSession,
  };
});

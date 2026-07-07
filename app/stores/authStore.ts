/**
 * Auth Store - Manages JWT authentication state and permissions
 *
 * JWT is stored in an httpOnly cookie by the Nitro BFF. This store holds
 * session metadata (email, role, permissions, expiry) synced via /api/auth/me.
 *
 * **State:**
 * - expiresAt: Token expiry (ISO string)
 * - email, role: User identity
 * - customerId: Linked customer profile (null for admin/staff without customer)
 * - permissions: Permission names from /api/auth/me
 * - isLoading, error: Async operation state
 *
 * **Getters:**
 * - isAuthenticated: Session not expired (cookie + metadata)
 *
 * **Actions:**
 * - login(email, password): Authenticate via Nitro BFF (sets httpOnly cookie)
 * - register(request): Register, auto-login, then fetchMe()
 * - fetchMe(): Load session from /api/auth/me
 * - logout(): Clear cookie and local session
 * - hasPermission(name): Check permission membership
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LoginResponse, MeBffResponse, RegisterRequest } from '~/types/api';
import { extractApiErrorMessage, getApiErrorStatusCode } from '~/utils/apiErrors';

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
  const customerId = ref<string | null>(null);
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
    customerId.value = null;
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
    customerId.value = response.customerId ?? null;
    permissions.value = response.permissions;
  };

  const register = async (request: RegisterRequest): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authFetch<LoginResponse>('/api/auth/register', {
        method: 'POST',
        body: request,
      });
      applyLoginResponse(response);
      await fetchMe();
    }
    catch (err) {
      error.value = extractApiErrorMessage(err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
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
      error.value = extractApiErrorMessage(err);
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
      if (getApiErrorStatusCode(err) === 401) {
        clearSession();
      }
      error.value = extractApiErrorMessage(err);
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
    customerId,
    permissions,
    isLoading,
    error,
    isAuthenticated,
    hasPermission,
    login,
    register,
    fetchMe,
    logout,
    clearSession,
  };
});

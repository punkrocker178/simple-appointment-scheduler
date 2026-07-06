/**
 * Auth Store - Manages JWT authentication state and permissions
 *
 * **State:**
 * - token: JWT access token
 * - expiresAt: Token expiry (ISO string)
 * - email, role: User identity from login
 * - permissions: Permission names from /api/auth/me
 * - isLoading, error: Async operation state
 *
 * **Getters:**
 * - isAuthenticated: Token present and not expired
 *
 * **Actions:**
 * - login(email, password): Authenticate via Nitro BFF
 * - fetchMe(): Load permissions from /api/auth/me
 * - logout(): Clear session
 * - hasPermission(name): Check permission membership
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import type { AuthResponse, MeResponse, ProblemDetails } from '~/types/api';

const AUTH_STORAGE_KEY = 'auth-session';

interface AuthSession {
  token: string;
  expiresAt: string;
  email: string;
  role: string;
  permissions: string[];
}

const emptySession = (): AuthSession => ({
  token: '',
  expiresAt: '',
  email: '',
  role: '',
  permissions: [],
});

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

export const useAuthStore = defineStore('authStore', () => {
  const session = useStorage<AuthSession>(AUTH_STORAGE_KEY, emptySession(), localStorage);

  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const token = computed(() => session.value.token);
  const expiresAt = computed(() => session.value.expiresAt);
  const email = computed(() => session.value.email);
  const role = computed(() => session.value.role);
  const permissions = computed(() => session.value.permissions);

  const isAuthenticated = computed((): boolean => {
    if (!session.value.token || !session.value.expiresAt) {
      return false;
    }
    return new Date(session.value.expiresAt) > new Date();
  });

  const hasPermission = (name: string): boolean => {
    return session.value.permissions.includes(name);
  };

  const applyAuthResponse = (response: AuthResponse): void => {
    session.value = {
      ...session.value,
      token: response.token,
      expiresAt: response.expiresAt,
      email: response.email,
      role: response.role,
      permissions: [],
    };
  };

  const applyMeResponse = (response: MeResponse): void => {
    session.value = {
      ...session.value,
      email: response.email,
      role: response.role,
      permissions: response.permissions,
    };
  };

  const login = async (loginEmail: string, password: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password },
      });
      applyAuthResponse(response);
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
    if (!session.value.token) {
      return;
    }
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<MeResponse>('/api/auth/me', {
        headers: { Authorization: `Bearer ${session.value.token}` },
      });
      applyMeResponse(response);
    }
    catch (err) {
      const statusCode = err && typeof err === 'object' && 'statusCode' in err
        ? (err as { statusCode: number }).statusCode
        : undefined;
      if (statusCode === 401) {
        logout();
      }
      error.value = extractErrorMessage(err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  };

  const logout = (): void => {
    session.value = emptySession();
    error.value = null;
  };

  return {
    token,
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
  };
});

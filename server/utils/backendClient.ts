import type { H3Event } from 'h3';
import { extractApiErrorMessage } from '~/utils/apiErrors';
import { getTokenFromCookies } from './authCookies';

export interface BackendFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const config = useRuntimeConfig();
  const url = `${config.apiBaseUrl}${path}`;

  try {
    return await $fetch<T>(url, {
      method: options.method ?? 'GET',
      body: options.body,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
  catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const fetchError = error as {
        statusCode?: number;
        statusMessage?: string;
        data?: unknown;
      };
      const statusCode = fetchError.statusCode ?? 500;
      const message = extractApiErrorMessage(
        { data: fetchError.data, statusMessage: fetchError.statusMessage },
        fetchError.statusMessage ?? 'Request failed.',
      );
      throw createError({ statusCode, message });
    }
    throw createError({ statusCode: 500, message: 'Request failed.' });
  }
}

export function getBearerToken(event: H3Event): string | null {
  const cookieToken = getTokenFromCookies(event);
  if (cookieToken) {
    return `Bearer ${cookieToken}`;
  }

  const authorization = getHeader(event, 'authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  return authorization;
}

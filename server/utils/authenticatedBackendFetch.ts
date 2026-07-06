import type { H3Event } from 'h3';
import { backendFetch, getBearerToken, type BackendFetchOptions } from './backendClient';

export async function authenticatedBackendFetch<T>(
  event: H3Event,
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const authorization = getBearerToken(event);
  if (!authorization) {
    throw createError({ statusCode: 401, message: 'Not authenticated.' });
  }

  return backendFetch<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: authorization,
    },
  });
}

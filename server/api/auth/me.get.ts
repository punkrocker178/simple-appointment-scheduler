import type { MeResponse } from '~/types/api';
import { backendFetch, getBearerToken } from '../../utils/backendClient';

export default defineEventHandler(async (event) => {
  const authorization = getBearerToken(event);
  if (!authorization) {
    throw createError({ statusCode: 401, message: 'Authorization header is required.' });
  }

  return backendFetch<MeResponse>('/api/auth/me', {
    headers: { Authorization: authorization },
  });
});

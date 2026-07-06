import type { MeResponse } from '~/types/api';
import { getExpiresAtFromToken, getTokenFromCookies } from '../../utils/authCookies';
import { backendFetch, getBearerToken } from '../../utils/backendClient';

export default defineEventHandler(async (event) => {
  const authorization = getBearerToken(event);
  if (!authorization) {
    throw createError({ statusCode: 401, message: 'Not authenticated.' });
  }

  const me = await backendFetch<MeResponse>('/api/auth/me', {
    headers: { Authorization: authorization },
  });

  const token = getTokenFromCookies(event);
  const expiresAt = token ? getExpiresAtFromToken(token) ?? '' : '';

  return {
    ...me,
    expiresAt,
  };
});

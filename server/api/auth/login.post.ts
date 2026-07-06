import type { AuthResponse, LoginRequest } from '~/types/api';
import { backendFetch } from '../../utils/backendClient';

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequest>(event);
  return backendFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
  });
});

import type { AuthResponse, LoginRequest, LoginResponse } from '~/types/api';
import { setAuthCookies } from '../../utils/authCookies';
import { backendFetch } from '../../utils/backendClient';

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequest>(event);
  const auth = await backendFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
  });

  setAuthCookies(event, auth);

  const response: LoginResponse = {
    expiresAt: auth.expiresAt,
    email: auth.email,
    role: auth.role,
  };
  return response;
});

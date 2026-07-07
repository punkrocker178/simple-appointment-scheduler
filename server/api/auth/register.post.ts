import type { AuthResponse, LoginResponse, RegisterRequest } from '~/types/api';
import { setAuthCookies } from '../../utils/authCookies';
import { backendFetch } from '../../utils/backendClient';

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterRequest>(event);

  await backendFetch('/api/auth/register', {
    method: 'POST',
    body,
  });

  const auth = await backendFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email: body.email, password: body.password },
  });

  setAuthCookies(event, auth);

  const response: LoginResponse = {
    expiresAt: auth.expiresAt,
    email: auth.email,
    role: auth.role,
  };
  return response;
});

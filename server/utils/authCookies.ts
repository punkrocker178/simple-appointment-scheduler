import type { H3Event } from 'h3';
import type { AuthResponse } from '~/types/api';

export const AUTH_TOKEN_COOKIE = 'auth-token';

function cookieMaxAge(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

const baseCookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export function setAuthCookies(event: H3Event, auth: AuthResponse): void {
  setCookie(event, AUTH_TOKEN_COOKIE, auth.token, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: cookieMaxAge(auth.expiresAt),
  });
}

export function clearAuthCookies(event: H3Event): void {
  deleteCookie(event, AUTH_TOKEN_COOKIE, { path: '/' });
}

export function getTokenFromCookies(event: H3Event): string | null {
  return getCookie(event, AUTH_TOKEN_COOKIE) ?? null;
}

export function getExpiresAtFromToken(token: string): string | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    if (typeof payload.exp !== 'number') {
      return null;
    }
    return new Date(payload.exp * 1000).toISOString();
  }
  catch {
    return null;
  }
}

export function isAuthCookieValid(event: H3Event): boolean {
  return !!getTokenFromCookies(event);
}

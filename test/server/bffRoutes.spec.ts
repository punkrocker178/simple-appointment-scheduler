/**
 * BFF route handler tests — register, booking, and me proxies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';

const backendFetchMock = vi.fn();
const setAuthCookiesMock = vi.fn();
const authenticatedBackendFetchMock = vi.fn();
const readBodyMock = vi.fn();
const getQueryMock = vi.fn();
const getRouterParamMock = vi.fn();

vi.mock('../../server/utils/backendClient', () => ({
  backendFetch: (...args: unknown[]) => backendFetchMock(...args),
}));

vi.mock('../../server/utils/authCookies', () => ({
  setAuthCookies: (...args: unknown[]) => setAuthCookiesMock(...args),
}));

vi.mock('../../server/utils/authenticatedBackendFetch', () => ({
  authenticatedBackendFetch: (...args: unknown[]) => authenticatedBackendFetchMock(...args),
}));

vi.stubGlobal('readBody', readBodyMock);
vi.stubGlobal('getQuery', getQueryMock);
vi.stubGlobal('getRouterParam', getRouterParamMock);
vi.stubGlobal('defineEventHandler', <T extends (event: H3Event) => unknown>(handler: T) => handler);

const event = {} as H3Event;

describe('auth register BFF', () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
    setAuthCookiesMock.mockReset();
    readBodyMock.mockReset();
  });

  it('registers, auto-logs in, and sets auth cookies', async () => {
    const registerBody = {
      email: 'customer@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    };
    const authResponse = {
      token: 'jwt-token',
      expiresAt: '2099-01-01T00:00:00.000Z',
      email: 'customer@example.com',
      role: 'User',
    };

    readBodyMock.mockResolvedValue(registerBody);
    backendFetchMock
      .mockResolvedValueOnce({ email: 'customer@example.com', role: 'User' })
      .mockResolvedValueOnce(authResponse);

    const handler = (await import('../../server/api/auth/register.post')).default;
    const result = await handler(event);

    expect(backendFetchMock).toHaveBeenNthCalledWith(1, '/api/auth/register', {
      method: 'POST',
      body: registerBody,
    });
    expect(backendFetchMock).toHaveBeenNthCalledWith(2, '/api/auth/login', {
      method: 'POST',
      body: { email: registerBody.email, password: registerBody.password },
    });
    expect(setAuthCookiesMock).toHaveBeenCalledWith(event, authResponse);
    expect(result).toEqual({
      expiresAt: authResponse.expiresAt,
      email: authResponse.email,
      role: authResponse.role,
    });
  });
});

describe('authenticated booking and me BFF routes', () => {
  beforeEach(() => {
    authenticatedBackendFetchMock.mockReset();
    readBodyMock.mockReset();
    getQueryMock.mockReset();
    getRouterParamMock.mockReset();
    authenticatedBackendFetchMock.mockResolvedValue({ ok: true });
  });

  it('forwards service-types request with auth', async () => {
    authenticatedBackendFetchMock
      .mockResolvedValueOnce({ dealershipId: 'dealership-1', dealershipName: 'Test Dealership' })
      .mockResolvedValueOnce([]);

    const handler = (await import('../../server/api/booking/service-types.get')).default;
    const result = await handler(event);

    expect(authenticatedBackendFetchMock).toHaveBeenNthCalledWith(1, event, '/api/booking/dealership');
    expect(authenticatedBackendFetchMock).toHaveBeenNthCalledWith(2, event, '/api/dealerships/dealership-1/service-types');
    expect(result).toEqual({
      dealershipId: 'dealership-1',
      dealershipName: 'Test Dealership',
      serviceTypes: [],
    });
  });

  it('forwards availability query params with auth', async () => {
    getQueryMock.mockReturnValue({
      dealershipId: 'dealership-1',
      serviceTypeId: 'service-1',
      date: '2026-07-07',
    });

    const handler = (await import('../../server/api/booking/availability.get')).default;
    await handler(event);

    expect(authenticatedBackendFetchMock).toHaveBeenCalledWith(
      event,
      '/api/availability?dealershipId=dealership-1&serviceTypeId=service-1&date=2026-07-07',
    );
  });

  it('forwards appointment creation with auth', async () => {
    const body = { customerId: 'c1', vehicleId: 'v1' };
    readBodyMock.mockResolvedValue(body);

    const handler = (await import('../../server/api/booking/appointments.post')).default;
    await handler(event);

    expect(authenticatedBackendFetchMock).toHaveBeenCalledWith(event, '/api/appointments', {
      method: 'POST',
      body,
    });
  });

  it('forwards me customer and vehicles routes with auth', async () => {
    const customerGet = (await import('../../server/api/me/customer.get')).default;
    await customerGet(event);
    expect(authenticatedBackendFetchMock).toHaveBeenCalledWith(event, '/api/me/customer');

    const vehiclesGet = (await import('../../server/api/me/vehicles/index.get')).default;
    await vehiclesGet(event);
    expect(authenticatedBackendFetchMock).toHaveBeenCalledWith(event, '/api/me/vehicles');

    const appointmentsGet = (await import('../../server/api/me/appointments.get')).default;
    await appointmentsGet(event);
    expect(authenticatedBackendFetchMock).toHaveBeenCalledWith(event, '/api/me/appointments');
  });

  it('forwards vehicle update with auth', async () => {
    getRouterParamMock.mockReturnValue('vehicle-1');
    readBodyMock.mockResolvedValue({ make: 'Toyota', model: 'Camry', year: 2024 });

    const handler = (await import('../../server/api/me/vehicles/[id].put')).default;
    await handler(event);

    expect(authenticatedBackendFetchMock).toHaveBeenCalledWith(
      event,
      '/api/me/vehicles/vehicle-1',
      {
        method: 'PUT',
        body: { make: 'Toyota', model: 'Camry', year: 2024 },
      },
    );
  });
});

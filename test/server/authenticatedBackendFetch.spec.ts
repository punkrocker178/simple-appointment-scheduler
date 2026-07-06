/**
 * authenticatedBackendFetch Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const backendFetchMock = vi.fn();
const getBearerTokenMock = vi.fn();

vi.mock('../../server/utils/backendClient', () => ({
  backendFetch: (...args: unknown[]) => backendFetchMock(...args),
  getBearerToken: (...args: unknown[]) => getBearerTokenMock(...args),
}));

const createErrorMock = vi.fn((input: { statusCode: number, message: string }) => {
  const error = new Error(input.message) as Error & { statusCode: number };
  error.statusCode = input.statusCode;
  return error;
});

vi.stubGlobal('createError', createErrorMock);

describe('authenticatedBackendFetch', () => {
  beforeEach(() => {
    backendFetchMock.mockReset();
    getBearerTokenMock.mockReset();
    createErrorMock.mockClear();
  });

  it('returns 401 when no bearer token is present', async () => {
    getBearerTokenMock.mockReturnValue(null);
    const event = {} as import('h3').H3Event;

    const { authenticatedBackendFetch } = await import('../../server/utils/authenticatedBackendFetch');

    await expect(authenticatedBackendFetch(event, '/api/skills')).rejects.toMatchObject({
      message: 'Not authenticated.',
      statusCode: 401,
    });
    expect(backendFetchMock).not.toHaveBeenCalled();
  });

  it('forwards Authorization header to backendFetch', async () => {
    getBearerTokenMock.mockReturnValue('Bearer test-token');
    backendFetchMock.mockResolvedValue([{ id: '1', name: 'Brakes' }]);
    const event = {} as import('h3').H3Event;

    const { authenticatedBackendFetch } = await import('../../server/utils/authenticatedBackendFetch');
    const result = await authenticatedBackendFetch(event, '/api/skills');

    expect(backendFetchMock).toHaveBeenCalledWith('/api/skills', {
      headers: { Authorization: 'Bearer test-token' },
    });
    expect(result).toEqual([{ id: '1', name: 'Brakes' }]);
  });
});

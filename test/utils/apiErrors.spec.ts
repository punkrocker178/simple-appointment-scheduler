import { describe, it, expect } from 'vitest';
import {
  ApiError,
  extractApiErrorMessage,
  getApiErrorStatusCode,
  permissionDeniedMessage,
  toApiError,
} from '~/utils/apiErrors';

describe('apiErrors', () => {
  describe('extractApiErrorMessage', () => {
    it('prefers ProblemDetails detail', () => {
      const message = extractApiErrorMessage({
        data: { detail: 'Email already exists.', title: 'Conflict' },
      });
      expect(message).toBe('Email already exists.');
    });

    it('falls back to ProblemDetails title', () => {
      const message = extractApiErrorMessage({
        data: { title: 'Not Found' },
      });
      expect(message).toBe('Not Found');
    });

    it('reads nested data.message', () => {
      const message = extractApiErrorMessage({
        data: { message: 'Server unavailable' },
      });
      expect(message).toBe('Server unavailable');
    });

    it('reads top-level message', () => {
      expect(extractApiErrorMessage({ message: 'Network error' })).toBe('Network error');
    });

    it('reads statusMessage', () => {
      expect(extractApiErrorMessage({ statusMessage: 'Bad Request' })).toBe('Bad Request');
    });

    it('returns fallback for unknown errors', () => {
      expect(extractApiErrorMessage(null)).toBe('Request failed.');
      expect(extractApiErrorMessage({}, 'Custom fallback')).toBe('Custom fallback');
    });

    it('returns ApiError message directly', () => {
      const error = new ApiError('Already mapped', 400);
      expect(extractApiErrorMessage(error)).toBe('Already mapped');
    });
  });

  describe('getApiErrorStatusCode', () => {
    it('reads statusCode from fetch errors', () => {
      expect(getApiErrorStatusCode({ statusCode: 403 })).toBe(403);
    });

    it('reads statusCode from ApiError', () => {
      expect(getApiErrorStatusCode(new ApiError('Denied', 403))).toBe(403);
    });
  });

  describe('toApiError', () => {
    it('maps 403 to permission denied message', () => {
      const error = toApiError({ statusCode: 403, data: { detail: 'Forbidden' } });
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe(permissionDeniedMessage());
      expect(error.statusCode).toBe(403);
    });

    it('preserves detail for other status codes', () => {
      const error = toApiError({ statusCode: 400, data: { detail: 'Invalid input.' } });
      expect(error.message).toBe('Invalid input.');
      expect(error.statusCode).toBe(400);
    });
  });
});

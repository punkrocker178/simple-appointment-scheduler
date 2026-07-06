import type { ProblemDetails } from '~/types/api';

const DEFAULT_MESSAGE = 'Request failed.';
const PERMISSION_DENIED_MESSAGE = 'You do not have permission to perform this action.';

export class ApiError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

function readProblemDetails(data: unknown): ProblemDetails | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  return data as ProblemDetails;
}

/**
 * Extract a user-facing message from a fetch/Nitro error or ProblemDetails payload.
 * Prefers `detail`, then `title`, then `message`, then statusMessage.
 */
export function extractApiErrorMessage(
  error: unknown,
  fallback = DEFAULT_MESSAGE,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    if ('data' in error) {
      const data = (error as { data?: unknown }).data;
      const problem = readProblemDetails(data);
      if (problem?.detail) {
        return problem.detail;
      }
      if (problem?.title) {
        return problem.title;
      }
      if (data && typeof data === 'object' && 'message' in data) {
        const message = (data as { message: unknown }).message;
        if (typeof message === 'string' && message.length > 0) {
          return message;
        }
      }
    }

    if ('message' in error) {
      const message = (error as { message: unknown }).message;
      if (typeof message === 'string' && message.length > 0 && message !== 'Request failed.') {
        return message;
      }
    }

    if ('statusMessage' in error) {
      const statusMessage = (error as { statusMessage: unknown }).statusMessage;
      if (typeof statusMessage === 'string' && statusMessage.length > 0) {
        return statusMessage;
      }
    }
  }

  return fallback;
}

export function getApiErrorStatusCode(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.statusCode;
  }
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: unknown }).statusCode;
    return typeof statusCode === 'number' ? statusCode : undefined;
  }
  return undefined;
}

export function permissionDeniedMessage(): string {
  return PERMISSION_DENIED_MESSAGE;
}

export function toApiError(error: unknown, fallback = DEFAULT_MESSAGE): ApiError {
  const statusCode = getApiErrorStatusCode(error);
  const message = statusCode === 403
    ? PERMISSION_DENIED_MESSAGE
    : extractApiErrorMessage(error, fallback);
  return new ApiError(message, statusCode);
}

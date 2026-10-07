export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'NOT_FOUND'
  | 'PAYLOAD_TOO_LARGE'
  | 'QUOTA_EXCEEDED'
  | 'REQUEST_IN_PROGRESS'
  | 'HINT_LIMIT_REACHED'
  | 'AI_INVALID_OUTPUT'
  | 'HINT_UNAVAILABLE'
  | 'AI_UNAVAILABLE'
  | 'AI_DISABLED'
  | 'AI_TIMEOUT'
  | 'INTERNAL';

export interface ErrorDefinition {
  status: number;
  message: string;
}

export const ERROR_CATALOG: Record<ErrorCode, ErrorDefinition> = {
  VALIDATION_ERROR: {
    status: 400,
    message: 'Invalid request data or parameters.',
  },
  UNAUTHENTICATED: {
    status: 401,
    message: 'You must be signed in to perform this action.',
  },
  NOT_FOUND: {
    status: 404,
    message: 'The requested resource was not found.',
  },
  PAYLOAD_TOO_LARGE: {
    status: 413,
    message: 'The code or input provided exceeds maximum allowed limits.',
  },
  QUOTA_EXCEEDED: {
    status: 429,
    message: 'Daily AI usage quota reached for your account.',
  },
  REQUEST_IN_PROGRESS: {
    status: 429,
    message: 'An analysis is currently in progress for your account. Please wait.',
  },
  HINT_LIMIT_REACHED: {
    status: 409,
    message: 'Maximum hint level reached for this session.',
  },
  AI_INVALID_OUTPUT: {
    status: 502,
    message: 'The AI model generated an invalid or malformed output.',
  },
  HINT_UNAVAILABLE: {
    status: 502,
    message: 'A spoiler-free hint could not be generated at this time.',
  },
  AI_UNAVAILABLE: {
    status: 503,
    message: 'The AI service is temporarily unavailable. Please try again shortly.',
  },
  AI_DISABLED: {
    status: 503,
    message: 'AI analysis is currently disabled by administrator or global quota.',
  },
  AI_TIMEOUT: {
    status: 504,
    message: 'AI request timed out. Please try a shorter snippet.',
  },
  INTERNAL: {
    status: 500,
    message: 'An unexpected internal error occurred.',
  },
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;

  constructor(code: ErrorCode, customMessage?: string) {
    const def = ERROR_CATALOG[code] || ERROR_CATALOG.INTERNAL;
    super(customMessage || def.message);
    this.name = 'AppError';
    this.code = code;
    this.status = def.status;
  }
}

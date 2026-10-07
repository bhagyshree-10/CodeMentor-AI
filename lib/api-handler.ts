import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './errors';
import { logger } from './logger';
import { env } from './env';
import { LIMITS } from './constants';

export type ApiHandler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export function withApi(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, context?: any) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const method = req.method.toUpperCase();

    try {
      // Security checks for mutating requests (POST, PATCH, DELETE, PUT)
      if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
        // 1. Origin header check
        const origin = req.headers.get('origin');
        if (origin && env.NODE_ENV === 'production' && !origin.startsWith(env.APP_ORIGIN)) {
          throw new AppError('VALIDATION_ERROR', 'Origin mismatch / CSRF protection');
        }

        // 2. Content-Type check for JSON payloads
        const contentType = req.headers.get('content-type');
        if (method !== 'DELETE' && (!contentType || !contentType.includes('application/json'))) {
          throw new AppError('VALIDATION_ERROR', 'Content-Type must be application/json');
        }

        // 3. Body size check
        const contentLength = req.headers.get('content-length');
        if (contentLength && parseInt(contentLength, 10) > LIMITS.MAX_BODY_SIZE_BYTES) {
          throw new AppError('PAYLOAD_TOO_LARGE');
        }
      }

      const response = await handler(req, context);
      return response;
    } catch (err: any) {
      if (err instanceof AppError) {
        logger.warn(`API AppError [${err.code}]`, { requestId, path: req.nextUrl.pathname, code: err.code });
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: err.code,
              message: err.message,
              requestId,
            },
          },
          { status: err.status }
        );
      }

      logger.error(`Unhandled API Error`, { requestId, path: req.nextUrl.pathname, error: err?.message || String(err) });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INTERNAL',
            message: 'An unexpected internal error occurred.',
            requestId,
          },
        },
        { status: 500 }
      );
    }
  };
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

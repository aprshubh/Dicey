import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../errors/apiError';
import { HttpStatus } from '../constants/httpStatus';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    error = new ApiError(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Validation failed',
      formattedErrors
    );
  } else if ((err as MongoDuplicateKeyError)?.code === 11000) {
    const keys = Object.keys((err as MongoDuplicateKeyError).keyValue || {});
    const fieldName = keys.length ? keys[0] : 'field';
    error = new ApiError(
      HttpStatus.CONFLICT,
      `A record with this ${fieldName} already exists.`
    );
  } else if ((err as Error)?.name === 'CastError') {
    error = new ApiError(HttpStatus.BAD_REQUEST, 'Invalid resource identifier format');
  } else if ((err as Error)?.name === 'JsonWebTokenError') {
    error = new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token');
  } else if ((err as Error)?.name === 'TokenExpiredError') {
    error = new ApiError(HttpStatus.UNAUTHORIZED, 'Token has expired');
  } else {
    // Unhandled / Internal Error
    const message = (err as Error)?.message || 'Internal server error';
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
    error = new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : message,
      undefined,
      false,
      (err as Error)?.stack || ''
    );
  }

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

import { HttpStatusCode, HttpStatus } from '../constants/httpStatus';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string = 'Something went wrong',
    errors?: unknown[],
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, errors?: unknown[]): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized access'): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message);
  }

  static forbidden(message: string = 'Forbidden resource'): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, message);
  }

  static conflict(message: string = 'Resource already exists'): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message);
  }

  static unprocessableEntity(message: string, errors?: unknown[]): ApiError {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, errors);
  }

  static tooManyRequests(message: string = 'Too many requests, please try again later'): ApiError {
    return new ApiError(HttpStatus.TOO_MANY_REQUESTS, message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, undefined, false);
  }
}

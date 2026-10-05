import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';
import { ApiError } from '../errors/apiError';
import { HttpStatus } from '../constants/httpStatus';

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(HttpStatus.TOO_MANY_REQUESTS, 'Too many requests from this IP, please try again later.'));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // 20 requests per 15 minutes for sensitive auth routes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(HttpStatus.TOO_MANY_REQUESTS, 'Too many authentication attempts, please try again after 15 minutes.'));
  },
});

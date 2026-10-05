import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const mongoIdParamSchema = (paramName: string = 'id') =>
  z.object({
    [paramName]: z
      .string()
      .regex(mongoIdRegex, `Invalid ${paramName} format. Must be a valid 24-character ObjectId`),
  });

export const recipientParamSchema = z.object({
  recipientId: z
    .string()
    .regex(mongoIdRegex, 'Invalid recipientId format. Must be a valid 24-character ObjectId'),
});

export const requestIdParamSchema = z.object({
  requestId: z
    .string()
    .regex(mongoIdRegex, 'Invalid requestId format. Must be a valid 24-character ObjectId'),
});

export const targetUserParamSchema = z.object({
  targetUserId: z
    .string()
    .regex(mongoIdRegex, 'Invalid targetUserId format. Must be a valid 24-character ObjectId'),
});

export const friendIdParamSchema = z.object({
  friendId: z
    .string()
    .regex(mongoIdRegex, 'Invalid friendId format. Must be a valid 24-character ObjectId'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
});

export const searchUsersQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Search query must be at least 1 character long')
    .max(50, 'Search query cannot exceed 50 characters'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

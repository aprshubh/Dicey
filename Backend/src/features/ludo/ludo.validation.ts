import { z } from 'zod';

export const createRoomSchema = z.object({
  maxPlayers: z.union([z.literal(2), z.literal(4)]).default(4),
  gameMode: z.enum(['CLASSIC', 'QUICK']).default('CLASSIC'),
});

export const roomCodeParamSchema = z.object({
  roomCode: z
    .string()
    .trim()
    .length(6, 'Room code must be exactly 6 characters long')
    .toUpperCase(),
});

export const moveTokenSchema = z.object({
  tokenId: z
    .number()
    .int('Token ID must be an integer')
    .min(0, 'Token ID must be between 0 and 3')
    .max(3, 'Token ID must be between 0 and 3'),
});

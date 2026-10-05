import { Router } from 'express';
import * as ludoController from './ludo.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validateRequest } from '../../shared/middlewares/validate.middleware';
import {
  createRoomSchema,
  roomCodeParamSchema,
  moveTokenSchema,
} from './ludo.validation';

const router = Router();

// All Ludo gameplay routes require authentication
router.use(authenticate);

// 1. Room Creation & Matchmaking
router.post(
  '/rooms',
  validateRequest({ body: createRoomSchema }),
  ludoController.createRoom
);

router.post(
  '/rooms/:roomCode/join',
  validateRequest({ params: roomCodeParamSchema }),
  ludoController.joinRoom
);

router.post(
  '/rooms/:roomCode/start',
  validateRequest({ params: roomCodeParamSchema }),
  ludoController.startGame
);

router.post(
  '/rooms/:roomCode/leave',
  validateRequest({ params: roomCodeParamSchema }),
  ludoController.leaveRoom
);

// 2. Gameplay Actions (Dice Roll & Token Move)
router.post(
  '/rooms/:roomCode/roll',
  validateRequest({ params: roomCodeParamSchema }),
  ludoController.rollDice
);

router.post(
  '/rooms/:roomCode/move',
  validateRequest({ params: roomCodeParamSchema, body: moveTokenSchema }),
  ludoController.moveToken
);

// 3. State Inquiries
router.get(
  '/rooms/:roomCode',
  validateRequest({ params: roomCodeParamSchema }),
  ludoController.getGameState
);

export default router;
